---
title: 스프링 부트 알고 사용하기 - ObjectMapper 직렬화
date: 2025-01-26
comments: true
categories:
  - posts
tags:
  - spring boot
  - Object Mapper
  - Serialization
  - Deserialization
---

---

<br>
스프링 부트에서 JSON 직렬화/역직렬화를 처리할 때 발생하는 문제는 개발자들에게 흔한 골칫거리입니다. 특히 LocalDateTime과 같은 Java 8 날짜/시간 API를 다룰 때 직면하는 문제를 해결하기 위해 다양한 방법을 살펴보겠습니다

## 1. ObjectMapper 직렬화 문제 해결하기
살펴보기에 앞서 기본 설정들이 필요합니다. <br>
먼저 기본적인 모델과 컨트롤러 클래스를 설정해보겠습니다:

```java
@Data
public class Item {

    private String id;
    private String name;
    private LocalDateTime localDateTime;
}
```
```java
@RestController
@Slf4j
public class MyRestController {

    @GetMapping("/objectMapper")
    public Item getItem() {
        Item item = new Item();
        item.setId("a1");
        item.setName("hello");
        item.setLocalDateTime(LocalDateTime.now());
        return item;
    }
}

```
<br>

보통 스프링부트를 설정을 하다보면 해당 코드 처럼 ObjectMapper를 직접 빈으로 등록할 때 LocalDateTime 직렬화 문제가 자주 발생합니다:


<br>

```java
@Configuration
public class ObjectMapperConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```
이 설정으로는 다음과 같은 InvalidDefinitionException이 발생합니다:

<br>

```
com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type `java.time.LocalDateTime` not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310" to enable handling (through reference chain: com.basic.spring.Item["localDateTime"])
	at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:77) ~[jackson-databind-2.15.3.jar:2.15.3]
	at com.fasterxml.jackson.databind.SerializerProvider.reportBadDefinition(SerializerProvider.java:1308) ~[jackson-databind-2.15.3.jar:2.15.3]
	at com.fasterxml.jackson.databind.ser.impl.UnsupportedTypeSerializer.serialize(UnsupportedTypeSerializer.java:35) ~[jackson-databind-2.15.3.jar:2.15.3]
	at com.fasterxml.jackson.databind.ser.BeanPropertyWriter.serializeAsField(BeanPropertyWriter.java:732) ~[jackson-databind-2.15.3.jar:2.15.3]
	at com.fasterxml.jackson.databind.ser.std.BeanSerializerBase.serializeFields(BeanSerializerBase.java:772) ~[jackson-databind-2.15.3.jar:2.15.3]
```

<br>


### 해결방법(1)

직접 Bean으로 등록하지 않고 자동으로 등록해주기 때문에 아무것도 하지 않습니다.

<img src="/assets/spring-boot/img.png" alt="cicd" itemprop="image">

별도의 설정 없이 기본 포맷(yyyy-MM-dd'T'HH:mm:ss)으로 직렬화됩니다.

### 해결방법(2)

```java
@Bean
public ObjectMapper objectMapper() {
	ObjectMapper objectMapper = new ObjectMapper();

	JavaTimeModule javaTimeModule = new JavaTimeModule();

  // 날짜/시간 형식 커스터마이징
  LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd hhmmss.SSS"));
	javaTimeModule.addSerializer(LocalDateTime.class, localDateTimeSerializer);
	objectMapper.registerModule(javaTimeModule);

	return  objectMapper;
}
```

위 코드는 아래와 같은 형식으로 나옵니다.
<img src="/assets/spring-boot/img_1.png" alt="cicd" itemprop="image">

JavaTimeModule 등록을 해줘야 합니다. <br>
특히 new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("자기가 원하는 형식")); => 해당 부분에서는 시간이 나오는 형태
를 자기가 원하는 방식으로 커스텀할 수 있습니다. <br>
LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(DateTimeFormatter.ISO_DATE_TIME); => 이 형태가 아무 설정 하지 않았을 때와 동일합니다.

<br>
📌 ObjectMapper 직렬화/역직렬화 동작 방식 <br>
- 직렬화(Serialization): Java 객체 → JSON <br>
- 역직렬화(Deserialization): JSON → Java 객체 <br>
- JavaTimeModule은 두 방향 모두 처리

<br>



### 해결방법(3) - Jackson2ObjectMapperBuilderCustomizer 사용하기

```java

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer objectMapperBuilderCustomizer() {
        return new Jackson2ObjectMapperBuilderCustomizer() {
            @Override
            public void customize(Jackson2ObjectMapperBuilder builder) {
                LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyyMMdd hhmmss.SSS"));

                builder.serializerByType(LocalDateTime.class, localDateTimeSerializer);
            }
        };
    }

```
만약에 직렬화 부분만 따로 설정하고 싶다고 하면 위 코드와 같이 따로 설정이 가능합니다.
결과는 위와 동일하게 나옵니다.

<br>
만약에 Item Dto에서 해당 localDateTime을 LocalDate로 변경한다했을때, 해결방법(2)를 사용하게 된다면

```java
@Data
public class Item {

    private String id;
    private String name;
    private LocalDate localDate;  // <- localDate 타입 변경
}
```
<img src="/assets/spring-boot/img2.png" alt="cicd" itemprop="image">
위 그림과 같이 이상한 배열로 나올 수가 있습니다. 
해결방법(2)가 잘못된 것이 아니라, JavaTimeModule 설정이 불완전해서 발생하는 현상입니다.

```java
@Bean
public ObjectMapper objectMapper() {
   ObjectMapper objectMapper = new ObjectMapper();
   JavaTimeModule javaTimeModule = new JavaTimeModule();

  // JavaTimeModule 등록으로 LocalDateTime 문제 해결
  LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(
       DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
   );
   javaTimeModule.addSerializer(LocalDateTime.class, localDateTimeSerializer);

   // JavaTimeModule 등록으로 LocalDate 문제 해결
  LocalDateSerializer localDateSerializer = new LocalDateSerializer(
       DateTimeFormatter.ofPattern("yyyy-MM-dd")
   );
   javaTimeModule.addSerializer(LocalDate.class, localDateSerializer);

   objectMapper.registerModule(javaTimeModule);
   return objectMapper;
}
```
이 배열을 해결하려면 추가로 코드를 작성해줘야 합니다.

### 해결방법(4)

```java
@Bean
public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
	LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("yyyyMMdd hhmmss.SSS"));

	return builder
			.serializerByType(LocalDateTime.class, localDateTimeSerializer)
			.build();
}
```
빌더 패턴을 활용한 설정입니다. 빌더 패턴을 활용하면 ObjectMapper를 더욱 유연하고 직관적으로 설정할 수 있습니다. 이는 코드의 가독성을 높이고, 다른 모듈과의 통합에서도 유리합니다.

<br>

정리하자면, 스프링 부트에서 ObjectMapper를 설정할 때 문제를 예방하려면 기본 설정을 활용하거나, Jackson2ObjectMapperBuilderCustomizer를 사용하는 것이 가장 권장됩니다. 이를 통해 개발자는 JSON 직렬화 문제를 효과적으로 해결할 수 있습니다

### 강의 참고, 이미지 출처 
- [Hello World의 그대는 springboot 를 제대로 활용하고 있는가?](https://www.inflearn.com/course/springboot-%EC%A0%9C%EB%8C%80%EB%A1%9C-%ED%99%9C%EC%9A%A9/dashboard)