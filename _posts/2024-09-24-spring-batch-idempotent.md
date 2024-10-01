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

# Spring Batch 멱등하게 운영하기


<br>

## 1. 멱등성이란?
> **멱등성(Idempotency)**은 연산을 여러 번 수행해도 결과가 변하지 않는 특성을 말합니다. 이는 분산 시스템이나 데이터 처리 작업에서 매우 중요하며, 안정적이고 일관된 결과를 보장합니다.

<br>

---





## 2. Spring Batch에서의 멱등성

Spring Batch 작업에서 멱등성을 보장하면 데이터의 일관성과 신뢰성을 유지할 수 있습니다. 특히 배치 작업이 반복되거나 재시도될 때, 중복 처리로 인한 오류를 방지할 수 있습니다.


<br>

--- 

## 3. 멱등성을 유지하는 방법


### &nbsp;&nbsp; 1) **고유 Job 파라미터 사용**

배치 작업에 고유한 Job 파라미터를 사용하여 중복 실행을 방지할 수 있습니다.


```java
public class StateTrackingItemProcessor implements ItemProcessor<InputData, OutputData> {
  @Autowired private JdbcTemplate jdbcTemplate;

  @Override
  public OutputData process(InputData item) throws Exception {
    String status = jdbcTemplate.queryForObject("SELECT status FROM item_status WHERE item_id = ?", String.class, item.getId());
    if ("PROCESSED".equals(status)) {
      return null; // 이미 처리된 아이템은 스킵
    }
    jdbcTemplate.incrementor(new RunIdIncrementer());
    // 처리 상태 업데이트
    jdbcTemplate.update("UPDATE item_status SET status = 'PROCESSED' WHERE item_id = ?", item.getId());
    return new OutputData(); // 아이템 처리 로직
  }
}

```


Job 실행 시마다 `UniqueRunIdIncrementer`를 사용해 고유한 ID를 생성하여 동일한 Job이 중복 실행되는 것을 막습니다.



<br>

### &nbsp;&nbsp; 2) **JobRepository 사용**


**JobRepository**는 Job 실행 이력을 관리하며, 동일한 파라미터로 Job이 다시 실행되는 것을 방지합니다.



```java
@Configuration
@EnableBatchProcessing
public class BatchConfig extends DefaultBatchConfigurer {
  @Override
  protected JobRepository createJobRepository() throws Exception {
    JobRepositoryFactoryBean factory = new JobRepositoryFactoryBean();
    factory.setDataSource(dataSource);
    factory.setTransactionManager(getTransactionManager());
    factory.setIsolationLevelForCreate("ISOLATION_SERIALIZABLE");
    factory.setTablePrefix("BATCH_");
    factory.setMaxVarCharLength(1000);
    return factory.getObject();
  }
}


```

<br>

### &nbsp;&nbsp; 3) **트랜잭션 관리**

각 청크 단위로 트랜잭션을 관리하며, 필요에 따라 트랜잭션 범위를 조정할 수 있습니다.

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {
  @Autowired private StepBuilderFactory stepBuilderFactory;

  @Bean
  public Step sampleStep(PlatformTransactionManager transactionManager) {
    return stepBuilderFactory.get("sampleStep")
      .<InputData, OutputData>chunk(10)
      .reader(itemReader())
      .processor(itemProcessor())
      .writer(itemWriter())
      .transactionManager(transactionManager)
      .build();
  }

  @Bean
  public PlatformTransactionManager transactionManager() {
    return new DataSourceTransactionManager(dataSource());
  }
}

```

  
<br>

### &nbsp;&nbsp; 4) **에러 처리 및 재시도 메커니즘**

일시적 오류에 대해 재시도 로직을 구현하고, 영구적인 오류는 적절히 처리합니다.


```java 
@Bean
public Step sampleStep() {
  return stepBuilderFactory.get("sampleStep")
    .<InputData, OutputData>chunk(10)
    .reader(itemReader())
    .processor(itemProcessor())
    .writer(itemWriter())
    .faultTolerant()
    .retry(TemporaryNetworkException.class)
    .retryLimit(3)
    .skip(UnrecoverableException.class)
    .skipLimit(5)
    .listener(new StepExecutionListener() {
      @Override
      public void afterStep(StepExecution stepExecution) {
        if (stepExecution.getStatus() == BatchStatus.FAILED) {
          // 로그 기록 또는 알림 발송
        }
      }
    })
    .build();
}

```

<br>

### &nbsp;&nbsp; 5) **상태 추적**

각 아이템의 처리 상태를 추적하여 중복 처리를 방지할 수 있습니다.



```java
public class StateTrackingItemProcessor implements ItemProcessor<InputData, OutputData> {
  @Autowired 
  private JdbcTemplate jdbcTemplate;

  @Override
  public OutputData process(InputData item) throws Exception {
    String status = jdbcTemplate.queryForObject("SELECT status FROM item_status WHERE item_id = ?", String.class, item.getId());
    if ("PROCESSED".equals(status)) {
      return null;
    }
    jdbcTemplate.update("UPDATE item_status SET status = 'PROCESSED' WHERE item_id = ?", item.getId());
    return new OutputData();
  }
}

```



<br>


---

## &nbsp;&nbsp; 6) 제어할 수 없는 코드 처리


**LocalDate.now()** 와 같이 제어할 수 없는 코드는 사용하지 말고, 외부에서 값을 주입받도록 해야 합니다.



```java
@Bean(name = BATCH_NAME + "_reader")
@StepScope
public JpaPagingItemReader<Product> reader(@Value("#{jobParameters[createDate]}") String createDate) {
  Map<String, Object> params = new HashMap<>();
  params.put("createDate", LocalDate.parse(createDate));
  return new JpaPagingItemReaderBuilder<Product>()
    .name(BATCH_NAME + "_reader")
    .entityManagerFactory(entityManagerFactory)
    .pageSize(chunkSize)
    .queryString("SELECT p FROM Product p WHERE p.createDate =:now")
    .parameterValues(params)
    .build();
}

```

공휴일/주말/평일 마다 테스트 결과가 달라지게 될 수도 있습니다.




<br>


---

### 결론

이러한 방법들을 조합해 Spring Batch의 멱등성을 유지할 수 있습니다. 상황에 맞게 적용하고, 충분한 테스트와 모니터링을 통해 안정성을 높이는 것이 중요합니다.


---


### 참고사이트

https://jojoldu.tistory.com/451

