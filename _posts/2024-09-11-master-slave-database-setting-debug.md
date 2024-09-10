---
title: "master & slave database setting debug"
date: 2024-09-11
comments: true
categories:
  - posts
tags:
  - master
  - slave
  - coding
---

<br>

### Master & Slave 세팅에서 어떻게 어노테이션을 가지고 master, slave를 구분할 수 있을까?
> 먼저 이를 위해서는 어떻게 동작하는 지에 대해서 알아야 합니다.

```java

@Slf4j
public class RoutingDataSource extends AbstractRoutingDataSource {

	@Override
	protected Object determineCurrentLookupKey() {
		boolean isReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly();
		String dataSourceType = isReadOnly ? "slave" : "master";
		// log.info("데이터베이스: {}", dataSourceType);
		MDC.put("datasource", dataSourceType);
		try {
			return dataSourceType;
		} finally {
			MDC.remove("datasource"); // 컨텍스트 정리
		}
	}

}

```
<br>

위 해당 코드를 살펴보게 되면 determineCurrentLookupKey()메서드를 오버라이딩하여 Master, Slave DataSource를 구분합니다. 이를 통해서 Master, Slave DataSource를 구분하여 사용할 수 있습니다.

<br>

---

### 그렇다면 해당 코드에서 어노테이션만으로 어떻게 동작하는 것일까?

```
TransactionSynchronizationManager.isCurrentTransactionReadOnly();
```

중요한 것은 해당 부분입니다. 차근차근 한번 살펴보도록 하겠습니다.

<img src="/assets/master-slave/디버깅1.png" alt="debug1" itemprop="image">

⓵ 해당 부분을 조건을 걸어서 breakpoint를 걸어봅니다. 조건을 거는 이유는 서버가 시작할 시에 해당 부분을 거치기 때문에 true일경우에만 걸리도록 합니다.

⓶ 그리고 해당 부분을 step into 기능을 통해서 메소드 내부로 들어갑니다.

<img src="/assets/master-slave/디버깅2.png" alt="debug2" itemprop="image">

③ 해당 부분을 들어가게 되면, TransactionSynchronizationManager의 static 변수들의 값을 확인할 수 있습니다.

<img src="/assets/master-slave/디버깅3.png" alt="debug3" itemprop="image">

<img src="/assets/master-slave/디버깅4.png" alt="debug4" itemprop="image">

위 이미지에서 알 수 있듯이 currentTransactionReadOnly는 "Current transaction read-only status"라는 문자열을 값으로 가진 NamedThreadLocal 객체입니다.

<br>
<img src="/assets/master-slave/디버깅5.png" alt="debug5" itemprop="image">

그리고 해당 부분을 확인하게 되면, currentTransactionReadOnly.get()의 값은 true로 나오게 됩니다.




----

<br>

#### 참고사이트

