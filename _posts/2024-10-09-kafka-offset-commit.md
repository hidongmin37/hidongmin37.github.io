---
title: 카프카에서 오프셋 자동/수동 커밋하기
date: 2024-10-09
comments: true
categories:
  - posts
tags:
  - kafka
  - offset
  - commit
  - coding
---


# 커밋에 앞서 오프셋이란?
카프카에서 오프셋이란 컨슈머가 메시지를 어디까지 읽었는지 저장하는 값입니다. 오프셋은 카프카 클러스터에 저장되며, 컨슈머가 읽은 메시지의 위치를 추적하고, 컨슈머가 중단된 후에도 메시지를 정확하게 읽을 수 있도록 합니다.

오프셋은 각 파티션마다 독립적으로 관리됩니다. 즉, 하나의 토픽에 여러 파티션이 있다면, 각 파티션마다 별도의 오프셋이 존재합니다. 이는 컨슈머가 각 파티션을 병렬로 처리할 수 있도록 합니다.


<br>

## 오프셋에 대하여 알아보기
오프셋은 0부터 시작하는 정수값입니다. 예를 들어, offset=3인 경우에는 offset 0, 1, 2까지의 메시지를 읽었다는 의미입니다. 컨슈머가 메시지를 읽을 때마다 오프셋은 자동으로 증가하며, 컨슈머가 중단된 후에도 오프셋은 유지됩니다.

<br>

```
[0]   [1]   [2]   [3]   [4]   [5]   [6] ...
 ↑     ↑     ↑     ↑
읽음   읽음   읽음  다음에 읽을 메시지
```

<br>


## 오프셋 커밋 방식

카프카에서 오프셋 커밋은 자동 커밋과 수동 커밋 방식으로 나뉩니다. 각각의 방식에는 장단점이 있으며, 애플리케이션의 요구사항에 따라 적절한 방식을 선택해야합니다.

<br>

### 1. 자동 커밋(Auto Commit)
자동 커밋은 카프카 컨슈머 설정에서 `enable.auto.commit`을 `true`로 설정하면, 일정한 간격으로 컨슈머가 읽은 오프셋을 자동으로 커밋합니다. 이 방식은 설정이 간단하고, 별도의 코드 작성이 필요 없다는 장점이 있지만, 메시지 처리에 실패했을 때 정확한 위치를 보장하지 못할 수 있다는 단점이 있습니다.

<br>

1.&nbsp;&nbsp; 컨슈머는 메시지를 가져옵니다.

2.&nbsp;&nbsp; 설정된 시간 간격(auto.commit.interval.ms)마다 자동으로 오프셋을 커밋합니다.

<br>

예시코드

```java
	@Bean
	public ConsumerFactory<String, NotificationDto> consumerFactory() {
		Map<String, Object> config = new HashMap<>();
		config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
		config.put(ConsumerConfig.GROUP_ID_CONFIG, "group_1");
		config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true); // 자동 커밋 활성화
    config.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 1000); // 커밋 주기 1초
    config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
		config.put(JsonDeserializer.TRUSTED_PACKAGES, "com.payment.common.dto");

		return new DefaultKafkaConsumerFactory<>(config,
			new StringDeserializer(),
			new JsonDeserializer<>(NotificationDto.class, false));
	}
```

이 코드에서 `ENABLE_AUTO_COMMIT_CONFIG`을 `true`로 설정하면, 컨슈머가 일정한 주기로 오프셋을 자동으로 커밋하고,  `AUTO_COMMIT_INTERVAL_MS_CONFIG`을 1초로 설정하면 1초마다 오프셋을 커밋합니다. 이는 컨슈머가 메시지를 처리한 후 1초 내에 오프셋을 커밋한다는 의미입니다.


<br>

- **장점**
  - 설정이 간단하다.
  - 별도의 코드 작성이 필요 없다.
  - 대량의 메시지를 빠르게 처리할 때 유용하다.
  
- **단점**
  - 메시지 처리 실패 시 데이터 손실 위험이 존재할 수 있습니다.
  
- **주의사항**
  - 자동 커밋 주기를 너무 짧게 설정하면 오프셋 커밋이 빈번하게 발생하여 컨슈머의 처리량을 저하시킬 수 있습니다.
  - 반대로 너무 길게 설정하면 메시지 중복 처리의 위험이 증가합니다.



<br>

### 2. 수동 커밋(Manual Commit)
수동 커밋은 개발자가 직접 메시지를 처리한 후 오프셋을 커밋하는 방식입니다. 이 방식은 메시지 처리의 정확성을 보장할 수 있지만, 코드가 복잡해지고 추가적인 예외 처리가 필요하다는 단점이 있습니다.


<br>

1.&nbsp;&nbsp; 컨슈머가 메시지를 가져옵니다.

2.&nbsp;&nbsp; 메시지를 처리합니다.

3.&nbsp;&nbsp; 메시지 처리가 완료되면 개발자가 명시적으로 오프셋을 커밋합니다.


예시코드

```java

  @Bean
  public ConsumerFactory<String, NotificationDto> consumerFactory() {
    Map<String, Object> config = new HashMap<>();
    config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
    config.put(ConsumerConfig.GROUP_ID_CONFIG, "group_1");
    config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // 수동 커밋 활성화
    config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
    config.put(JsonDeserializer.TRUSTED_PACKAGES, "com.payment.common.dto");

    return new DefaultKafkaConsumerFactory<>(config,
      new StringDeserializer(),
      new JsonDeserializer<>(NotificationDto.class, false));
  }


  @KafkaListener(topics = "payment-notifications", groupId = "notification-group")
  public void listenNotifications(NotificationDto notificationDto, Acknowledgment acknowledgment) {
    log.info("Received notification: {}", notificationDto);
    try {
      processNotification(notificationDto);
      acknowledgment.acknowledge();  // 메시지 처리 후 오프셋 커밋
    } catch (Exception e) {
      log.error("Error processing notification", e);
      // 여기서는 acknowledge()를 호출하지 않습니다. 실패한 경우 재처리를 위해
    }
  }
```

이 리스너 메소드에서 주목할 점은 다음과 같습니다.

- `Acknowledgment` 객체를 파라미터로 받아 수동으로 커밋을 제어합니다.
- 메시지 처리가 성공적으로 완료된 후에만 `acknowledge()` 메서드를 호출하여 오프셋을 커밋합니다.
- 예외가 발생한 경우, 오프셋을 커밋하지 않습니다. 이렇게 하면 실패한 메시지를 다시 처리할 수 있습니다.



<br>

- **장점**
  - 메시지 처리 완료 후 오프셋을 커밋하므로, 데이터의 정확성을 보장할 수 있습니다.

- **단점**
  - 코드가 복잡해집니다.
  - 수동으로 커밋 로직을 작성해야 합니다.

- **주의사항**
- 수동 커밋을 사용할 때는 메시지 처리 후에 반드시 오프셋을 커밋해야합니다. 그렇지 않으면 메시지가 중복으로 처리될 수 있습니다.

<br>



수동 커밋에서 kafkaListener를 사용해서 하는 것 외에  `commitSync()` 또는 `commitAsync()` 메서드를 사용하여 오프셋을 커밋합니다.

```

// 수동 동기 커밋
try {
  consumer.commitSync();
} catch (CommitFailedException e) {
  // 커밋 실패 처리
  log.error("Commit failed", e);
}


// 수동 비동기 커밋
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        // 커밋 실패 처리
        log.error("Async commit failed", exception);
    }
});
```

- `commitSync()`: 동기적으로 커밋을 수행하고, 커밋이 성공할 때까지 기다립니다. 안정성이 높지만 성능에 영향을 미칠 수 있습니다.

- `commitAsync()`: 비동기적으로 커밋을 수행하며, 커밋 실패 시 재시도하지 않습니다. 또한 성능이 우수하고 실패 시 손실 가능성이 있습니다.


<br>


## 결론

오프셋 커밋 방식의 선택은 애플리케이션의 요구사항, 처리해야 할 데이터의 중요도, 긜고 성능 요구사항에 따라 달라집니다. 자동 커밋은 간단하고 빠르지만, 데이터의 정확성이 중요한 경우에는 수동 커밋을 고려해야 합니다. 수동 커밋을 사용할때는 동기(`commitSync()`) 또는 비동기(`commitAsync()`) 커밋을 선택할 수 있으며, 각각의 장단점을 고려하여 적절한 방식을 선택해야합니다.




### 참고사이트
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kafka Confluent](https://www.confluent.io/blog/)
- [Spring for Apache Kafka Documentation](https://docs.spring.io/spring-kafka/docs/current/reference/html/)