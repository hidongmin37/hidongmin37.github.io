---
title: "WebClient, RestClient, RestTemplate"
date: 2024-08-30
comments: true
categories:
  - posts
tags:
  - webclient
  - restclient
  - resttemplate
  - coding
---

<br>

### RestTemplate란?

> RestTemplate은 Spring 3.0에서 도입되었으며, 간단하고 직관적인 API를 통해 동기식 HTTP 요청을 처리하는데 사용됩니다. 하지만 Spring 5.0 이후로는 더 이상 주요 업데이트가 없으며, WebClient가 기본 클라이언트로 권장됩니다.


<br>

### RestTemplate의 주요 특징
- **동기식, 블로킹 방식**: 요청이 완료될 때까지 스레드가 블록됩니다.
- **간단하고 직관적인 API**: 학습이 쉽고, 사용이 간편합니다.
- **유지보수 모드**: Spring 5.0부터 새로운 기능 추가는 없으며, 기존 기능 유지와 버그 수정에 중점을 둡니다.

<br>

### RestTemplate의 장점
- **간단하고 학습곡선이 낮음**: 직관적인 API로 인해 빠르게 습득할 수 있습니다.
- **동기식 코드에 적합**: 기존 동기식 애플리케이션과 쉽게 통합 가능합니다.


<br>

### RestTemplate의 단점
- **블로킹 방식으로 인한 성능 제한**: 많은 요청을 처리해야 하는 고성능 시스템에 부적합합니다.

- **비동기 작업에 부적합**: 비동기 작업을 위해 설계되지 않았습니다.


<br>

### RestTemplate의 사용법
```java
RestTemplate restTemplate = new RestTemplate();
String result = restTemplate.getForObject("https://example.com", String.class);
```

<br>

---

### WebClient란?

> WebClient는 Spring 5.0에서 도입된 비동기식, 리액티브 HTTP 클라이언트입니다.
> WebClient는 기존 RestTemplate의 단점을 보완하고, 비동기 및 리액티브 프로그래밍을 지원하는 현대적인 HTTP 클라이언트입니다. 이를 통해 네트워크 리소스를 효율적으로 사용할 수 있습니다.


<br>


### WebClient의 주요 특징
- **비동기식, 논블로킹 방식**: 요청과 응답이 비동기적으로 처리되어 더 나은 성능을 제공합니다.
- **리액티브 스트림 API**: 리액터(React) 기반의 스트림 API를 제공합니다.
- **함수형 스타일의 API**: 함수형 프로그래밍 패러다임을 지원합니다.

<br>

### WebClient의 장점
- **높은 성능**: 비동기식, 논블로킹 방식으로 성능이 향상됩니다.
- **리액티브 스트림 API**: 스트리밍 데이터와 비동기 작업에 적합합니다.
- **유연성**: 다양한 기능과 옵션을 제공하여 복잡한 요구사항을 충족할 수 있습니다.

<br>

### WebClient의 단점
- **사용이 복잡하고 학습곡선이 높음**: 리액티브 프로그래밍에 익숙하지 않다면 초기 학습이 어렵습니다.
- **기존 동기식 코드와의 통합이 복잡할 수 있음**: 동기식 코드와 섞어 쓸 때 구조와 처리 방식이 다르므로 추가적인 고려가 필요합니다.


<br>

### WebClient의 사용법
```java
WebClient webClient = WebClient.create();
Mono<String> result = webClient.get()
  .uri("https://example.com")
  .retrieve()
  .bodyToMono(String.class);
```

<br>

---

### RestClient란?

> RestClient는 Spring Framework 6.1에서 새롭게 도입된 HTTP 클라이언트입니다.
> RestClient는 최신 HTTP 클라이언트로서, 기존 RestTemplate와 WebClient의 중간 역할을 합니다. 동기식과 비동기식을 모두 지원하며, 최신 API 디자인을 제공합니다.



<br>

### RestClient의 주요 특징

- **RestTemplate과 WebClient의 중간 지점**: 두 클라이언트의 장점을 결합하여 설계되었습니다.
- **동기식 및 비동기식 작업 지원**: 하나의 API로 동기/비동기 요청 모두 처리 가능.
- **현대적인 API 디자인**: 직관적이고 일관된 방식으로 API가 설계되었습니다.


<br>

### RestClient의 장점
- **유연성**: 동기식 및 비동기식 작업 모두 지원.
- **모던한 API 디자인**: RestTemplate보다 현대적인 설계.
- **통합된 사용성**: 복잡성을 줄이고 다양한 기능을 사용할 수 있음.


<br>

### RestClient의 단점
- **비교적 새로운 기술**: 생태계와 사용 경험이 WebClient만큼 성숙하지 않음.
- **리액티브 기능의 제한**: WebClient의 모든 리액티브 기능을 지원하지는 않음.


<br>

### RestClient의 비동기 사용법
```java
RestClient restClient = RestClient.create();
CompletableFuture<String> result = restClient.get()
  .uri("http://example.com/api/resource")
  .retrieve()
  .toEntity(String.class)
  .thenApply(ResponseEntity::getBody);
```

<br>

### RestClient의 동기 사용법
```java
RestClient restClient = RestClient.create();
String result = restClient.get()
  .uri("http://example.com/api/resource")
  .retrieve()
  .body(String.class);

```

<br>

---

### 비교 분석 WebClient vs RestTemplate vs RestClient

| 구분    | WebClient         | RestTemplate | RestClient | 총합                                    |
|-------|-------------------|---|---|---------------------------------------|
| 성능    | 비동기 처리로 높은 처리량 제공 | 동기식 처리로 성능 제한 | 비동기 및 동기 처리 모두 지원, 높은 처리량 가능 | WebClient ≈ RestClient > RestTemplate |
| 사용편의성 | 학습곡선이 높음, 리액티브 프로그래밍 개념 이해 필요        | 사용이 간단하고 직관적 | 사용이 간단하면서도 동기/비동기 작업 모두 지원 | RestTemplate > RestClient > WebClient |
|기능성 | 리액티브 스트림 API, 함수형 스타일의 API<br/><br/>WebClient가 가장 다양한 기능 제공 (스트리밍, 웹소켓 등) | 간단하고 직관적인 API | RestTemplate의 대체제로 설계<br><br>대부분의 일반적인 비동기 작업 지원 | WebClient > RestClient > RestTemplate |
|업데이트 | 지속적인 업데이트가 기대됨 | 유지보수 모드로 전환 | 새롭게 도입된 기능이기 때문에 사용자들의 사용 경험이 부족함 | WebClient ≈ RestClient > RestTemplate |


<br>

### 결론

#### WebClient
- 성능을 중시한다면 WebClient를 사용
- 리액티브 프로그래밍 개념에 익숙하다면 사용
- 고성능, 비동기처리가 필요한 현대적인 애플리케이션에 이상적
- 리액티브 스트림 API, 함수형 스타일의 API를 사용하고 싶다면 WebClient를 사용

#### RestTemplate
- 간단하고 직관적인 API를 사용하고 싶다면 RestTemplate를 사용
- 동기식 코드에 익숙한 개발자들에게 편리
- 성능보다는 사용 편의성을 중시한다면 RestTemplate를 사용
- 레거시 코드나 간단한 애플리케이션에 적합

#### RestClient
- RestTemplate과 WebClient의 중간 지점
- Spring 6.1에서 새롭게 도입되어 지속적인 업데이트가 기대됨
- RestTemplate을 대체하고자 하는 프로젝트나, WebClient의 복잡성을 피하고 싶은 경우에 적합.

<br>

---

### 이것들의 주용도 📌

①  **외부 API 호출**<br>
다른 서비스나 시스템의 API를 호출하여 데이터를 요청하거나 작업을 수행합니다.
<br>

② **마이크로서비스 간 통신**<br>
마이크로서비스 아키텍처에서 서비스 간 통신에 사용됩니다.
<br>

③ **외부 서비스 통합**<br>
결제 게이트웨이, 소셜 미디어 플랫폼, 클라우드 서비스 등 외부 서비스와의 통합에 활용됩니다.
<br>

④ **RESTful API 소비**<br>
REST API를 제공하는 서비스와 상호작용할 때 사용됩니다.
<br>

⑤ **데이터 동기화**<br>
외부 시스템과 데이터를 주고받을 때 사용됩니다.
<br>

⑥ **웹훅 구현**<br>
외부 이벤트에 대응하여 특정 URL로 데이터를 전송할 때 사용할 수 있습니다.


#### 참고사이트


https://digma.ai/restclient-vs-webclient-vs-resttemplate/