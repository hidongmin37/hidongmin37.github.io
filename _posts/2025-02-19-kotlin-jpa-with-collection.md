---
title: JPA - 생성자 표현식과 컬렉션 조합 시도( 문제와 해결 방안) 😵
date: 2025-02-19
comments: true
categories:
  - issues
tags:
  - JPA
  - Kotlin
  - 생성자 표현식
  - 컬렉션 주입
---

## 목차
- [실무에서 만났던 이슈](#실무에서-만났던-이슈)
- [문제 상황 설명](#문제-상황-설명)
  - [리뷰 엔티티 개요](#리뷰-엔티티-개요)
  - [Response DTO 구성](#response-dto-구성)
  - [기존 쿼리와 N+1 문제](#기존-쿼리와-n1-문제)
- [문제의 원인 및 에러 메시지](#문제의-원인-및-에러-메시지)
- [해결 방법](#해결-방법)
  - [Step 1: DTO 수정](#step-1-dto-수정)
  - [Step 2: JPQL 쿼리 수정](#step-2-jpql-쿼리-수정)
- [마치며](#마치며)


<br>
<br>


## 실무에서 만났던 이슈

요즘 코틀린과 스프링으로 프로젝트를 진행하면서 JPA를 사용하고 있습니다.
이번 글에서는 리뷰 엔티티를 기반으로 데이터를 조회할 때 발생한 N+1 문제와, 생성자 표현식 사용 시 컬렉션을 주입하려고 할 때 발생한 에러에 대해 설명합니다.

<br>

## 문제 상황 설명

먼저 리뷰에 대한 엔티티를 활용하여 리뷰 리스트를 조회하는 쿼리를 작성하였습니다.

<br>

### 리뷰 엔티티 개요
리뷰 엔티티는 리뷰 이미지(reviewImages)와 1대다 관계, 주문(order)과 1대1 관계로 매핑되어 있습니다.
기본적으로 두 관계 모두 EAGER 패치 타입으로 즉시 로딩됩니다.

  
  ```kotlin
  @Entity
@Table(name = "review")
class Review(
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,

  // 회원 정보
  var appMemberId: Long? = null,
  var appMemberCode: String? = null,
  var appMemberName: String? = null,

  // 상점 정보
  var storeId: Long? = null,
  var storeCode: String? = null,

  // 리뷰 이미지 (1대다 매핑)
  @OneToMany(mappedBy = "review", cascade = [CascadeType.ALL], orphanRemoval = true)
  @JsonManagedReference
  var reviewImages: MutableList<ReviewImage>? = mutableListOf(),

  // 주문 (1대1 매핑)
  @OneToOne
  @JoinColumn(name = "order_id")
  var order: Order? = null,
  // ... 기타 필드
)


```

<br>

### Response DTO 구성
리뷰 리스트와 함께 리뷰 이미지 리스트 및 상점 주문 수를 반환하기 위해 아래와 같이 DTO를 구성했습니다.

```kotlin
data class ReviewResponseDto(
  val id: Long,
  val storeOrderCount: Int,
  // ... 기타 필드
  val reviewImagesList: List<ReviewImageResponse>
)
```

<br>

### 기존 쿼리와 N+1 문제
처음에는 리뷰 리스트와 상점 주문 수를 각각 다른 쿼리로 조회했습니다.

```kotlin
// 리뷰 리스트 조회
fun findReviewByAppMemberId(appMemberId: Long, pageable: Pageable): Page<Review>?

// 상점 주문 수 조회
fun countReviewsByAppMemberIdAndStoreId(appMemberId: Long, storeId: Long): Long?

```
서비스 계층에서는 리뷰마다 별도의 주문 수 조회 쿼리를 호출하게 되어 N+1 문제가 발생했습니다.

<br>


```kotlin
// 서비스 계층 예시
val reviews = reviewRepository.findReviewByAppMemberId(memberId, pageable)
  ?: throw CustomException(ErrorMessage.CHECK_REVIEW_NOT_EXIST)

return reviews.map { review ->
  ReviewResponseDto(
    // ... 기본 데이터 매핑
    orderCount = reviewRepository.countReviewsByAppMemberIdAndStoreId(review.appMemberId!!, review.storeId!!) ?: 0,
    reviewImages = review.reviewImages?.map { image ->
      ReviewImageResponse(
        reviewImageId = image.id,
        reviewImageUrl = image.imageUrl,
        priority = image.priority
      )
    }
  )
}

```
개수를 가져오는 것을 굉장히 여러번 조회를 하게 되어서 N+1 문제가 발생하게 되었습니다. 그래서 이를 해결하기 위해서 쿼리를 한번에 가져오기 위해서 생성자 표현식을 사용하였습니다.

<br>

### 문제의 원인 및 에러 메시지

N+1 문제 해결을 위해 JPQL의 생성자 표현식을 사용하여 한 번의 쿼리로 데이터를 조회하려고 했습니다.

```kotlin
@JsonInclude(JsonInclude.Include.ALWAYS)
data class ReviewResponseDto(
  val id: Long,
  // ... 기타 필드
  val orderCount: Long,
  val reviewImages: List<ReviewImage>? = emptyList()
)

@Query("""
    SELECT DISTINCT new org.example.ReviewResponseDto(
        r.id,
        -- 기타 필드 매핑
        (SELECT COUNT(o) FROM Order o WHERE o.appMember.id = :memberId AND o.storeId = r.storeId),
        r.reviewImages
    )
    FROM Review r
    JOIN FETCH r.reviewImages
    ORDER BY -- 정렬 조건
""")


```
하지만 실행 시 다음과 같은 에러가 발생했습니다.

``` 
org.hibernate.query.SemanticException: Missing constructor for type 'ReviewResponseDto'
```

<br>

### 에러 원인

- 문제 요약<br>
  JPA의 생성자 표현식에서는 기본 스칼라 값만 주입할 수 있으며, 컬렉션은 직접 주입할 수 없습니다.
- 설명<br>
  생성자 표현식을 사용할 때, 컬렉션 타입(예: List<ReviewImage>)을 직접 주입하려고 하면 매핑에 실패하여 위와 같은 에러가 발생합니다.

<br>

### 해결 방법

해결 방법은 두 가지로 나뉩니다.

#### 1. 기본 데이터는 생성자 표현식으로 즉시 로딩

#### 2. 컬렉션(리뷰 이미지)은 별도의 프로퍼티로 분리하여 나중에 로딩

<br>

### Step 1: DTO 수정
생성자 표현식에서는 기본 데이터와 주문 수만 전달하고, 컬렉션은 클래스 내부의 ```var``` 프로퍼티로 선언합니다.


```kotlin
@JsonInclude(JsonInclude.Include.ALWAYS)
data class ReviewResponseDto(
  val id: Long,
  // ... 기타 기본 필드
  val orderCount: Long
) {
  // 컬렉션은 생성자 파라미터로 주입하지 않고, 별도로 처리
  var reviewImages: List<ReviewImage>? = null
}

```

<br>

### Step 2: JPQL 쿼리 수정
생성자 표현식에서는 컬렉션을 제외한 기본 데이터와 주문 수만 조회합니다.

```kotlin
@Query("""
    SELECT new org.example.ReviewResponseDto(
        r.id,
        -- 기타 기본 필드 매핑
        (SELECT COUNT(o.id) FROM Order o WHERE o.appMember.id = :memberId AND o.storeId = r.storeId)
    )
    FROM Review r
    -- 필요한 JOIN 또는 조건 추가
    ORDER BY -- 정렬 조건
""")
```
이 방식으로 기본 데이터는 한 번의 쿼리로 가져오고, 컬렉션은 별도로 로딩할 수 있어 N+1 문제를 효과적으로 해결할 수 있습니다.

<br>

---

## 마치며
JPA 생성자 표현식을 사용할 때는 컬렉션을 직접 주입하려고 하면 안 됩니다.
대신, 기본 스칼라 값들은 생성자 표현식을 활용하고, 컬렉션은 별도의 프로퍼티로 분리하여 필요할 때 지연 로딩 또는 페치 조인을 사용하는 것이 좋습니다.
이와 같은 접근 방식은 성능 최적화와 코드의 가독성, 유지보수성을 동시에 개선할 수 있습니다.








