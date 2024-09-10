---
title: "Master & Slave 세팅에서 어노테이션을 가지고 master, slave를 구분할 수 있을까?"
date: 2024-09-10
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
> Spring Framework에서 Master/Slave 데이터베이스 라우팅이 어떻게 @Transactional(readOnly = true) 어노테이션과 연계되어 동작하는지 살펴보겠습니다.

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
<br>


```
TransactionSynchronizationManager.isCurrentTransactionReadOnly();
```

중요한 것은 해당 부분입니다. 차근차근 한번 살펴보도록 하겠습니다.

<br>
<br>

① isCurrentTransactionReadOnly()를 클릭하여 들어가봅니다.

```java
public static boolean isCurrentTransactionReadOnly() {
		return (currentTransactionReadOnly.get() != null);
	}
```
해당 부분은 아래에서 자세하게 설명 드리겠습니다.

<br>
<br>

② 다시 currentTransactionReadOnly.get()을 클릭하여 해당 부분을 들어가봅니다.

```java
    public T get() {
  return get(Thread.currentThread());
}
```
여기서 살펴보면 Thread.currentThread()는 현재 실행중인 스레드를 반환하는 메서드입니다. 즉, 현재 스레드의 ThreadLocalMap에서 현재 ThreadLocal 인스턴스에 해당하는 값을 찾아 반환합니다.



```java
private T get(Thread t) {
    // 1. 현재 스레드의 ThreadLocalMap을 가져옵니다.
    ThreadLocalMap map = getMap(t);

    // 2. ThreadLocalMap이 존재하는 경우
    if (map != null) {
        // 3. 현재 ThreadLocal 인스턴스에 해당하는 Entry를 맵에서 찾습니다.
        ThreadLocalMap.Entry e = map.getEntry(this);

        // 4. Entry가 존재하는 경우
        if (e != null) {
            // 5. Entry의 값을 반환합니다.
            @SuppressWarnings("unchecked")
            T result = (T) e.value;
            return result;
        }
    }

    // 6. ThreadLocalMap이 없거나 Entry가 없는 경우, 초기값을 설정하고 반환합니다.
    return setInitialValue(t);
}
```
1. 각 Thread는 자신만의 ThreadLocalMap을 가집니다.
2. 하나의 ThreadLocalMap은 여러 ThreadLocal 인스턴스와 그에 대응하는 값들을 저장할 수 있습니다.
3. 서로 다른 Thread는 같은 ThreadLocal 인스턴스에 대해 다른 값을 가질 수 있습니다.
4. 각 Thread는 필요에 따라 여러 개의 ThreadLocal 변수를 사용할 수 있습니다.
5. ThreadLocalMap은 ThreadLocal 변수에 대한 값을 저장하고 검색하는 데 사용됩니다.(멀티스레드 환경에서 스레드 안전성을 보장하면서도 효율적인 데이터 접근을 가능하게 합니다.)
6. 최종적으로 get() 메서드는 현재 스레드의 ThreadLocalMap에서 현재 ThreadLocal 인스턴스에 해당하는 값을 찾아 반환합니다. 만약 값이 없는 경우 초기값을 설정하고 반환합니다.


<br>


```java
private static final ThreadLocal<Boolean> currentTransactionReadOnly =
  new NamedThreadLocal<>("Current transaction read-only status");
```
1. currentTransactionReadOnly.get()은 currentTransactionReadOnly 변수에 담겨져 있는 ThreadLocal 객체에서 현재 스레드에 대한 값을 가져옵니다.

2. currentTransactionReadOnly 변수는 NamedThreadLocal 객체를 생성하여 사용하고 있습니다.

3. NamedThreadLocal은 ThreadLocal을 상속받은 클래스로, ThreadLocal의 기능을 확장하여 이름을 지정할 수 있습니다.

4. 이 이름은 주로 디버깅 목적으로 사용되며, 실제로 ThreadLocalMap에서 값을 찾는 데 사용되지는 않습니다. ThreadLocalMap은 여전히 ThreadLocal 객체 자체를 키로 사용합니다.

5. NamedThreadLocal에 부여된 이름 "Current transaction read-only status"는 이 ThreadLocal 변수의 목적을 설명하는 문자열일 뿐, 실제 저장되는 값이나 검색 키가 아닙니다.

6. 각 스레드는 이 ThreadLocal 변수를 통해 자신만의 Boolean 값(트랜잭션의 읽기 전용 상태)을 저장하고 검색할 수 있습니다.

<br>
<br>

currentTransactionReadOnly이 속해 있는 클래스의 static 변수들을 확인해보면 아래와 같습니다.

```java
private static final ThreadLocal<Map<Object, Object>> resources =
  new NamedThreadLocal<>("Transactional resources");

private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations =
  new NamedThreadLocal<>("Transaction synchronizations");

private static final ThreadLocal<String> currentTransactionName =
  new NamedThreadLocal<>("Current transaction name");

private static final ThreadLocal<Boolean> currentTransactionReadOnly =
  new NamedThreadLocal<>("Current transaction read-only status");

private static final ThreadLocal<Integer> currentTransactionIsolationLevel =
  new NamedThreadLocal<>("Current transaction isolation level");

private static final ThreadLocal<Boolean> actualTransactionActive =
  new NamedThreadLocal<>("Actual transaction active");

```


@Transactional(readOnly = true) 어노테이션은 currentTransactionReadOnly 변수에 true 값을 저장합니다. 이는 현재 트랜잭션이 읽기 전용인지 아닌지를 나타내는 값입니다.

```java
	public static void setCurrentTransactionReadOnly(boolean readOnly) {
		currentTransactionReadOnly.set(readOnly ? Boolean.TRUE : null);
	}
```

해당 부분을 좀 깊게 들어가 보면 setCurrentTransactionReadOnly과 같은 클래스(AbstractPlatformTransactionManager)의 메서드인 getTransaction을 살펴보면 아래와 같습니다.

```java

@Override
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition)
    throws TransactionException {

  TransactionDefinition def = (definition != null ? definition : TransactionDefinition.withDefaults());

  Object transaction = doGetTransaction();
  boolean debugEnabled = logger.isDebugEnabled();

  if (isExistingTransaction(transaction)) {
  
    return handleExistingTransaction(def, transaction, debugEnabled);
  }

  if (def.getTimeout() < TransactionDefinition.TIMEOUT_DEFAULT) {
    throw new InvalidTimeoutException("Invalid transaction timeout", def.getTimeout());
  }

  if (def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
    throw new IllegalTransactionStateException(
        "No existing transaction found for transaction marked with propagation 'mandatory'");
  }
  else if (def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
      def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
      def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
    SuspendedResourcesHolder suspendedResources = suspend(null);
    if (debugEnabled) {
      logger.debug("Creating new transaction with name [" + def.getName() + "]: " + def);
    }
    try {
      return startTransaction(def, transaction, false, debugEnabled, suspendedResources); // <== 트랜잭션 시작
    }
    catch (RuntimeException | Error ex) {
      resume(null, suspendedResources);
      throw ex;
    }
  }
  else {

    if (def.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT && logger.isWarnEnabled()) {
      logger.warn("Custom isolation level specified but no actual transaction initiated; " +
          "isolation level will effectively be ignored: " + def);
    }
    boolean newSynchronization = (getTransactionSynchronization() == SYNCHRONIZATION_ALWAYS);
    return prepareTransactionStatus(def, null, true, newSynchronization, debugEnabled, null);
  }
}
```
해당 메소드를 통해서 트랜잭션을 가져오게 되면, startTransaction() 메서드를 호출합니다.
특히 여기에 파라미터를 살펴보면 TransactionDefinition 이 있는데, 이는 트랜잭션의 정의를 나타내는 객체입니다. 이를 살펴보면 


```java
public interface TransactionDefinition {
  
  // 다른 상수들 생략

	default int getPropagationBehavior() {
		return PROPAGATION_REQUIRED;
	}

	
	default int getIsolationLevel() {
		return ISOLATION_DEFAULT;
	}

	default int getTimeout() {
		return TIMEOUT_DEFAULT;
	}

	
	default boolean isReadOnly() {
		return false;
	}

	@Nullable
	default String getName() {
		return null;
	}


	static TransactionDefinition withDefaults() {
		return StaticTransactionDefinition.INSTANCE;
	}

}

```
TransactionDefinition 인터페이스는 트랜잭션의 정의를 나타내는 객체로, 트랜잭션의 propagation, isolation, timeout, read-only, name 등의 속성을 가집니다.
기본적으로 definition.isReadOnly()는 false를 반환합니다.


```java

private TransactionStatus startTransaction(TransactionDefinition definition, Object transaction,
  boolean nested, boolean debugEnabled, @Nullable SuspendedResourcesHolder suspendedResources) {

  boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
  DefaultTransactionStatus status = newTransactionStatus(
    definition, transaction, true, newSynchronization, nested, debugEnabled, suspendedResources);
  this.transactionExecutionListeners.forEach(listener -> listener.beforeBegin(status));
  try {
    doBegin(transaction, definition);
  }
  catch (RuntimeException | Error ex) {
    this.transactionExecutionListeners.forEach(listener -> listener.afterBegin(status, ex));
    throw ex;
  }
  prepareSynchronization(status, definition);
  this.transactionExecutionListeners.forEach(listener -> listener.afterBegin(status, null));
  return status;
}
```
startTransaction() 메서드에서는 트랜잭션을 시작하고, 트랜잭션 상태를 나타내는 DefaultTransactionStatus 객체를 생성합니다. 


```java
	protected void prepareSynchronization(DefaultTransactionStatus status, TransactionDefinition definition) {
  if (status.isNewSynchronization()) {
    TransactionSynchronizationManager.setActualTransactionActive(status.hasTransaction());
    TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(
      definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT ?
        definition.getIsolationLevel() : null);
    TransactionSynchronizationManager.setCurrentTransactionReadOnly(definition.isReadOnly()); // <--- 여기
    TransactionSynchronizationManager.setCurrentTransactionName(definition.getName());
    TransactionSynchronizationManager.initSynchronization();
  }
}
```
그리고 prepareSynchronization() 메서드에서 setCurrentTransactionReadOnly() 메서드를 호출하여 현재 트랜잭션의 읽기 전용 상태를 설정합니다.

@Transactional(readOnly = true)로 설정된 경우, Spring은 이 정보를 사용하여 TransactionDefinition 구현체를 생성하고, 이 구현체의 isReadOnly() 메소드는 true를 반환하게 됩니다. 그리고 이 정보는 트랜잭션을 시작할 때 TransactionSynchronizationManager에 저장됩니다.


```java
public static boolean isCurrentTransactionReadOnly() {
		return (currentTransactionReadOnly.get() != null);
	}
```
그 후에 isCurrentTransactionReadOnly() 메서드를 호출하여 현재 트랜잭션이 읽기 전용인지 아닌지를 반환합니다.

----

<br>
<br>

### 마치며
이렇게 Spring Framework에서 Master/Slave 데이터베이스 라우팅이 어떻게 @Transactional(readOnly = true) 어노테이션과 연계되어 동작하는지 살펴보았습니다.

과정을 살펴보면 다음과 같습니다.
1. RoutingDataSource 클래스는 AbstractRoutingDataSource를 확장하여 Master와 Slave 데이터소스를 동적으로 선택합니다.
   <br>
   <br>
2. 라우팅 결정은 TransactionSynchronizationManager.isCurrentTransactionReadOnly() 메소드의 반환값을 기반으로 이루어집니다.
   <br>
   <br>
3. @Transactional(readOnly = true) 어노테이션은 Spring의 트랜잭션 관리 시스템에 의해 처리되며, 이 정보는 TransactionDefinition 객체를 통해 전달됩니다.
   <br>
   <br>
4. 트랜잭션 시작 시 AbstractPlatformTransactionManager의 getTransaction 메소드가 호출되고, 이어서 startTransaction과 prepareSynchronization 메소드가 실행됩니다.
   <br>
   <br>
5. prepareSynchronization 메소드에서 TransactionSynchronizationManager.setCurrentTransactionReadOnly()가 호출되어 트랜잭션의 읽기 전용 상태가 ThreadLocal 변수에 저장됩니다.
    <br>
    <br>
6. isCurrentTransactionReadOnly() 메소드는 이 ThreadLocal 변수의 값을 확인하여 현재 트랜잭션이 읽기 전용인지 여부를 반환합니다.



이러한 메커니즘을 통해 Spring은 애플리케이션 코드의 변경 없이도 트랜잭션의 특성에 따라 적절한 데이터베이스(Master 또는 Slave)로 요청을 라우팅할 수 있습니다. 이는 데이터베이스 부하 분산과 읽기 성능 최적화에 큰 도움이 됩니다.
개발자는 단순히 @Transactional(readOnly = true)를 사용함으로써 읽기 전용 작업을 Slave 데이터베이스로 자동 라우팅할 수 있으며, 이는 코드의 가독성과 유지보수성을 높이는 동시에 시스템의 확장성을 개선하는 데 기여합니다.