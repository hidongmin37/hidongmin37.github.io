---
title: 선착순 이벤트 구현
date: 2024-10-03
comments: true
categories:
  - posts
tags:
  - first-come-first-served
    
  - coding
---

# 선착순 이벤트 구현의 중요 포인트 
선착순 이벤트에서 가장 중요한 점은 특정 시간에 집중되는 대량의 트래픽을 효과적으로 처리하는 것입니다. 

1. 클라이언트 요청의 빠르고 원활한 처리 
2. 서버의 확장성과 안정성 확보
3. 데이터의 정확성과 일관성 유지
4. 보안 및 공정성 확보
5. 장애 대응 및 복구 전략


## 선착순 이벤트 구현 방법

선착순 이벤트 구현은 Redis Sorted Set과 Kafka 그리고 Spring Batch를 활용하여 구현할 수 있습니다.

### Redis Sorted Set
빠른 데이터 처리와 순서 관리 <br>
분산 환경에서의 동시성 제어

### Kafka
메시지 큐잉과 비동기 처리 <br>
시스템 간 느슨한 결합 제공

### Spring Batch
대량의 데이터 처리와 주기적인 작업 수행<br>
장애 복구 및 재처리 기능 제공


<br>

---

### Sorted Set 활용

Redis의 Sorted Set(ZSet)은 데이터를 정렬된 상태로 저장합니다. 각 원소는 점수(score)와 값(value)으로 구성되어있으며,점수를 기준으로 정렬됩니다. 

#### Sorted Set의 구조

Sorted Set = Skip List + Hash Table

- Skip List : 빠른 검색을 위한 다층 구조의 Linked List
- Hash Table : 효율적인 키-값 쌍 저장 및 검색
 
<br>

---

### Kafka 활용

Kafka는 분산 메시징 시스템으로, 대용량의 데이터를 처리하는 데 적합합니다. 다음과 같은 이유로 선착순 이벤트에 적합합니다.

- 비동기 처리 지원
- 분산 환경에서의 메시지 일관성 보장
- 데이터 영속성 제공
- 대규모 트래픽 처리에 적합
- 장애 복구의 용이성

<br>

kafka에서 최적화 시키려면 다음과 같은 방법을 사용할 수 있습니다.

- 적절한 파티션 수 설정으로 병렬 처리 최적화
- 컨슈머 그룹을 활용한 로드 밸런싱
- 메시지 압축을 통한 네트워크 대역폭 절약

---

### Spring Batch 도입

Spring Batch는 대량의 데이터 처리에 특화된 프레임워크입니다.

- 대량의 기프티콘 발급 처리
- 이벤트 결과 집계 및 보고서 생성
- 주기적인 대기열 정리
- 장애 시 재처리 로직 구현

<br>

---


### 선착순 이벤트 구현 예시



### ① ```EventScheduler```



```java
@Slf4j
@Component
@RequiredArgsConstructor
public class EventScheduler {
  private final GifticonService gifticonService;
  private final KafkaTemplate<String, String> kafkaTemplate;

  @Scheduled(fixedDelay = 1000) // 이전 작업이 끝난 후 1초 후에 다음 작업을 실행하라는 의미
  private void chickenEventScheduler() {
    if (gifticonService.isEventEnded()) {
      log.info("===== 선착순 이벤트가 종료되었습니다. =====");
      return;
    }
    gifticonService.processEventRequests(Event.CHICKEN);
  }
}
```
<br>




### ② ```GifticonService```


```java
@Slf4j
@Service
@RequiredArgsConstructor
public class GifticonService {

  private final StringRedisTemplate redisTemplate;
  private final KafkaTemplate<String, String> kafkaTemplate;

  private static final String GIFTICON_COUNT_KEY = "GIFTICON_COUNT";
  private static final long PUBLISH_SIZE = 10;

  public void addQueue(Event event) {
    final String people = Thread.currentThread().getName();
    final long now = System.currentTimeMillis();

    redisTemplate.execute(new SessionCallback<List<Object>>() {
      @Override
      public List<Object> execute(RedisOperations operations) throws DataAccessException {
        operations.multi();
        operations.opsForZSet().add(event.toString(), people, now);
        operations.opsForValue().increment(GIFTICON_COUNT_KEY, -1);
        return operations.exec();
      }
    });

    log.info("대기열에 추가 - {} ({}초)", people, now);
    kafkaTemplate.send("event_requests", event.toString() + ":" + people);
  }

  public void getOrder(Event event) {
    Set<String> queue = redisTemplate.opsForZSet().rangeWithScores(event.toString(), 0, -1);
    queue.forEach(entry -> {
      Long rank = redisTemplate.opsForZSet().rank(event.toString(), entry);
      log.info("'{}'님의 현재 대기열은 {}명 남았습니다.", entry, rank);
    });
  }

  public void processEventRequests(Event event) {
    Set<String> winners = redisTemplate.opsForZSet().range(event.toString(), 0, PUBLISH_SIZE - 1);
    winners.forEach(winner ->
      kafkaTemplate.send("gifticon_publish", event.toString() + ":" + winner)
    );
  }

  @KafkaListener(topics = "gifticon_publish")
  public void processGifticonPublish(String message) {
    String[] parts = message.split(":");
    Event event = Event.valueOf(parts[0]);
    String people = parts[1];

    final Gifticon gifticon = new Gifticon(event, generateSecureCode());
    log.info("'{}'님의 {} 기프티콘이 발급되었습니다 ({})", people, gifticon.getEvent().getName(), gifticon.getCode());
    redisTemplate.opsForZSet().remove(event.toString(), people);
  }

  public boolean isEventEnded() {
    Long remainingGifticons = redisTemplate.opsForValue().get(GIFTICON_COUNT_KEY);
    return remainingGifticons != null && remainingGifticons <= 0;
  }

  private String generateSecureCode() {
    // 보안성이 강화된 코드 생성 로직 구현
    return UUID.randomUUID().toString() + System.nanoTime();
  }
}
```


<br>

### ③ Spring Batch를 활용한 대량 데이터 처리

```java
@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
public class GifticonIssuanceBatchConfig {

  private final JobBuilderFactory jobBuilderFactory;
  private final StepBuilderFactory stepBuilderFactory;
  private final StringRedisTemplate redisTemplate;
  private final KafkaTemplate<String, String> kafkaTemplate;

  @Bean
  public Job gifticonIssuanceJob() {
    return jobBuilderFactory.get("gifticonIssuanceJob")
      .start(winnerProcessingStep())
      .next(gifticonIssuanceStep())
      .next(dataCleanupStep())
      .build();
  }

  @Bean
  public Step winnerProcessingStep() {
    return stepBuilderFactory.get("winnerProcessingStep")
      .<String, Winner>chunk(100)
      .reader(kafkaItemReader())
      .processor(winnerProcessor())
      .writer(winnerWriter())
      .build();
  }

  @Bean
  public Step gifticonIssuanceStep() {
    return stepBuilderFactory.get("gifticonIssuanceStep")
      .<Winner, Gifticon>chunk(100)
      .reader(winnerReader())
      .processor(gifticonProcessor())
      .writer(gifticonWriter())
      .build();
  }

  @Bean
  public Step dataCleanupStep() {
    return stepBuilderFactory.get("dataCleanupStep")
      .tasklet(new DataCleanupTasklet(redisTemplate))
      .build();
  }

  @Bean
  @StepScope
  public KafkaItemReader<String, String> kafkaItemReader() {
    Properties props = new Properties();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "batch-consumer-group");

    return new KafkaItemReaderBuilder<String, String>()
      .topic("gifticon_publish")
      .partitions(0)
      .consumerProperties(props)
      .name("gifticonReader")
      .build();
  }

  @Bean
  public ItemProcessor<String, Winner> winnerProcessor() {
    return item -> {
      String[] parts = item.split(":");
      return new Winner(parts[1], Event.valueOf(parts[0]));
    };
  }

  @Bean
  public ItemWriter<Winner> winnerWriter() {
    return winners -> {
      for (Winner winner : winners) {
        redisTemplate.opsForSet().add("WINNERS", winner.toString());
      }
    };
  }

  @Bean
  @StepScope
  public ItemReader<Winner> winnerReader() {
    return new ItemReader<Winner>() {
      private Set<String> winners;
      private Iterator<String> iterator;

      @Override
      public Winner read() {
        if (winners == null) {
          winners = redisTemplate.opsForSet().members("WINNERS");
          iterator = winners.iterator();
        }
        if (iterator.hasNext()) {
          String[] parts = iterator.next().split(":");
          return new Winner(parts[0], Event.valueOf(parts[1]));
        }
        return null;
      }
    };
  }

  @Bean
  public ItemProcessor<Winner, Gifticon> gifticonProcessor() {
    return winner -> new Gifticon(winner.getEvent(), generateSecureCode());
  }

  @Bean
  public ItemWriter<Gifticon> gifticonWriter() {
    return gifticons -> {
      for (Gifticon gifticon : gifticons) {
        log.info("Issued gifticon: {}", gifticon);
        // 기프티콘 저장 로직 (DB 저장 또는 외부 시스템 호출)
        kafkaTemplate.send("gifticon_issued", gifticon.toString());
      }
    };
  }

  private String generateSecureCode() {
    // 보안성이 강화된 코드 생성 로직 구현
    return UUID.randomUUID().toString() + System.nanoTime();
  }
}

```


## 결론 

이처럼 Redis Sorted Set과 Kafka 그리고 Spring Batch를 결합하여 대량 트래픽과 비동기 처리, 그리고 대량 데이터 처리 문제를 해결하는 방식으로 설계되었습니다. 

✅ **데이터 일관성** <br>

Redis 트랜잭션을 사용하여 Sorted Set에 데이터를 추가하고, 기프티콘 수량 감소를 원자적으로 처리 <br>

Kafka트랜잭션을 활용하여 메시지 발행의 신뢰성 보장

✅ **확장성** <br>

Redis Cluster를 통하여 데이터 분산 및 고가용성 확보<br>

Kafka 파티션 및 컨슈머 그룹 최적화로 처리량 증대

✅ **보안** <br>

기프티콘 고드 생성 시 보안성 강화(UUID + 타임스탬프 조합 등)<br>

API 엔드포인트에 rate limiting 적용

✅ **오류 처리 및 복구** <br>

Spring Retry를 활용하여 일시적 오류 자동 재시도

Dead Letter Queue를 통해서 실패 메시지 관리


## 요약

이 설계는 Redis Sorted Set, Kafka, 그리고 Spring Batch를 결합하여 대량 트래픽, 비동기 처리, 그리고 대량 데이터 처리 문제를 해결하는 방식으로 구성되었습니다.

📌 Redis Sorted Set은 이벤트 참가자들의 순서를 시간 기반으로 관리하며, Skip List를 통해 빠른 검색과 정렬을 제공합니다. 또한 분산 락을 통해 동시성 문제를 해결합니다.

📌 Kafka는 대용량 트래픽을 비동기적으로 처리하고, 메시지 영속성을 보장해 이벤트 처리의 안정성과 신뢰성을 높입니다. 적절한 파티셔닝과 컨슈머 그룹 설정으로 처리량을 최적화합니다.

📌 Spring Batch는 대량의 기프티콘 발급과 주기적인 대량 데이터 처리를 담당합니다. 재시도 메커니즘과 오류 처리 로직을 통해 안정성을 확보합니다.






### 참고사이트

https://velog.io/@hgs-study/redis-sorted-set

https://techblog.gccompany.co.kr/redis-kafka%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%84%A0%EC%B0%A9%EC%88%9C-%EC%BF%A0%ED%8F%B0-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EA%B0%9C%EB%B0%9C%EA%B8%B0-feat-%EB%84%A4%EA%B3%A0%EC%99%95-ec6682e39731