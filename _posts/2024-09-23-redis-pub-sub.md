---
title: "redis pub/sub 활용하기"
date: 2024-09-23
comments: true
categories:
  - posts
tags:
  - redis
  - pub/sub
  - coding
---

<br>

## Redis Pub/Sub이란?
> Redis Pub/Sub은 Redis의 메시징 시스템 중 하나로, 발행-구독(Publish-Subscribe) 패턴을 구현한 기능입니다. 두 시스템 간의 의존성을 줄여주는 느슨한 결합(loose coupling) 구조를 채택하고 있어, Publisher(발행자)와 Subscriber(구독자)가 서로의 존재를 몰라도 메시지 통신이 가능합니다.


<br>

---

### Redis Pub/Sub의 장점

#### 1. **느슨한 결합** :<br>
Publisher는 메시지를 보내기만 하고, 누구에게 보내는지 알 필요가 없습니다. 마찬가지로 Subscriber도 어느 Publisher에서 메시지를 보냈는지 알 필요 없이 원하는 메시지만 받아볼 수 있습니다.

#### 2. **확장성* :<br>
이러한 구조 덕분에 시스템이 커지거나 역할이 추가되더라도 기존 시스템에 대한 수정이 거의 필요하지 않습니다.



Publisher는 특정 채널에 메시지를 Publish하고, Subscriber는 자신이 관심 있는 채널을 Subscribe하여 메시지를 수신합니다. 이로 인해 Subscriber의 기능이나 상태가 변경되어도 Publisher에게 영향을 미치지 않습니다.


<br>

---


### Redis Pub/Sub의 특징

#### 1. **느슨한 결합** :<br>
Publisher와 Subscriber 사이에 직접적인 의존성이 없으므로, 시스템 확장 시 변경에 유연하게 대응할 수 있습니다.

#### 2. **실시간 메시징** :<br>
메시지가 발행되자마자 즉시 구독자에게 전달되어 실시간성이 뛰어납니다.

#### 3. **다대다 통신** :<br>
하나의 채널에 여러 Publisher와 여러 Subscriber가 존재할 수 있어 복잡한 시스템에서도 유연한 통신을 지원합니다.

#### 4. **채널 기반** :<br>
각 메시지는 특정 채널을 통해 전달되며, Subscriber는 필요한 채널만 구독하여 필요한 메시지만 받아볼 수 있습니다.


<br>


---

### Redis Pub/Sub과 Redis Stream의 차이점

#### **Pub/Sub 실시간 전달** :<br>

Redis Pub/Sub은 발행된 메시지를 바로 전달합니다. 메시지를 수신할 준비가 되지 않은 Subscriber는 해당 메시지를 놓칠 수 있습니다. 메시지를 보관하지 않기 때문에 "발행 후 잊기(Fire and Forget)" 방식으로 작동합니다.

#### **Stream 메시지 보관** :<br>

반면 Redis Stream은 메시지를 보관할 수 있어, Subscriber가 구독하지 않은 동안 발행된 메시지도 이후에 받을 수 있습니다. 따라서 데이터 손실을 방지하고 싶다면 Stream을 사용하는 것이 더 적합할 수 있습니다.


<br>


---

### Pub/Sub 명령어

#### 1. **SUBSCRIBE** : 원하는 채널을 구독합니다.
```markdown
$ SUBSCRIBE <channel> [channel ...] 

$ SUBSCRIBE ch:order ch:payment
```

#### 2. **PUBLISH** : 메시지를 지정한 채널로 발행합니다.
```markdown
$ PUBLISH <channel> <message>

$ PUBLISH ch:order "order message"
```

#### 3. **UNSUBSCRIBE** : 구독을 취소합니다.
```markdown
$ UNSUBSCRIBE [channel ...]

$ UNSUBSCRIBE ch:order ch:payment
```

#### 4. **PSUBSCRIBE** : 패턴을 사용하여 채널을 구독합니다.
```markdown
$ PSUBSCRIBE <pattern> [pattern ...]

$ PSUBSCRIBE ch:* // 이 명령은 'ch:'로 시작하는 모든 채널을 구독합니다.
```

<br>


---

### Pub/Sub의 실제 활용 사례 
Redis Pub/Sub은 여러 분야에서 실시간성을 요구하는 애플리케이션에 유용하게 사용됩니다:

- **실시간 채팅 어플리케이션**: <br>
사용자 간 메시지를 즉각적으로 전달하는 데 사용됩니다.

- **실시간 알림 서비스**: <br>
실시간 알림을 제공하는 서비스에서 Pub/Sub을 통해 알림을 즉시 푸시(push)할 수 있습니다.

- **실시간 분석**: <br>
스트리밍 데이터 처리 시스템에서 실시간 분석을 구현할 수 있습니다.

- **IoT 데이터 스트리밍**: <br>
IoT 센서 데이터 스트리밍 및 실시간 수집에 사용됩니다.

- **마이크로서비스 간 통신**: <br>
마이크로서비스 아키텍처에서 서비스 간 비동기 통신을 구현할 수 있습니다.

<br>

---


### 예제코드 (Spring Boot 기반 구현)

```java
@Service
public class RedisMessageSubscriber implements MessageListener {
    
    @Override
    public void onMessage(Message message, byte[] pattern) {
        System.out.println("Received message: " + new String(message.getBody()));
    }
}

@Configuration
public class RedisConfig {

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(new RedisMessageSubscriber(), new PatternTopic("ch:order"));
        return container;
    }
}
```
위 코드는 Spring Boot에서 Redis Pub/Sub을 설정하는 간단한 예제입니다. 특정 채널에 메시지가 발행되면 RedisMessageSubscriber에서 해당 메시지를 받아 처리합니다.



## 결론

Redis Pub/Sub은 실시간 메시징 기능이 필요한 애플리케이션에서 유용하게 사용할 수 있는 솔루션입니다. 그 단순함과 빠른 성능 덕분에 실시간 채팅, 알림, 마이크로서비스 간 통신 등 다양한 상황에서 널리 활용됩니다.

<br>

하지만 메시지 영속성이 요구되는 경우, Redis Stream이나 Kafka와 같은 다른 메시징 시스템을 고려해야 합니다. 요구사항에 맞는 적절한 선택과 설계가 시스템 성능에 큰 영향을 미치기 때문에 이를 신중히 판단해야 합니다.


---

### 참고사이트

<a  href="https://inpa.tistory.com/entry/REDIS-%F0%9F%93%9A-PUBSUB-%EA%B8%B0%EB%8A%A5-%EC%86%8C%EA%B0%9C-%EC%B1%84%ED%8C%85-%EA%B5%AC%EB%8F%85-%EC%95%8C%EB%A6%BC"> Inpa 블로그</a>





