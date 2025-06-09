---
title: 실무에서 만났던 이슈들 모아보기
date: 2025-06-02
comments: true
categories:
  - issues
  - jpa
tags:
  - jpa
---

## 목차
1. [JPA Lazy Loading과 다중 Fetch Join의 한계](#1-jpa-lazy-loading과-다중-fetch-join의-한계)
2. [재귀 구조에서의 JPA 한계와 해결방법](#2-재귀-구조에서의-jpa-한계와-해결방법)
3. [순환 참조 문제와 @JsonIgnore](#3-순환-참조-문제와-jsonignore)
4. [@JsonManagedReference와 @JsonBackReference](#4-jsonmanagedreference와-jsonbackreference)

---

## 1. JPA Lazy Loading과 다중 Fetch Join의 한계

### 문제 상황

JPA에서 연관관계가 있는 엔티티를 조회할 때 N+1 문제를 해결하기 위해 **Fetch Join**을 자주 사용합니다.  
그런데 두 개 이상의 컬렉션을 동시에 Fetch Join하면 **MultipleBagFetchException**이 발생합니다.

에러 메시지:
```
org.hibernate.FetchException: cannot simultaneously fetch multiple bags
```

```java
// 이런 쿼리는 불가능합니다
@Query("SELECT o FROM Order o " +
       "JOIN FETCH o.orderItems " +
       "JOIN FETCH o.orderHistories")
List<Order> findAllWithItemsAndHistories();
```

### 원인
JPA는 두 개 이상의 컬렉션을 동시에 Fetch Join 시 카테시안 곱(Cartesian Product) 가 발생하여 결과가 왜곡될 수 있기 때문에 이를 제한합니다.

```@Entity
public class Order {
    @Id
    private Long id;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "order")
    private List<OrderHistory> orderHistories;
}
```
### 해결 방법

#### 1) Batch Size 설정 - yml 설정
```yml
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```
엔티티 별로 어노테이션으로도 설정할 수 있습니다.


#### 2) Batch Size 설정 - 어노테이션

```java
@Entity
@BatchSize(size = 100)
public class OrderItem {  }

@Entity
@BatchSize(size = 100)
public class OrderHistory {  }
```

### Batch Size 설정 주의사항
`spring.jpa.properties.hibernate.default_batch_fetch_size`: 글로벌 설정

`@BatchSize`: 엔티티별 개별 설정

> 보통은 글로벌 설정을 기본으로 적용하고, 성능 최적화가 필요한 컬렉션에는 @BatchSize를 추가로 지정해주는 패턴이 많이 사용됩니다.


### 추가 팁: Set 사용 고려
`@OneToMany` 또는 `@ManyToMany` 관계에서 Set을 사용하면 MultipleBagFetchException 문제를 회피할 수 있습니다.

단, Set 사용 시에는 **반드시** `equals`/`hashCode` 구현이 필요합니다.

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    OrderItem that = (OrderItem) o;
    return Objects.equals(id, that.id);
}

@Override
public int hashCode() {
    return Objects.hash(id);
}
```


#### 3) 쿼리 분리

Fetch Join 대신 쿼리를 나눠서 실행하는 것도 좋은 방법입니다.
```java
// 첫 번째 쿼리
List<Order> orders = orderRepository.findAllWithItems();

// 두 번째 쿼리
List<Long> orderIds = orders.stream()
    .map(Order::getId)
    .collect(Collectors.toList());

List<OrderHistory> histories = historyRepository.findByOrderIdIn(orderIds);

```

#### 4) Entity Graph 활용
```java
@EntityGraph(attributePaths = {"orderItems", "orderHistories"})
@Query("SELECT o FROM Order o")
List<Order> findAllWithGraph();
```

## 2. 재귀 구조에서의 JPA 한계와 해결방법

### 문제 상황
계층형(트리형) 구조 데이터를 조회할 때 재귀 관계를 효율적으로 처리하기 어렵습니다.

```java
@Entity
public class Category {
    @Id
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> children = new ArrayList<>();
}

```

#### 1)  Native Query 사용 (WITH RECURSIVE)
JPA에서는 기본적으로 재귀 쿼리를 지원하지 않습니다.
이 경우 DB의 `WITH RECURSIVE` 구문을 사용하면 성능상 유리합니다.

```java
@Query(value = "WITH RECURSIVE category_tree AS (" +
              "  SELECT * FROM category WHERE id = :categoryId " +
              "  UNION ALL " +
              "  SELECT c.* FROM category c " +
              "  INNER JOIN category_tree ct ON c.parent_id = ct.id" +
              ") SELECT * FROM category_tree", 
       nativeQuery = true)
List<Category> findCategoryTree(@Param("categoryId") Long categoryId);

```

#### 2) BFS(너비 우선 탐색) 알고리즘 활용
애플리케이션에서 재귀 없이 직접 순회(BFS)를 구현하는 방법도 있습니다.

```
public List<Category> findAllChildrenBFS(Long rootId) {
    List<Category> result = new ArrayList<>();
    Queue<Category> queue = new LinkedList<>();

    Category root = categoryRepository.findById(rootId).orElseThrow();
    queue.offer(root);

    while (!queue.isEmpty()) {
        Category current = queue.poll();
        result.add(current);

        List<Category> children = categoryRepository.findByParentId(current.getId());
        queue.addAll(children);
    }

    return result;
}
```
> 주의: BFS 구현 시 N+1 문제가 발생할 수 있으므로 `default_batch_fetch_size` 설정 등을 적용해 성능 튜닝이 필요합니다.

## 3. 순환 참조 문제와 @JsonIgnore

### 문제 상황
양방향 연관관계를 가진 엔티티를 JSON으로 직렬화할 때 무한 순환 참조 문제가 발생합니다.

```java
@Entity
public class User {
    @Id
    private Long id;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}

@Entity
public class Order {
    @Id
    private Long id;

    @ManyToOne
    private User user;
}
```

#### 해결 방법: @JsonIgnore 사용
```java
@Entity
public class Order {
    @Id
    private Long id;

    @ManyToOne
    @JsonIgnore  // JSON 직렬화 시 해당 필드를 무시
    private User user;
}

```
#### 장단점

- 장점: 매우 간단하고 직관적인 방법

- 단점: 항상 해당 필드가 직렬화에서 제외됨 (상황에 따라 불편할 수 있음)

## 4. @JsonManagedReference와 @JsonBackReference

### 더 세밀한 제어가 필요한 경우
`@JsonIgnore` 보다 조금 더 유연하게 직렬화 방향을 지정할 수 있습니다.
Jackson의 `@JsonManagedReference` / `@JsonBackReference` 를 사용하는 방법입니다.

```
@Entity
public class User {
    @Id
    private Long id;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference  // 직렬화 포함
    private List<Order> orders;
}

@Entity
public class Order {
    @Id
    private Long id;

    @ManyToOne
    @JsonBackReference  // 직렬화 제외
    private User user;
}
```

### 작동 원리

#### - @JsonManagedReference: 정방향 참조 (직렬화 포함)

#### - @JsonBackReference: 역방향 참조 (직렬화 제외)


## 5. DTO 활용하기 
프로젝션을 활용하여 필요한 필드만 직렬화하는 방법도 있습니다.
위와 같은 어노테이션에서는 엔티티를 직접 반환하려고 해서 무한재귀가 발생하는 것입니다.
```java
@Getter
@Builder
public class UserDto {
    private Long id;
    private String name;
    private List<OrderSimpleDto> orders;

    public static UserDto from(User user) {
        return UserDto.builder()
            .id(user.getId())
            .name(user.getName())
            .orders(user.getOrders().stream()
                .map(OrderSimpleDto::from)
                .collect(Collectors.toList()))
            .build();
    }
}

@Getter
@Builder
public class OrderSimpleDto {
    private Long id;
    private LocalDateTime orderDate;

    public static OrderSimpleDto from(Order order) {
        return OrderSimpleDto.builder()
            .id(order.getId())
            .orderDate(order.getOrderDate())
            .build();
    }
}

```

### 마무리
JPA를 실무에서 사용하다 보면 문서에 없는 다양한 제약 사항을 마주치게 됩니다.
특히 성능 최적화, 순환 참조 문제는 거의 모든 프로젝트에서 만나게 되는 대표적인 이슈입니다.

이번 글에서 소개한 해결 방법을 다시 정리하면:

#### 1. 다중 Fetch Join 문제: Batch Size 설정 또는 쿼리 분리

#### 2. 재귀 구조 처리: Native Query 또는 BFS 알고리즘 활용

#### 3. 순환 참조 문제: @JsonIgnore, @JsonManagedReference/@JsonBackReference, 또는 DTO 사용

정답은 하나가 아니기 때문에, 상황에 맞는 최적의 방법을 선택하는 것이 중요하고 무작정 어떤 방법을 사용하기보다는 상황에 맞는 최적의 방법을 선택하는 것이 중요합니다.