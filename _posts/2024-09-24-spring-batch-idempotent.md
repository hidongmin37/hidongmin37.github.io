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




## &nbsp;&nbsp; 1-1) 제어할 수 없는 코드 처리


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


## &nbsp;&nbsp; 1-2) JobParameters 활용

JobParameters를 활용하여 배치 작업이 고유하게 실행되도록 할 수 있습니다. 예를 들어, 작업 실행마다 날짜나 실행 ID와 같은 고유값을 파라미터로 전달하여, 이를 기반으로 작업이 수행되도록 설정할 수 있습니다.


```java
@Bean
public Job processJob(JobBuilderFactory jobBuilderFactory, Step step) {
    return jobBuilderFactory.get("processJob")
            .incrementer(new RunIdIncrementer()) // 고유 run.id를 생성하여 작업마다 고유하게 만듦
            .listener(listener())
            .flow(step)
            .end()
            .build();
}
```

여기서 RunIdIncrementer()는 각 실행마다 자동으로 증가하는 run.id를 JobParameters에 추가합니다. 이는 각 작업 실행을 구별하는 데 사용됩니다.



## &nbsp;&nbsp; 2) 상태 확인을 통한 중복 작업 방지
중복 처리를 방지하기 위해 상태를 확인하는 로직을 도입할 수 있습니다. 이는 특히 데이터가 이미 처리되었는지 확인하는 경우에 유용합니다.

```java
public void write(List<? extends Product> products) {
    products.forEach(product -> {
        if (!productRepository.existsByProductId(product.getProductId())) {
            productRepository.save(product);
        } else {
            logger.info("Product already processed: {}", product.getProductId());
        }
    });
}
```


<br>

## &nbsp;&nbsp; 3) 재시도 로직의 멱등 구현

재시도 로직을 구현할 때는 ItemProcessor에서 각 아이템의 처리 상태를 검사하여, 이미 처리된 항목은 건너뛰도록 할 수 있습니다. 이는 ItemProcessor에서 특정 조건에 따라 null을 반환함으로써 ItemWriter에서 해당 항목을 처리하지 않도록 하는 방법으로 구현될 수 있습니다.


```java
@Bean
public ItemProcessor<Payment, Payment> idempotentProcessor() {
  return new ItemProcessor<Payment, Payment>() {
    @Override
    public Payment process(Payment item) throws Exception {
      if (paymentService.hasBeenProcessed(item.getTransactionId())) {
        logger.info("Skipping processed transaction: {}", item.getTransactionId());
        return null; 
      }
      return item; 
    }
  };
}

```

이 프로세서는 이미 처리된 트랜잭션을 건너뛰게 하며, 이는 ItemWriter에서 더 이상 해당 아이템을 처리하지 않도록 합니다. 이러한 방식은 배치 작업의 효율을 높이고, 데이터 중복 입력을 방지하여 멱등성을 보장합니다.

스프링 배치의 @StepScope를 사용하여 리더, 프로세서, 라이터가 각 배치 실행에 대해 적절한 컨텍스트에서 동작하도록 설정할 수도 있습니다. 이렇게 설정함으로써, 각 배치 실행은 독립적인 실행 컨텍스트에서 관리되어 멱등성을 보장받을 수 있습니다.


<br>


---

### 결론

이러한 방법들을 조합해 Spring Batch의 멱등성을 유지할 수 있습니다. 상황에 맞게 적용하고, 충분한 테스트와 모니터링을 통해 안정성을 높이는 것이 중요합니다.


---


### 참고사이트

https://jojoldu.tistory.com/451

