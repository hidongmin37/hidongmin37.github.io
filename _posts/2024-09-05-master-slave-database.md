---
title: "master && slave database구조"
date: 2024-09-05
comments: true
categories:
  - posts
tags:
  - master&&slave
  - coding
---

<br>

### Master && Slave Database란?
> Master-Slave 데이터베이스 구조는 하나의 주 데이터베이스(Master)와 하나 이상의 복제 데이터베이스(Slave)로 구성됩니다.

<br>

----

### Master Database
- Master 데이터베이스는 읽기 및 쓰기 작업(INSERT, UPDATE, DELETE)을 처리하는 주 데이터베이스입니다.
- 모든 데이터 변경 작업은 Master 데이터베이스에서 수행됩니다.

<br>

----

### Slave Database
- Slave 데이터베이스는 읽기 작업(SELECT)을 처리하는 데이터베이스입니다.
- Master의 데이터를 복제하여 데이터를 동기화합니다.


<br>

---

#### 장점

⓵ 로드 밸런싱
읽기 작업을 Slave 데이터베이스로 분산하여 Master 데이터베이스의 부하를 줄일 수 있습니다.

⓶ 데이터 백업
Slave는 실시간으로 Master의 데이터를 복제하므로 백업역할을 합니다.

⓷ 데이터 안정성
Master 데이터베이스에 장애가 발생하더라도 Slave 데이터베이스가 데이터를 보유하고 있으므로 데이터 손실을 방지할 수 있습니다.

<br>

#### 단점
⓵ 지연 시간
Master 데이터베이스의 데이터 변경 작업이 Slave 데이터베이스로 복제되는 시간이 소요됩니다.

⓶ 구조가 복잡해져 관리가 어려워질 수 있습니다.

<br>

---

#### 구현 방법
```markdown
@Transactional(readOnly = true) 인 경우는 Slave DB 접근
@Transactional(readOnly = false) 인 경우는 Master DB 접근
```
위와 같은 방식으로 구현을 합니다.

1.&nbsp;application.yml설정
```yaml
spring:
  datasource:
    master:
      jdbc-url: ${DATABASE_URL}
      username: ${DATABASE_USERNAME}
      password: ${DATABASE_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 10
        minimum-idle: 5
    slave:
      jdbc-url: ${DATABASE_SLAVE_URL}
      username: ${DATABASE_SLAVE_USERNAME}
      password: ${DATABASE_SLAVE_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 20
        minimum-idle: 10
```
해당 yml파일에 설정해 둔 것과 같이 DB에 접근하기 위해 접근 정보를 정의합니다. 

<br>

2.&nbsp; Master, Slave DataSource 설정
```java

@Configuration
@Slf4j
public class DataSourceConfig {

	@Bean("masterDataSource")
	@ConfigurationProperties(prefix = "spring.datasource.master")
	public DataSource masterDataSource() {
		return DataSourceBuilder.create().type(HikariDataSource.class).build();
	}

	@Bean("slaveDataSource")
	@ConfigurationProperties(prefix = "spring.datasource.slave")
	public DataSource slaveDataSource() {
		return DataSourceBuilder.create().type(HikariDataSource.class).build();
	}

	@Bean
	@Primary
	@DependsOn({"masterDataSource", "slaveDataSource"})
	public DataSource routingDataSource(
		@Qualifier("masterDataSource") DataSource masterDataSource,
		@Qualifier("slaveDataSource") DataSource slaveDataSource) {

		RoutingDataSource routingDataSource = new RoutingDataSource();

		Map<Object, Object> targetDataSources = new HashMap<>();
		targetDataSources.put("master", masterDataSource);
		targetDataSources.put("slave", slaveDataSource);

		routingDataSource.setTargetDataSources(targetDataSources);
		routingDataSource.setDefaultTargetDataSource(masterDataSource);

		// 데이터 소스 설정에 대한 로깅 추가
		log.info("Configured RoutingDataSource with master and slave data sources");

		return new LazyConnectionDataSourceProxy(routingDataSource);
	}
}
```

위와 같이 DataSourceConfig클래스를 생성하여 Master, Slave DataSource를 Bean 으로 등록합니다.

<br>

3.&nbsp; RoutingDataSource 설정
```java
@Slf4j
public class RoutingDataSource extends AbstractRoutingDataSource {

	@Override
	protected Object determineCurrentLookupKey() {
		String dataSourceType = TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? "slave" : "master";
		MDC.put("datasource", dataSourceType);
		try {
			return dataSourceType;
		} finally {
			MDC.remove("datasource"); // 컨텍스트 정리
		}
	}

}
```
RoutingDataSource클래스를 생성하여 AbstractRoutingDataSource를 상속받아 determineCurrentLookupKey()메서드를 오버라이딩하여 Master, Slave DataSource를 구분합니다.

<br>

#### 2번과정에서 LazyConnectionDataSourceProxy로 감싼이유는

```markdown
TransactionManager -> LazyConnectionDataSourceProxy에서 Connection Proxy 객체 획득 -> Transaction 동기화 -> Connection Proxy 객체 반환
```
- LazyConnectionDataSourceProxy는 실제 커넥션을 가져오는 시점까지 커넥션을 생성하지 않습니다.
- 이를 통해 Master, Slave DataSource를 구분하여 사용할 수 있습니다.


---

<br>

#### 참고사이트

https://k3068.tistory.com/102