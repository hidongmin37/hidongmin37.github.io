---
title: JPA - Constructor expression + 컬렉션의 조합? 😵
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

---

## 실무에서 만났던 이슈

요즘에는 실무에서 코틀린 + 스프링으로 프로젝트를 진행하고 있습니다. 며칠 되지 않았지만, 코틀린은 컴파일 단계에서 Null체크를 해준다는 것이 굉장히 메리트가 있는 언어라고 생각됩니다. 그래서 이번에는 코틀린으로 JPA를 사용하면서 만났던 이슈에 대해서 공유하고자 합니다.

---

## 문제 상황 설명

먼저 리뷰에 대한 엔티티를 활용하여 리뷰 리스트를 조회하는 쿼리를 작성하였습니다.

<br>
먼저 리뷰 엔티티를 약식으로 설명하겠습니다. 
  
  ```kotlin
  @Entity
  @Table(name = "review")
  @Entity
class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

//    회원 id
    var appMemberId: Long? = null,

//    회원 code
    var appMemberCode: String? = null,

//    회원 닉네임
    var appMemberName: String? = null,

//    상점 id
    var storeId: Long? = null,

//    상점 code
    var storeCode: String? = null,
  
//   리뷰 이미지
   //    리뷰 이미지
    @OneToMany(mappedBy = "review", cascade = [CascadeType.ALL], orphanRemoval = true)
    @JsonManagedReference
    var reviewImages: MutableList<ReviewImage>? = mutableListOf(),

    //    주문
    @OneToOne
    @JoinColumn(name = "order_id")
    var order: Order? = null,
...

```

<br>

프로젝트를 도중에 맡았던 것을 진행하면서 리뷰 엔티티는 reviewImages라는 컬렉션을 1대다로 매핑이 되어있었고, 기본적으로 FetchType은 기본값이 EAGER로 되어있기 때문에 바로 가져올 수 있습니다.

<br>
추가적으로 주문 엔티티(order)와도 1대1로 매핑이 되어있었고, FetchType은 기본값이 EAGER로 되어있기 때문에 바로 가져올 수 있습니다.

<br>

### 내가 만든 Response DTO

```kotlin
data class ReviewResponseDto(
    val id: Long,
    val storeOrderCount: Int,
    ...
    val reviewImagesList:List<ReviewImageResponse>,
)

```

<br>
dto를 해당과 같이 만들어 준 이유는 리뷰 리스트를 반환하기 위한 것이었고, 리뷰 이미지 리스트와 상점 주문 수를 같이 반환해주기 위해서 만들었습니다.


### 내가 만든 쿼리 1차
먼저 쿼리를 설명하기 전에 리뷰들을 가져오는 쿼리와 상점에서 주문한 수를 가져오는 쿼리를 분리하여 작성하였습니다. 

```kotlin
    fun findReviewByAppMemberId(appMemberId: Long,pageable: Pageable): Page<Review>?

    fun countReviewsByAppMemberIdAndStoreId(appMemberId: Long, storeId: Long): Long?
```

<br>

그랬더니 서비스 계층에서 비즈니스 로직이 N+1 문제가 발생하는 것을 확인했습니다. 

```kotlin
// 리뷰 리스트를 가져오는 쿼리
 val reviews = reviewRepository.findReviewByAppMemberId(memberId, pageable)
        ?: throw CustomException(ErrorMessage.CHECK_REVIEW_NOT_EXIST)

    return reviews.map { review ->
        ReviewResponseDto(
            ...
          // 주문 수를 가져오는 쿼리
            orderCount = reviewRepository.countReviewsByAppMemberIdAndStoreId(review.appMemberId!!, review.storeId!!) ?:0,
            reviewImages = review.reviewImages?.map { image ->
              ReviewImageResponse(
                    reviewImageId = image.id,
                    reviewImageUrl = image.imageUrl,
                    priority = image.priority
                )
            }
        )

```
개수를 가져오는 것을 굉장히 여러번 조회를 하게 되어서 N+1 문제가 발생하게 되었습니다. 그래서 이를 해결하기 위해서 쿼리를 한번에 가져오기 위해서 생성자 표현식을 사용하였습니다.



### 내가 만든 쿼리 2차 - 생성자 표현식 시도

N+1 문제를 해결하기 위해 JPQL에서 제공하는 생성자 표현식을 사용하여 한 번의 쿼리로 모든 데이터를 가져오려고 시도했습니다.

```kotlin
@JsonInclude(JsonInclude.Include.ALWAYS)  // null 값도 항상 포함
data class ReviewResponseDto(
    val id: Long,
    ...
    val orderCount: Long,
    val reviewImages: List<ReviewImage>? = emptyList()
)

@Query("""
    SELECT DISTINCT new org.example.reviewResponseDto(
        r.id,
        ...
        (SELECT COUNT(o) FROM Order o WHERE o.appMember.id = :memberId AND o.storeId = r.storeId),
        r.reviewImages
    )
    FROM Review r
    ... 
    r.reviewImages
   ORDER BY 
   ...
    END DESC
""")

```
하지만 이 방식은 다음과 같은 에러를 발생시켰습니다.



``` 
org.hibernate.query.SemanticException: Missing constructor for type 'ReviewResponseDto'
```

<br>

### 원인 분석
🕵🏻‍ 도대체 뭐가 문제일까를 고민했습니다. 
#### 1. 처음에는 생성자 표현식에 있는 타입들 그리고 필드명을 모두 맞춰주었습니다. 

그래도 되지 않았습니다. 
<br>
#### 2. 그래서 chatgpt에게 도움을 요청해봤더니, 
DTO 생성자도 필요합니다라고 말해서 
생성자를 만들어주었습니다. 

```kotlin
data class MemberReviewListManagementResponseDto(
    val reviewId: Long?,
    val memberStoreTotalOrderCount: Long,
    val reviewImageList: List<ReviewImageResponseDto>? = emptyList()
) {
    constructor(
        id: Long?,
        orderCount: Long,
        reviewImages: List<ReviewImage>?
    ) : this(
        reviewId = id,
        memberStoreTotalOrderCount = orderCount,
        reviewImageList = reviewImages
    )
}
```
이 방법은 전혀 도움이 되지 않았습니다.

<br>
#### 3. 그래서 다시 생각해보니, 생성자 표현식에서 컬렉션을 주입하는 것이 불가능하다는 것을 알게 되었습니다.

이 에러가 발생한 이유는 JPA의 생성자 표현식에서 컬렉션(Collection)을 직접 주입하는 것이 불가능하기 때문입니다. JPA는 다음과 같은 제약사항이 있습니다:

- 생성자 표현식에서는 기본 타입(스칼라 값)만 주입이 가능합니다.
- 컬렉션이나 복잡한 관계는 생성자에서 직접 처리할 수 없습니다.
- 서브쿼리로 컬렉션을 조회하더라도 이를 단일 생성자 파라미터로 변환할 수 없습니다.

<br>

### 해결 방법

그래서 이 문제를 해결하기 위해서는 다음과 같은 방법을 사용해야 합니다.

```kotlin
@JsonInclude(JsonInclude.Include.ALWAYS)
data class MemberManagementReviewWithCountProjection(
    val id: Long,
    val storeName: String?,
    val reviewDelete: Boolean,
    val recentWrite: LocalDateTime,
    val rating: Double?,
    val content: String?,
    val orderCount: Long
) {
    var reviewImages: List<ReviewImage>? = null
}

@Query("""
    SELECT new org.example.ReviewResponseDto(
        r.id,
        ...
        COUNT(o.id)
    )
    FROM Review r
    ...
""")


@JsonInclude(JsonInclude.Include.ALWAYS)
data class ReviewResponseDto(
  val id: Long,
  ...
  val orderCount: Long
) {
  var reviewImages: List<ReviewImage>? = null
}


```

해당 코드 수정을 통해서
기본 데이터는 생성자를 통해 즉시 로딩하고, reviewImages(컬렉션)은 필요로 할때 별도로 로딩이 가능합니다.


해당 쿼리 수정을 통해서 한 번의 쿼리로 기본 데이터와 주문 수를 조회하고, N+1 문제를 해결할 수 있었습니다.

---

## 마치며

JPA 생성자 표현식을 사용할 때는 컬렉션을 직접 주입하려고 하면 안 됩니다. 대신 컬렉션은 별도의 프로퍼티로 분리하고, 필요한 경우 지연 로딩이나 페치 조인을 사용하는 것이 좋습니다. 이러한 방식은 성능도 좋고 코드도 깔끔하게 유지할 수 있습니다.





