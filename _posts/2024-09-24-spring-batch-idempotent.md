---
title: "spring batch 멱등하게 운영하기"
date: 2024-09-24
comments: true
categories:
  - posts
tags:
  - spring batch
  - coding
---

<br>

### 멱등성이란?
> 멱등성(Idempotency)은 연산을 여러 번 수행해도 결과가 달라지지 않는 특성을 말합니다. 이는 분산 시스템이나 데이터 처리 작업에서 중요한 개념으로, 안정적이고 일관된 결과를 보장하는 데 핵심적인 역할을 합니다.


<br>

---

<br>


## Spring Batch에서의 멱등성

Spring Batch 작업에서 멱등성을 보장하는 것은 데이터의 일관성과 신뢰성을 유지하는 데 필수적입니다. 특히 배치 작업이 반복적으로 실행되거나 실패 후 재시도될 경우, 멱등성은 중복 처리로 인한 오류를 방지합니다.


### 1. 매일 한 번 어제 매출 데이터 집계

#### 시나리오:
매일 자정에 배치 작업이 실행되어 전날의 매출 데이터를 집계합니다.

#### 멱등성 구현:
- 작업 시작 시 항상 어제 날짜를 기준으로 데이터를 조회합니다.
- 집계 전 해당 날짜의 기존 집계 데이터를 삭제합니다. ➡️ 이 때, 데이터가 이미 삭제되어 있다면 무시합니다.
- 새로운 집계 결과를 삽입합니다.

#### 예시코드

```java
@Bean
public Job dailySalesJob(JobBuilderFactory jobBuilderFactory, StepBuilderFactory stepBuilderFactory) {
  return jobBuilderFactory.get("dailySalesJob")
    .start(deletePreviousSummaryStep(stepBuilderFactory))
    .next(dailySalesStep(stepBuilderFactory))
    .build();
}

@Bean
public Step deletePreviousSummaryStep(StepBuilderFactory stepBuilderFactory) {
  return stepBuilderFactory.get("deletePreviousSummaryStep")
    .tasklet((contribution, chunkContext) -> {
      LocalDate yesterday = LocalDate.now().minusDays(1);
      salesSummaryRepository.deleteByDate(yesterday);
      return RepeatStatus.FINISHED;
    })
    .build();
}

@Bean
public Step dailySalesStep(StepBuilderFactory stepBuilderFactory) {
  return stepBuilderFactory.get("dailySalesStep")
    .<Sale, SalesSummary>chunk(100)
    .reader(salesReader())
    .processor(salesProcessor())
    .writer(salesSummaryWriter())
    .build();
}

@Bean
@StepScope
public JpaPagingItemReader<Sale> salesReader() {
  LocalDate yesterday = LocalDate.now().minusDays(1);
  return new JpaPagingItemReaderBuilder<Sale>()
    .name("salesReader")
    .entityManagerFactory(entityManagerFactory)
    .queryString("SELECT s FROM Sale s WHERE s.date = :date")
    .parameterValues(Collections.singletonMap("date", yesterday))
    .build();
}
```

<br>

### 2. 실행 시간 기준으로 어제 데이터 집계

#### 시나리오:
배치 작업이 실행되는 현재 시간을 기준으로 어제 날짜의 데이터를 집계합니다.


#### 멱등성 구현:
- 작업 시작 시 현재 시간을 기준으로 어제 날짜를 계산해 데이터를 조회합니다.
- 기존 집계 데이터가 있다면 덮어쓰고, 없으면 새로 생성합니다.


#### 예시코드

```java
@Bean
@StepScope
public ItemReader<Transaction> transactionReader() {
  LocalDate yesterday = LocalDate.now().minusDays(1);
  return new JpaPagingItemReaderBuilder<Transaction>()
    .name("transactionReader")
    .entityManagerFactory(entityManagerFactory)
    .queryString("SELECT t FROM Transaction t WHERE DATE(t.transactionDate) = :yesterday")
    .parameterValues(Collections.singletonMap("yesterday", yesterday))
    .build();
}

@Bean
public ItemWriter<TransactionSummary> transactionSummaryWriter() {
  return items -> {
    for (TransactionSummary summary : items) {
      TransactionSummary existingSummary = summaryRepository.findByDate(summary.getDate());
      if (existingSummary != null) {
        existingSummary.update(summary);
        summaryRepository.save(existingSummary);
      } else {
        summaryRepository.save(summary);
      }
    }
  };
}
```


<br>

### 3. 오늘 기준으로 휴면 회원 처리

#### 시나리오:
매일 일정 시간에 배치 작업을 실행하여, 현재 날짜 기준으로 1년 이상 로그인하지 않은 회원을 휴면 상태로 변경합니다.


#### 멱등성 구현:

- 현재 날짜를 기준으로 휴면 대상 회원을 조회합니다.
- 이미 휴면 처리된 회원은 제외하고, 처리 시 해당 일자를 기록하여 중복 처리를 방지합니다.


#### 예시코드

```java
@Bean
@StepScope
public JpaPagingItemReader<User> dormantUserReader() {
  LocalDate oneYearAgo = LocalDate.now().minusYears(1);
  return new JpaPagingItemReaderBuilder<User>()
    .name("dormantUserReader")
    .entityManagerFactory(entityManagerFactory)
    .queryString("SELECT u FROM User u WHERE u.lastLoginDate < :oneYearAgo AND u.status != 'DORMANT'")
    .parameterValues(Collections.singletonMap("oneYearAgo", oneYearAgo))
    .build();
}

@Bean
public ItemProcessor<User, User> dormantUserProcessor() {
  return user -> {
    user.setStatus("DORMANT");
    user.setDormantDate(LocalDate.now());
    return user;
  };
}

@Bean
public ItemWriter<User> dormantUserWriter() {
  return users -> {
    for (User user : users) {
      User existingUser = userRepository.findById(user.getId()).orElse(null);
      if (existingUser != null && !existingUser.getStatus().equals("DORMANT")) {
        userRepository.save(user);
      }
    }
  };
}
```

<br>


### 주의) Spring Batch의 동시 실행 방지 기능

Spring Batch는 기본적으로 동일한 JobInstance의 동시 실행을 방지합니다. 이는 JobRepository를 통해 구현되며, 작업 실행 전에 이미 실행 중인 동일한 Job이 있는지 확인합니다.

<br>

그러나 이 기능에는 몇 가지 주의점이 있습니다:

**분산 환경에서의 제한:** <br>
기본 구현은 단일 데이터베이스를 사용하는 환경에서만 완벽하게 작동합니다.

**네트워크 지연:** <br>
분산 환경에서 네트워크 지연으로 인해 동시 실행 체크가 정확하지 않을 수 있습니다.

**데이터베이스 트랜잭션:** <br>
동시 실행 체크와 작업 실행 사이에 미세한 시간 차이가 있을 수 있습니다.

따라서, 완벽한 동시 실행 방지를 위해서는 추가적인 조치가 필요할 수 있습니다.


<br>

---

## 분산 환경에서의 동시 실행 방지

분산 환경에서 더 강력한 동시 실행 방지를 위해 다음과 같은 방법을 고려할 수 있습니다:

### 1. **분산 락(Distributed Lock) 사용:**
- Redis, ZooKeeper 등의 분산 락 서비스를 사용하여 동시 실행을 제어합니다.
- 작업 실행 전 락을 획득하고, 작업 완료 후 락을 해제합니다.


### 2. **데이터베이스 락 사용:**

- SELECT FOR UPDATE 등의 쿼리를 이용한 데이터베이스 수준의 락 구현
- 주의: 데이터베이스 성능에 영향을 줄 수 있음

### 3. **큐 시스템 활용:**

- RabbitMQ, Apache Kafka 등의 메시지 큐 시스템을 이용한 작업 관리
- 작업을 큐에 등록하고 단일 컨슈머가 처리하도록 구성


## Kafka를 이용한 Spring batch 작업관리

Kafka를 이용하여 Spring Batch 작업을 관리하는 방법은 다음과 같습니다:

### **구현 전략:** <br>
- 각 배치 작업을 Kafka 토픽의 메시지로 표현합니다.
- 단일 컨슈머 그룹을 사용하여 메시지를 순차적으로 처리합니다.
- 작업 완료 후 커밋을 통해 중복 처리를 방지합니다.

<br>

### **예시 코드:** <br>


```java
@Configuration
public class KafkaConfig {
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "batch-job-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
```

Kafka 컨슈머 팩토리와 리스너 컨테이너 팩토리를 빈으로 등록합니다.

<br>

---

```java
@Component
public class BatchJobListener {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job sampleBatchJob;

    @KafkaListener(topics = "batch-jobs", groupId = "batch-job-group")
    public void listenGroupFoo(String message) {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addString("jobId", message)
                    .addDate("date", new Date())
                    .toJobParameters();
            
            JobExecution jobExecution = jobLauncher.run(sampleBatchJob, jobParameters);
            
            if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
                System.out.println("Batch job completed successfully");
            } else {
                System.out.println("Batch job failed with status: " + jobExecution.getStatus());
            }
        } catch (Exception e) {
            System.err.println("Error executing batch job: " + e.getMessage());
        }
    }
}
```
배치 작업 리스너를 등록하여 배치 작업을 실행합니다.

<br>

---

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {

    @Autowired
    public JobBuilderFactory jobBuilderFactory;

    @Autowired
    public StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job sampleBatchJob() {
        return jobBuilderFactory.get("sampleBatchJob")
                .start(sampleBatchStep())
                .build();
    }

    @Bean
    public Step sampleBatchStep() {
        return stepBuilderFactory.get("sampleBatchStep")
                .tasklet((contribution, chunkContext) -> {
                    System.out.println("Executing sample batch step");
                    Thread.sleep(5000); // 작업 시뮬레이션
                    return RepeatStatus.FINISHED;
                })
                .build();
    }
}
```
배치 작업 정의

<br>

---
  
```java
@Component
public class JobScheduler {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(cron = "0 0 1 * * ?") // 매일 새벽 1시에 실행
    public void scheduleJobExecution() {
        String jobId = UUID.randomUUID().toString();
        kafkaTemplate.send("batch-jobs", jobId);
    }
}
```
작업 스케줄러 (옵션)


<br>

---

### 👩🏻‍🏫 코드 설명

1️⃣ KafkaConfig<br> 
Kafka 컨슈머 설정을 정의합니다. 단일 컨슈머 그룹을 사용하여 동시 실행을 방지합니다.

2️⃣ BatchJobListener <br>
Kafka 토픽에서 메시지를 수신하고 배치 작업을 실행합니다.
`@KafkaListener` 어노테이션을 사용하여 특정 토픽을 구독합니다.

3️⃣ BatchConfig <br>
실제 배치 작업의 로직을 정의합니다. 이 예시에서는 간단한 작업을 시뮬레이션합니다.

4️⃣ JobScheduler (옵션) <br>
정기적으로 Kafka 토픽에 메시지를 보내 배치 작업을 스케줄링합니다.

<br>

---

**이 방식의 장점은 다음과 같습니다:**

- **분산 환경에서 효과적으로 작동:** Kafka의 분산 특성을 활용합니다.

<br>

- **순차적 실행 보장:** 단일 컨슈머 그룹을 사용하여 작업의 순차적 실행을 보장합니다.
<br>

- **장애 복구 용이:** Kafka의 오프셋 관리를 통해 작업 실패 시 쉽게 재시작할 수 있습니다.

<br>

---


## 결론

Spring Batch에서 멱등성을 구현하면 데이터 처리의 안정성과 신뢰성을 크게 향상시킬 수 있습니다. 

예시에서처럼 날짜 기반 데이터 필터링과 중복 처리 방지 로직을 추가하여, 배치 작업이 재실행되더라도 일관된 결과를 보장할 수 있습니다.

또한, 동시 실행 방지를 위해 Spring Batch의 기본 기능과 함께 추가적인 분산 락 메커니즘을 활용하면, 더욱 안정적인 배치 시스템을 구축할 수 있습니다. 

이는 특히 대규모 분산 환경에서 중요하며, 데이터의 정합성을 유지하는 데 큰 도움이 됩니다.

마지막으로, 멱등성 구현 시 항상 에지 케이스와 예외 상황을 고려해야 합니다. 

철저한 테스트와 모니터링을 통해 배치 작업의 안정성을 지속적으로 검증하고 개선하는 것이 중요합니다.


---

### 참고사이트

https://jojoldu.tistory.com/451

