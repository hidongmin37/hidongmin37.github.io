---
title: 알림 구현하기
date: 2024-10-02
comments: true
categories:
  - posts
tags:
  - sse
  - alarm
  - coding
---

# 알림 구현하기

## 알림을 구현하는 방식

알림을 구현하는 방식에는 여러가지 방법이 있습니다. 


### 1. 폴링 (Polling)
  - 클라이언트가 주기적으로 서버에 새로운 알림이 있는지 확인하는 방식
  - 구현이 간단하지만 불필요한 네트워크 요청이 발생할 수 있음

### 2. 롱 폴링 (Long Polling)
  - 클라이언트가 서버에 연결을 유지하고, 새 알림이 있을 때만 응답을 받는 방식
  - 실시간성이 개선되지만 서버 리소스 사용량이 증가할 수 있음

### 3. 웹소켓 (WebSocket)
  - 클라이언트와 서버 간 양방향 통신을 지원하는 프로토콜
  - 실시간 알림에 적합하며 효율적인 리소스 사용이 가능

### 4. 서버-센트 이벤트 (Server-Sent Events)
  - 서버에서 클라이언트로 단방향 실시간 이벤트를 전송하는 기술
  - HTTP 프로토콜을 사용하여 구현이 비교적 간단함

### 5. 푸시 알림 (Push Notifications)
  - 모바일 디바이스를 위한 알림 시스템
  - 앱이 백그라운드 상태일 때도 알림 전달 가능

<br>

해당 방법 중에 자신의 서버 구성과 요구사항에 맞는 방법을 선택하여 구현하는 것이 좋습니다. 

대부분의 경우에는 **서버-센트 이벤트 (Server-Sent Events)**를 사용하여 알림을 구현하는 것이 적합합니다.


## 서버-센트 이벤트 (Server-Sent Events)란?

서버-센트 이벤트(SSE)는 실시간 데이터 스트리밍을 위한 효율적인 웹 기술입니다. SSE의 주요 특징과 작동 방식은 다음과 같습니다:

HTML5 표준 기술로, 서버에서 클라이언트로 단방향 실시간 데이터 전송을 가능하게 합니다.

HTTP의 지속적 연결(persistent connections)을 기반으로 동작합니다.


### 📋 작동 방식

① 클라이언트가 서버와 SSE 연결을 맺습니다.(구독)
② 서버는 변동사항이 발생할 때마다 연결된 모든 클라이언트에게 데이터를 전송합니다.
③ 클라이언트는 수동적으로 데이터를 수신만 합니다. 

### 🗝️ 특징
**단방향 통신**<br>
  서버에서 클라이언트로만 데이터를 전송할 수 있습니다.<br>

**텍스트 기반**<br>
  주로 텍스트 메시지 형태의 데이터를 전송합니다.<br>

**자동 재연결** <br>
  연결이 끊어진 경우 클라이언트가 자동으로 재연결을 시도합니다.
  (서버에서 `retry` 필드를 통해 재연결 간격을 설정할 수 있습니다.)<br>

**실시간 업데이트** <br>
  서버의 변경사항을 즉시 클라이언트에 반영할 수 있습니다.<br>

### ?? 구현 방법(Java Spring Boot + SSE + Redis stream)

#### 1. **Gradle 설정**
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // Redis
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    
    // jedis
    implementation 'redis.clients:jedis'
    
}
```

#### 2. **Redis 설정**
```java

@Configuration
public class RedisConfig {

  @Bean
  public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, String> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new StringRedisSerializer());
    return template;
  }
}
```

<br>

#### 3. **이벤트 생성자 서비스**
```java
@Service
public class EventPublisher {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String STREAM_KEY = "sse-events";

    public EventPublisher(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publishEvent(String event) {
        redisTemplate.opsForStream().add(STREAM_KEY, Collections.singletonMap("data", event));
    }
}
```

<br>


#### 4. **이벤트 컨트롤러**
```java
@RestController
public class SseController implements StreamListener<String, MapRecord<String, String, String>> {

    private final RedisTemplate<String, String> redisTemplate;
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private static final String STREAM_KEY = "sse-events";

    public SseController(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/sse")
    public SseEmitter handleSse() {
        SseEmitter emitter = new SseEmitter();

        executorService.execute(() -> {
            try {
                redisTemplate.opsForStream().read(
                    StreamListener.of(STREAM_KEY, this),
                    StreamListener.StreamReadOptions.empty().count(1).block(Duration.ofSeconds(30)),
                    StreamListener.ReadOffset.lastConsumed()
                );
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        });

        return emitter;
    }

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        String event = message.getValue().get("data");
        try {
            emitter.send(SseEmitter.event().data(event));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
```


### ✂️ SSE emitter만 사용한 방법과 redis stream을 사용한 방법의 차이점

**확장성**<br>
- redis stream을 사용하게 되면 여러 서버 인스턴스간 이벤트 공유가 가능
- 수평적 확장에 용이함

**영속성**<br>
- redis stream을 사용하게 되면 이벤트를 영속적으로 저장할 수 있음
- sse emitter만 사용시에는 서버 재시작 시 모든 이벤트 손실

<br>


## 결론

. SSE는 HTTP 프로토콜을 기반으로 동작하며, 단방향 실시간 데이터 전송을 지원합니다. Java Spring Boot와 Redis stream을 활용하여 SSE를 구현하는 방법을 살펴보았습니다. 이를 통해 실시간 알림 시스템을 구축할 수 있으며, 확장성과 영속성을 고려하여 구현할 수 있습니다.



### 참고사이트


https://velog.io/@bsangyong93/SSE%EB%A1%9C-%EC%95%8C%EB%A6%BC-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0-feat.Spring-boot
