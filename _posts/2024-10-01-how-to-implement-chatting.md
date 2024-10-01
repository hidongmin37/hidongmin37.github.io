---
title: 채팅 구현하기
date: 2024-10-01
comments: true
categories:
  - posts
tags:
  - chat
  - coding
  - websocket
---


## 채팅 구현을 위해서는 무엇이 필요할까요?

채팅 구현을 위해서는 웹소켓이라는 개념을 이해해야 합니다. 웹소켓은 실시간 양방향 통신을 지원하는 프로토콜로, 클라이언트와 서버 간의 연결을 유지하면서 데이터를 주고받을 수 있습니다. 이를 통해 채팅 메시지를 실시간으로 전달할 수 있습니다.

<br>

---



## 웹소켓이란?

HTTP 통신을 이용하면 클라이언트에서 서버에 요청을 보내야만 서버에 응답할 수 있습니다. 즉, 서버에서는 요청을 받지 않으면 클라이언트에 통신할 수 없는 것입니다.


<img src="/assets/websocket/websocket.png">
[그림출처: https://ko.javascript.info/websocket]

웹소켓은 이러한 문제를 해결하기 위해 등장했습니다. 웹소켓은 클라이언트와 서버 간의 양방향 통신을 지원하며, 서버에서 클라이언트로 데이터를 전송할 수 있습니다. 이를 통해 실시간 채팅과 같은 기능을 구현할 수 있습니다.


<br>

---

## 웹소켓의 주요 특징

### 1. 전이중 통신
데이터를 동시에 양방향으로 전송할 수 있습니다.

### 2. 실시간 통신
지연 시간을 최소화하여 즉각적인 데이터 전송이 가능합니다.

### 3. 효율적인 리소스 사용
HTTP와 달리 연결을 유지하므로 반복적인 연결 설정/해제 과정이 없습니다.

### 4. 프로토콜 전환
초기 연결은 HTTP(S)를 통해 이루어지며, 이후 웹소켓 프로토콜로 전환됩니다.

<br>




---

## 웹소켓 동작 원리

### 1. Handshake
클라이언트가 서버에 HTTP(S) 요청을 보내 웹소켓 연결을 요청합니다. 

### 2. 연결 수립
서버가 요청을 수락하면 HTTP 연결이 웹소켓 연결로 업그레이드 됩니다.

### 3. 데이터 전송
연결이 수립된 후, 클라이언트와 서버는 자유롭게 메시지를 주고받을 수 있습니다. 


### 4. 연결 종료
어느 한쪽에서 연결 종료를 요청하면 웹소켓 연결이 종료됩니다.


<br>

웹 소켓은 TCP 연결을 통해서, 양방향 통신 채널을 제공하는 기술 서버와 클라이언트 사이에서 소켓 커넥션을 유지하면서, 양방향 통신을 가능케 하는 기술이다.





---

## 스프링부트에서 채팅 구현하기 


### 1. 의존성 추가

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
}
```

<br>

### 2. WebSocketConfig 클래스 생성(웹소켓 설정)

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry
      .addHandler(chatSocketHandler(), "/room")
      .setAllowedOriginPatterns("*");
  }

  @Bean
  public ChatSocketHandler chatSocketHandler() {
    return new ChatSocketHandler();
  }
}
```

<br>


- ```@EnableWebSocket```: 웹소켓을 활성화하는 어노테이션입니다.
- ```WebSocketConfigurer```: 인테페이스를 구현하여 웹소켓 설정을 커스텀합니다.
- ```registerWebSocketHandlers```: 메소드에서 웹소켓 핸들러와 엔드포인트를 등록합니다.
- ```setAllowedOriginPatterns("*")```: 모든 오리진을 허용하고, 실제 서비스에서는 보안을 위해서 특정 도메인만 허용하는 것이 좋습니다.





<br>

### 3. ChatSocketHandler 클래스 생성(웹소켓 핸들러 구현)

```java
@Slf4j
public class ChatSocketHandler extends TextWebSocketHandler {

  private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    String sessionId = session.getId();
    sessions.put(sessionId, session);
    log.info("New WebSocket connection established: {}", sessionId);
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    String payload = message.getPayload();
    log.info("Received message: {}", payload);

    // 모든 연결된 세션에 메시지 브로드캐스트
    for (WebSocketSession webSocketSession : sessions.values()) {
      webSocketSession.sendMessage(new TextMessage("Server received: " + payload));
    }
  }

  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
    log.error("WebSocket transport error: {}", exception.getMessage());
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    String sessionId = session.getId();
    sessions.remove(sessionId);
    log.info("WebSocket connection closed: {}", sessionId);
  }
}
```


- ```TextWebSocketHandler```: 해당 클래스를 상속받아 텍스트 기반의 웹소켓 메시지를 처리합니다.

- ```ConcurrentHashMap```: 멀티스레드 환경에서 안전하게 데이터를 저장하고 관리할 수 있는 클래스입니다.

- ```afterConnectionEstablished```: 새로운 웹소켓 연결이 설정될 때 호출됩니다. 

- ```handleTextMessage```: 클라이언트로부터 텍스트 메시지를 수신할 때 호출됩니다.

- ```handleTransportError```: 웹소켓 통신 중 에러가 발생했을 때 호출됩니다.

- ```afterConnectionClosed```: 웹소켓 연결이 종료될 때 호출됩니다.


위와 같은 방식만으로 기본적인 채팅 기능을 구현할 수 있지만, RabbitMQ, Redis Pub/Sub, 또는 Kafka와 같은 메시지 브로커를 함께 사용합니다.


<br>


### 4. 웹소켓에 메시지 브로커가 필요한 이유

#### 1) 확장성

단일 서버에서 웹소켓만 사용할 경우, 연결된 클라이언트 수가 증가하면 서버의 부하가 급격히 증가합니다. 



📌 메시지 브로커를 사용하면 여러 인스턴스에 **부하를 분산**시킬 수 있습니다. 각 서버는 메세지 브로커와 통신하며, 클라이언트의 메시지를 다른 모든 서버에 효율적으로 전달할 수 있습니다.

<br>

#### 2) 신뢰성

웹소켓 연결이 끊어지면 메시지가 유실될 수 있습니다. 


📌 메시지 브로커를 사용하여 메시지를 일시적으로 **저장**하고, 필요한 경우 재전송할 수 있는 기능을 제공합니다. 이는 네트워크 불안정이나 서버가 다운되는 상황에서도 메시지 전달의 신뢰성을 높입니다.

<br>

#### 3) 비동기 처리 (Asynchronous Processing)

메시지 브로커를 사용하면 메시지 송수신을 비동기적으로 처리할 수 있습니다. 이는 시스템의 응답성을 향상시키고, 대량의 메시지를 효율적으로 처리할 수 있게 해줍니다.

<br>

#### 4) 서비스 간 통신

마이크로서비스 아키텍처에서 메시지 브로커는 여러 서비스 간의 통신을 용이하게 합니다. 채팅 서비스뿐만 아니라 다른 관련 서비스(예: 알림,로깅)와도 쉽게 통합할 수 있습니다.

<br>


### 5. 메시지 브로커 특징과 선택 기준

실시간 웹 애플리케이션에서 메시지 브로커의 선택은 시스템의 성능, 확장성, 그리고 전반적인 아키텍처에 큰 영향을 미칩니다. 여기서는 주요 메시지 브로커들의 특징과 함께 선택 기준을 살펴보겠습니다.


- **RabbitMQ**: AMQP(Advanced Message Queuing Protocol)를 지원하는 오픈소스 메시지 브로커입니다.
  - 장점
    - 높은 신뢰성과 확장성
    - 다양한 언어와 프로토콜 지원
    - 유연한 라우팅 옵션
  - 단점
      - 설정이 다소 복잡할 수 있음
      - 대용량 처리 시 성능이 다른 옵션에 비해 떨어질 수 있음



- **Redis Pub/Sub**: Redis의 Pub/Sub 기능을 이용하여 메시지를 발행하고 구독할 수 있습니다.
  - 장점
    - 빠른 속도와 낮은 지연 시간
    - 이미 Redis를 사용 중인 경우 추가 인프라 불필요
  - 단점
    - 메시지의 지속성이 보장되지 않음
    - 복잡한 메시지 라우팅이 필요한 경우 다른 옵션을 고려해야 함


- **Kafka**: 대용량 데이터를 처리하는 데 특화된 분산 메시지 브로커입니다. 
  - 장점
    - 높은 처리량과 확장성
    - 낮은 지연 시간
    - 메시지 영속성 복제 기능
  - 단점
    - 설정과 운영이 다소 복잡함
    - 작은 규모의 애플리케이션에는 비효율적일 수 있음


<br>

### 메시지 브로커 선택 기준

<br>

#### 처리량과 지연시간
높은 처리량이 필요한 경우에는 kafka를, 낮은 지연 시간이 중요한 경우 <br>
 => Redis Pub/Sub을 또는 RabbitMQ를 선택합니다.

<br>

#### 확장성
대규모 시스템을 구축할 경우, 확장성이 중요합니다. <br>
=> RabbitMQ와 Kafka

<br>

#### 메시지 지속성
메시지의 지속성이 보장되어야 하는 경우
=> Kafka, RabbitMQ , Redis stream

<br>

#### 복잡성과 학습곡선
설정과 운영이 간단한 솔루션을 선호하는 경우
=> Redis Pub/Sub
복잡한 메시징 패턴이 필요한 경우
=> RabbitMQ

<br>

#### 프로토콜 지원
다양한 프로토콜 지원이 필요한 경우
=> RabbitMQ


<br>

---

### 스프링 웹소켓 + Redis Stream + STOMP를 이용한 채팅 구현

이 조합은 확장성 있고 실시간성이 뛰어난 채팅 시스템을 구축하는 데 매우 효과적입니다.

- 확장성: Redis를 통해 여러 서버 인스턴스 간 메시지를 동기화할 수 있어, 수평적 확장이 용이합니다.
- 실시간성: STOMP를 통해 클라이언트와 서버 간의 실시간 통신을 지원하며, Redis Stream을 통해 메시지를 신속하게 전달할 수 있습니다.
- 신뢰성: edis의 내구성과 STOMP의 메시지 보장 기능으로 신뢰성 있는 메시지 전달이 가능합니다.


<br>

### 1. 의존성 추가

```java
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'io.lettuce:lettuce-core'
    implementation 'org.webjars:stomp-websocket:2.3.4'
}
```


<br>

### 2. 웹소켓 설정

```java

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").withSockJS();
  }
}
```

<br>

### 3. Redis 설정

```java
@Configuration
public class RedisConfig {

  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(connectionFactory);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));
    return template;
  }

  @Bean
  public StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer(
    RedisConnectionFactory connectionFactory) {

    StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
      StreamMessageListenerContainer.StreamMessageListenerContainerOptions
        .builder()
        .pollTimeout(Duration.ofSeconds(1))
        .build();

    return StreamMessageListenerContainer.create(connectionFactory, options);
  }
}
```
<br>


### 4. Stream 리스너 설정

```java

@Component
public class ChatMessageStreamListener implements StreamListener<String, MapRecord<String, String, String>> {

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Override
  public void onMessage(MapRecord<String, String, String> message) {
    String content = message.getValue().get("content");
    messagingTemplate.convertAndSend("/topic/public", new ChatMessage(content));
  }
}


```

<br>

### 5. Stream 구독 설정

```java
@Component
public class RedisStreamConfig implements ApplicationRunner {

  @Autowired
  private StreamMessageListenerContainer<String, MapRecord<String, String, String>> container;

  @Autowired
  private ChatMessageStreamListener streamListener;

  @Override
  public void run(ApplicationArguments args) {
    container.receive(
      Consumer.from("chat-group", "consumer-1"),
      StreamOffset.create("chat-stream", ReadOffset.lastConsumed()),
      streamListener
    );

    container.start();
  }
}
```

<br>

### 6. 메시지 처리 컨트롤러

```java
@Controller
public class ChatController {

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Autowired
  private RedisTemplate<String, Object> redisTemplate;

  @MessageMapping("/chat.sendMessage")
  @SendTo("/topic/public")
  public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
    redisTemplate.opsForStream().add(
      "chat-stream",
      Collections.singletonMap("content", chatMessage.getContent())
    );
    return chatMessage;
  }
}
```




<br>

### 7. 메시지 처리 컨트롤러

```java
@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // Redis Stream에 메시지 저장
        redisTemplate.opsForStream().add("chat-stream", Map.of("message", chatMessage.getContent()));
        return chatMessage;
    }

    // Redis Stream 리스너
    @Scheduled(fixedRate = 100)
    public void consumeRedisStream() {
        List<MapRecord<String, Object, Object>> messages = redisTemplate.opsForStream().read(Consumer.from("group", "consumer"), StreamReadOptions.empty().count(10), StreamOffset.create("chat-stream", ReadOffset.lastConsumed()));
        
        for (MapRecord<String, Object, Object> message : messages) {
            String content = (String) message.getValue().get("message");
            messagingTemplate.convertAndSend("/topic/public", new ChatMessage(content));
        }
    }
}
```

<br>



## 결론

웹소켓을 이용한 채팅 시스템을 구현하는 것은 매우 간단하지만, 확장성과 실시간성을 고려할 때 메시지 브로커를 함께 사용하는 것이 좋습니다. Redis Pub/Sub, RabbitMQ, Kafka 등 다양한 메시지 브로커를 활용하여 채팅 시스템을 구축하면, 더욱 안정적이고 확장성 있는 서비스를 제공할 수 있습니다.

<br>

---

#### 부록

STOMP는 Simple Text Oriented Messaging Protocol의 약자로, 메시지 지향 미들웨어를 위한 간단한 텍스트 기반 프로토콜입니다. 주로 웹소켓 통신에서 사용되며, 클라이언트와 서버 간의 메시지 교환을 위한 상호운용 가능한 유선 형식을 제공합니다.

STOMP를 사용하면 웹소켓 기반의 실시간 통신 애플리케이션을 더 쉽고 효율적으로 개발할 수 있습니다. 특히 복잡한 메시징 패턴이 필요한 경우나 다양한 클라이언트 (웹, 모바일 등)를 지원해야 하는 경우에 유용합니다.



### 참고사이트


https://www.chanstory.dev/blog/post/26
