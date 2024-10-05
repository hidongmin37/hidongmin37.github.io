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
		boolean isReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly(); // <--- 여기
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



```java
boolean isReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly(); 
```

<br>

이 해당 코드에 대해서 서버를 시작하면서 부터 데이터베이스를 읽어오려고 하기 때문에 break point를 찍는다고 했을때, 바로 디버깅 시작 시에 바로 걸리게 됩니다. 따라서 저는 조건부 디버깅을 사용하여 해당 코드가 어떻게 동작하는지 살펴보았습니다.

<br>


```
Arrays.stream(Thread.currentThread().getStackTrace()).anyMatch(e -> e.getMethodName().equals("findAllChargingHistories"))
```

해당 코드를 통해서 findAllChargingHistories 메소드가 호출되었을 때, 해당 코드가 동작하도록 하였습니다. findAllChargingHistories 메소드를 살펴보게 되면 아래와 같이 @Transactional(readOnly = true) 어노테이션이 붙어 있습니다.



<br>

```
@Transactional(readOnly = true)
	public PaymentSliceDto findAllChargingHistories(String email, Pageable pageable) {
```


<br>

---

### 그렇다면 해당 코드에서 어노테이션만으로 어떻게 동작하는 것일까요?
<br>

조건부 디버깅을 통해서 들어가게 되면 아래와 같은 코드를 볼 수 있습니다.

```java
public static boolean isCurrentTransactionReadOnly() {
		return (currentTransactionReadOnly.get() != null);
}
```

<br>

해당 코드를 살펴보게 되면 currentTransactionReadOnly.get() 메소드를 호출하게 됩니다. 이 메소드는 ThreadLocal 변수에 저장된 값을 반환합니다. 


<br>




```java
public abstract class TransactionSynchronizationManager {
  private static final ThreadLocal<Map<Object, Object>> resources = new NamedThreadLocal("Transactional resources");
  private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations = new NamedThreadLocal("Transaction synchronizations");
  private static final ThreadLocal<String> currentTransactionName = new NamedThreadLocal("Current transaction name");
  private static final ThreadLocal<Boolean> currentTransactionReadOnly = new NamedThreadLocal("Current transaction read-only status");
  private static final ThreadLocal<Integer> currentTransactionIsolationLevel = new NamedThreadLocal("Current transaction isolation level");
  private static final ThreadLocal<Boolean> actualTransactionActive = new NamedThreadLocal("Actual transaction active");

  //...
}
```

<br>

TransactionSynchronizationManager이라는 추상 클래스안에서  static 변수들을 확인해보면 currentTransactionReadOnly이 있음을 알 수 있습니다. 따라서 이 변수에 저장되어있는 값을 읽어오는 것 입니다. 



그렇다면 어디서 이 값을 저장하고 있는 것일까요? 

```java
    public static void setCurrentTransactionReadOnly(boolean readOnly) {
        currentTransactionReadOnly.set(readOnly ? Boolean.TRUE : null);
    }

```

해당 메소드는 TransactionSynchronizationManager 클래스 안에 존재하며, setCurrentTransactionReadOnly 메소드를 통해서 값의 상태를 저장하고 있습니다.
이 메소드를 다시 한번 조건부 디버깅을 통해서 살펴보겠습니다.


<br>




```java

    // definition: "PROPAGATION_REQUIRED,ISOLATION_DEFAULT,readOnly"
  protected void prepareSynchronization(DefaultTransactionStatus status, TransactionDefinition definition) {
        if (status.isNewSynchronization()) {
            TransactionSynchronizationManager.setActualTransactionActive(status.hasTransaction());
            TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(definition.getIsolationLevel() != -1 ? definition.getIsolationLevel() : null);
            TransactionSynchronizationManager.setCurrentTransactionReadOnly(definition.isReadOnly());
            TransactionSynchronizationManager.setCurrentTransactionName(definition.getName()); // <--- 여기  // definition: "PROPAGATION_REQUIRED,ISOLATION_DEFAULT,readOnly"

            TransactionSynchronizationManager.initSynchronization();
        }

    }

```

디버깅을 통해서 살펴보게 되면 prepareSynchronization 메소드를 통해서 TransactionSynchronizationManager 클래스의 setCurrentTransactionReadOnly 메소드를 호출하게 됩니다. 이 메소드를 통해서 값을 저장하게 됩니다.
또한, 이 메소드는 스프링 프레임워크에서 트랜잭션 동기화를 준비하는 데 사용됩니다. 이 메소드는 TransactionSynchronizationManager를 통해 현재 트랜잭션에 대한 중요한 정보와 상태를 설정하는 역할을 합니다.


특히 디버깅을 하게되면 definition: "PROPAGATION_REQUIRED,ISOLATION_DEFAULT,readOnly" 이라는 값을 가지고 있음을 확인할 수 있습니다. 이 값은 @Transactional(readOnly = true) 어노테이션을 통해서 설정된 값입니다. 



<br>

여기서 definition은 TransactionDefinition 인터페이스를 구현한 객체입니다. 이 인터페이스는 트랜잭션의 속성을 정의하는 데 사용됩니다. 이 인터페이스는 다음과 같은 메소드를 가지고 있습니다. 

```java

public interface TransactionDefinition {
int PROPAGATION_REQUIRED = 0;
int PROPAGATION_SUPPORTS = 1;
int PROPAGATION_MANDATORY = 2;
int PROPAGATION_REQUIRES_NEW = 3;
int PROPAGATION_NOT_SUPPORTED = 4;
int PROPAGATION_NEVER = 5;
int PROPAGATION_NESTED = 6;
int ISOLATION_DEFAULT = -1;
int ISOLATION_READ_UNCOMMITTED = 1;
int ISOLATION_READ_COMMITTED = 2;
int ISOLATION_REPEATABLE_READ = 4;
int ISOLATION_SERIALIZABLE = 8;
int TIMEOUT_DEFAULT = -1;

    default int getPropagationBehavior() {
        return 0;
    }

    default int getIsolationLevel() {
        return -1;
    }

    default int getTimeout() {
        return -1;
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


<br>


그리고 다시 prepareSynchronization 메소드에서 step over를 하여 살펴보게 되면
startTransaction에서 호출하는 것을 볼 수 있습니다. 

```java

private TransactionStatus startTransaction(TransactionDefinition definition, Object transaction, boolean nested, boolean debugEnabled, @Nullable SuspendedResourcesHolder suspendedResources) {
        boolean newSynchronization = this.getTransactionSynchronization() != 2;
        DefaultTransactionStatus status = this.newTransactionStatus(definition, transaction, true, newSynchronization, nested, debugEnabled, suspendedResources);
        this.transactionExecutionListeners.forEach((listener) -> {
            listener.beforeBegin(status);
        });

        try {
            this.doBegin(transaction, definition);
        } catch (Error | RuntimeException var9) {
            Throwable ex = var9;
            this.transactionExecutionListeners.forEach((listener) -> {
                listener.afterBegin(status, ex);
            });
            throw ex;
        }

        this.prepareSynchronization(status, definition);
        // definition: "PROPAGATION_REQUIRED,ISOLATION_DEFAULT,readOnly" status: DefaultTransactionStatus@6b3b3b7a
        this.transactionExecutionListeners.forEach((listener) -> {
            listener.afterBegin(status, (Throwable)null);
        });
        return status;
    }
```


startTransaction 메소드는 메소드 이름에서 알 수 있듯이 트랜잭션을 시작하는 과정에서 트랜잭션의 생명주기를 관리하며, 트랜잭션의 설정과 상태에 따라 적절한 동기화와 리소스 관리를 수행합니다. 


<br>


```
  this.transactionExecutionListeners.forEach((listener) -> {
  listener.afterBegin(status, (Throwable)null);
  }); 
```
특히 startTransaction 메소드에서 transactionExecutionListeners는 트랜잭션 시작 후에 트랜잭션 리스너에게 트랜잭션 시작을 알리는 역할을 합니다. 이를 통해 트랜잭션 리스너는 트랜잭션의 상태를 감지하고 적절한 처리를 수행할 수 있습니다.

<br>


그리고 다시 step over하게 되면 

```java
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException {
  TransactionDefinition def = definition != null ? definition : TransactionDefinition.withDefaults();
  Object transaction = this.doGetTransaction();
  boolean debugEnabled = this.logger.isDebugEnabled();
  if (this.isExistingTransaction(transaction)) {
    return this.handleExistingTransaction(def, transaction, debugEnabled);
  } else if (def.getTimeout() < -1) {
    throw new InvalidTimeoutException("Invalid transaction timeout", def.getTimeout());
  } else if (def.getPropagationBehavior() == 2) {
    throw new IllegalTransactionStateException("No existing transaction found for transaction marked with propagation 'mandatory'");
  } else if (def.getPropagationBehavior() != 0 && def.getPropagationBehavior() != 3 && def.getPropagationBehavior() != 6) {
    if (def.getIsolationLevel() != -1 && this.logger.isWarnEnabled()) {
      this.logger.warn("Custom isolation level specified but no actual transaction initiated; isolation level will effectively be ignored: " + def);
    }

    boolean newSynchronization = this.getTransactionSynchronization() == 0;
    return this.prepareTransactionStatus(def, (Object)null, true, newSynchronization, debugEnabled, (Object)null);
  } else {
    SuspendedResourcesHolder suspendedResources = this.suspend((Object)null);
    if (debugEnabled) {
      Log var10000 = this.logger;
      String var10001 = def.getName();
      var10000.debug("Creating new transaction with name [" + var10001 + "]: " + def);
    }

    try {
      return this.startTransaction(def, transaction, false, debugEnabled, suspendedResources); // <== 트랜잭션 시작
    } catch (Error | RuntimeException var7) {
      Throwable ex = var7;
      this.resume((Object)null, suspendedResources);
      throw ex;
    }
  }
}
```
이 메소드 안에서 startTransaction 메소드를 호출하게 됩니다.  getTransaction 메소드는 트랜잭션의 존재 여부, 타임아웃, 전파 동작, 격리 수준 등을 확인하고 필요한 경우 새 트랜잭션을 생성합니다.


<br>

그리고 다시 step over하게 되면 
```java

protected TransactionInfo createTransactionIfNecessary(@Nullable PlatformTransactionManager tm, @Nullable TransactionAttribute txAttr, final String joinpointIdentification) {
        if (txAttr != null && ((TransactionAttribute)txAttr).getName() == null) {
            txAttr = new DelegatingTransactionAttribute((TransactionAttribute)txAttr) {
                public String getName() {
                    return joinpointIdentification;
                }
            };
        }

        TransactionStatus status = null;
        if (txAttr != null) {
            if (tm != null) {
                status = tm.getTransaction((TransactionDefinition)txAttr);
            } else if (this.logger.isDebugEnabled()) {
                this.logger.debug("Skipping transactional joinpoint [" + joinpointIdentification + "] because no transaction manager has been configured");
            }
        }

        return this.prepareTransactionInfo(tm, (TransactionAttribute)txAttr, joinpointIdentification, status);
    }
```


```java
 protected TransactionInfo prepareTransactionInfo(@Nullable PlatformTransactionManager tm, @Nullable TransactionAttribute txAttr, String joinpointIdentification, @Nullable TransactionStatus status) {
        TransactionInfo txInfo = new TransactionInfo(tm, txAttr, joinpointIdentification); // <== TransactionInfo 객체 생성 
  // joinpointIdentification: "execution(void com.example.demo.service.UserService.findAllChargingHistories())"
  
  // tm JPATransactionManager@7b3b3b7a
  // txAttr: PROPAGATION_REQUIRED,ISOLATION_DEFAULT,readOnly
        if (txAttr != null) {
            if (this.logger.isTraceEnabled()) {
                this.logger.trace("Getting transaction for [" + txInfo.getJoinpointIdentification() + "]");
            }

            txInfo.newTransactionStatus(status);
        } else if (this.logger.isTraceEnabled()) {
            this.logger.trace("No need to create transaction for [" + joinpointIdentification + "]: This method is not transactional.");
        }

        txInfo.bindToThread();
        return txInfo;
    }
```

prepareTransactionInfo 메소드를 호출하게 됩니다.prepareTransactionInfo 메소드에서 트랜잭션 정보 객체가 생성되고 스레드에 바인딩됩니다. 


<br>


## 결론

이렇게 어노테이션만으로도 master, slave를 구분할 수 있습니다. 이는 스프링 프레임워크에서 제공하는 @Transactional(readOnly = true) 어노테이션을 통해 트랜잭션의 속성을 설정하고, 트랜잭션 동기화를 준비하는 과정에서 트랜잭션의 속성을 확인하고, 이를 통해 master, slave 데이터베이스를 구분할 수 있습니다. 이를 통해 스프링 프레임워크에서 제공하는 트랜잭션 관리 기능을 활용하여 데이터베이스 라우팅을 구현할 수 있습니다. 

