---
title: JPA에서 @NoArgsConstructor(access = AccessLevel.PROTECTED)를 안했을때
date: 2025-08-12
comments: true
categories:
  - JPA
tags:
  - Hibernate
  - NoArgsConstructor
---

## 목차
1. [@NoArgsConstructor(access = AccessLevel.PROTECTED)의 역할](#NoArgsConstructoraccess--AccessLevelPROTECTED의-역할)
2. [사용 예시](#사용-예시)
3. [사용 이유](#사용-이유)
4. [JPA는 “기본 생성자”가 꼭 필요함](#JPA는-기본-생성자가-꼭-필요함)
5. [왜 생기는 거지?](#왜-생기는-거지)
6. [결론](#결론)

---


## @NoArgsConstructor(access = AccessLevel.PROTECTED)의 역할
Lombok에서 제공하는 어노테이션으로 말 그대로 매개변수가 없는 기본 생성자를 자동으로 만들어주되, access 는 Protected 단계로 즉, 접근제어자는 protected로 지정해주는 역할을 합니다.

<br>
<br>

## 사용 예시

아래 코드 처럼 작성을 한다고 하면

```
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    private String name;
    private int age;
}

```

기본적으로 이렇게 생성을 해줍니다.(눈에는 보이진 않습니다.)
```
protected Member() { }
```
**외부에서는** new Member()**를 직접 못 쓰게 막는 것**이 키포인트라고 할 수 있습니다.

<br>
<br>

## 사용 이유
JPA는 “기본 생성자”가 꼭 필요함 && 하지만 외부(다른 패키지)에서 무분별하게 new로 생성하는 건 막고 싶음
Hibernate(JPA 구현체)는 엔티티를 DB에서 조회할 때 **리플렉션(reflection)** 으로 객체를 생성하기 때문에 기본 생성자가 반드시 존재해야 합니다. 그렇지만 동시에 정적 팩토리 메서드나 빌더패턴을 통해 의미 있는 생성만 허용하게 하려고 해당 어노테이션을 작성합니다.

```
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id @GeneratedValue
    private Long id;
    private String name;

    // new Member() 직접 호출 금지
    // 대신 아래처럼 팩토리 메서드로만 생성
    public static Member create(String name) {
        Member m = new Member();
        m.name = name;
        return m;
    }
}

```

<br>
<br>

## JPA는 “기본 생성자”가 꼭 필요함

[Jakarta Persistence](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#a18) JPA 공식 문서에도 나와있음

> The entity class must have a public or protected constructor with no parameters, which is called by the persistence provider runtime to instantiate the entity.The entity class may have additional constructors for use by the application.
>
엔티티 클래스는 **매개변수가 없는 public 또는 protected 생성자**를 반드시 가져야 하며,
이 생성자는 **영속성 제공자(persistence provider, 예: Hibernate)** 가 런타임 시 엔티티 인스턴스를 생성할 때 호출됩니다.

<br>
<br>

## 왜 생기는 거지?

```
// 기본 생성자 없으면 발생하는 예외 
org.hibernate.InstantiationException: No default constructor for entity 

// 또는 
org.hibernate.MappingException: Could not instantiate entity
```

엔티티 클래스에 기본 생성자가 없을 때 Hibernate는 DB 조회 시 리플렉션(reflection)으로 객체를 만들려고 하는데, **기본 생성자를 찾지 못해 예외를 던집니다.**

JPA는 기본적으로 엔티티를 DB에서 조회할때 자동으로 생성합니다. 이때 hibernate는 기본 생성자를 리플렉션으로 찾고, Constructor.newInstance() 를 호출해서 빈 객체를 만들고, 그뒤에 필드 값을 db에서 읽어와서 set을 해줍니다.


<br>
<br>

## 결론

> JPA 사용시 @NoArgsConstructor는 필수이다. 이는 jpa의 동작방식인 리플렉션을 통해 여러 변수들을 지정해주기 때문이다. 기본 생성자가 없으면 아예 엔티티 생성이 불가능하고, protected를 통해서 다른 패키지나 외부에서 new 로 생성하는 것을 막으며 대신 의미 있는 방식으로 엔티티 생성을 유도하자.