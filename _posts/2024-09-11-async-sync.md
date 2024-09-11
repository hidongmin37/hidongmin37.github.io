---
title: "@Transactional과 @Async 사용하기"
date: 2024-09-11
comments: true
categories:
  - posts
tags:
  - transactional
  - async
  - proxy
  - coding
---

<br>

### @Transactional이란?

@Transactional은 트랜잭션을 처리하는 어노테이션으로, 메소드가 실행되는 동안 트랜잭션을 시작하고, 메소드가 정상적으로 종료되면 트랜잭션을 커밋하고, 예외가 발생하면 롤백합니다.


### @Async이란?

@Async는 비동기적으로 메소드를 실행할 수 있게 해주는 어노테이션으로, 메소드가 실행되는 동안 다른 작업을 수행할 수 있습니다.


<br>

---

<br>

### @Transactional과 @Async는 함께 사용하는 것은 권장되지 않는다.

- @Transactional은 메소드 실행을 단일 트랜잭션으로 묶으려고 합니다. 반면 @Async는 별도의 스레드에서 메소드를 실행하려고 합니다. 이 두 가지 동작은 서로 상충될 수 있습니다.<br>


- 비동기 메소드가 새로운 스레드에서 실행되면, 원래의 트랜잭션 컨텍스트가 전파되지 않습니다. 이로 인해 예상치 못한 동작이 발생할 수 있습니다.<br>

- 비동기 실행으로 인해 트랜잭션의 ACID 속성 (특히 일관성과 격리성)을 보장하기 어려워질 수 있습니다.<br>

<br>
<br>

#### 잘못된 사용 예시
  
  ```java
@Async("threadPoolTaskExecutor")
public void testAsync(String message){
  // 이미지 처리 등의 작업을 비동기로 처리한다고 가정
  for(int i = 1; i <= 3; i++){
    System.out.println(message + "비동기 : " + i);
  }

}

@Transactional
public void test2(String message) {

  // 동기적으로 게시판 등록 작업을 수행한다고 가정
  System.out.println("message = " + message);

  testAsync(message + "11111");
  testAsync(message + "22222");
}

@GetMapping("/test")
public void main(){
  paymentService.test2("비동기 테스트");
}

```

<br>

해당코드의 출력 결과물

```markdown
message = 비동기 테스트
비동기 테스트11111비동기 : 1
비동기 테스트11111비동기 : 2
비동기 테스트11111비동기 : 3
비동기 테스트22222비동기 : 1
비동기 테스트22222비동기 : 2
비동기 테스트22222비동기 : 3
```
<br>

test2 메서드의 출력 결과를 보면, testAsync가 비동기적으로 실행되지 않고, 마치 동기적으로 실행되는 것처럼 출력됩니다. @Async가 적용된 메서드가 비동기적으로 실행되었다면, 호출 순서와 관계없이 "비동기 테스트11111"과 "비동기 테스트22222"가 뒤섞인 순서로 출력되어야 합니다. 그러나 출력이 순서대로 나타나므로, testAsync 메서드가 동기적으로 실행된 것과 동일한 결과를 보여줍니다.

<br>

#### 동시에 실행했을 때 문제 원인

- **프록시 방식의 동작**:<br>
  - Spring 프레임워크에서는 @Async와 @Transactional 같은 어노테이션을 적용할 때 프록시 패턴을 사용합니다. 이 프록시는 AOP(Aspect-Oriented Programming)를 이용해 어노테이션의 기능을 동작하게 만듭니다.<br>
  - 하지만 동일한 클래스 내부에서 메서드를 호출하면, Spring 프록시는 해당 메서드 호출을 가로채지 못합니다. 이로 인해 @Async 어노테이션이 적용된 메서드라도, 내부에서 직접 호출되면 비동기 처리가 되지 않고, 동기적으로 실행됩니다.


---

<br>

#### 올바른 사용 예시

- @Async 어노테이션을 사용할 때는 비동기적으로 실행되어야 하는 메서드를 <span style='color:red;font-weight:500;'>별도의 클래스</span>
로 분리하고, 해당 클래스를 빈으로 등록하여 사용하는 것이 좋습니다.<br>

- 이렇게 하면 Spring 프록시가 해당 빈을 가로채서 비동기 처리를 수행할 수 있습니다.<br>

```java
@Service
public class AsyncService {

	@Async("threadPoolTaskExecutor")
	public void testAsync(String message) {
		// 비동기로 처리될 작업
		for (int i = 1; i <= 3; i++) {
			System.out.println(message + " 비동기: " + i);
		}
	}
}


@Transactional
public void test2(String message) {
  // 동기적으로 게시판 등록 작업을 수행
  System.out.println("message = " + message);

  // 비동기 작업은 별도의 서비스 클래스에서 호출
  asyncService.testAsync(message + "1111");
  asyncService.testAsync(message + "2222");
}


@GetMapping("/test")
public void main(){
  paymentService.test2("비동기 테스트");
}
```

<br>

- **@Async 어노테이션이 적용된 메서드를 별도의 클래스에 분리**:<br>
  - AsyncService 클래스에 @Async 어노테이션이 적용된 testAsync 메서드를 정의하고, 이를 비동기적으로 실행해야 하는 메서드로 분리했습니다.
  - 비동기적으로 실행되어야 하는 메서드를 별도의 클래스에 정의하고, 해당 클래스를 Spring 빈(Bean)으로 등록하여 사용하는 것이 중요합니다. 이렇게 하면 Spring 프록시가 해당 메서드를 가로채어 비동기 처리를 수행할 수 있습니다.

<br>


해당코드의 출력 결과물

```markdown
message = 비동기 테스트
비동기 테스트1111 비동기: 1
비동기 테스트2222 비동기: 1
비동기 테스트2222 비동기: 2
비동기 테스트2222 비동기: 3
비동기 테스트1111 비동기: 2
비동기 테스트1111 비동기: 3
```

<br>
이와 같이 출력 결과를 보면, testAsync 메서드가 비동기적으로 실행되어 두 개의 호출이 동시에 시작되고 있음을 알 수 있습니다. "비동기 테스트1111 비동기: 1"과 "비동기 테스트2222 비동기: 1"이 순서에 상관없이 출력되고, 그 이후의 출력도 순차적이지 않게 나오는 것을 확인할 수 있습니다. 이는 testAsync 메서드가 별도의 스레드에서 병렬로 실행되고 있음을 나타냅니다.


---

### 핵심포인트

**Spring 프록시의 역할:**
- @Async 어노테이션은 Spring의 프록시를 통해 비동기 메서드 호출을 가로채어 별도의 스레드에서 실행하게 만듭니다.
- 하지만 동일한 클래스 내부에서 메서드를 호출하면 Spring 프록시가 해당 호출을 가로채지 못하고, 비동기 처리가 되지 않습니다. 비동기 메서드는 항상 <span style='color:red;font-weight:500;'>별도의 클래스</span>로 분리하여 사용하여 프록시가 해당 메서드 호출을 가로채도록 해야 합니다.





#### 참고자료

https://cano721.tistory.com/208