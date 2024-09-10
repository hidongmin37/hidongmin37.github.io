---
title: "about Java Native Interface"
date: 2024-09-09
comments: true
categories:
  - posts
tags:
  - native
  - coding
---

### Java Native Interface란?
> Java Native Interface는 Java 프로그램이 다른 언어로 작성된 프로그램과 상호 작용할 수 있게 해주는 인터페이스로 C와 C++로 작성된 코드를 Java에서 호출할 수 있게 해줍니다. 즉 C,C++처럼 인터프리터 없이 OS가 바로 읽을 수 있는 형태의 네이티브 코드를 JVM이 호출할 수 있게 하는 인터페이스입니다. 


<br>

### Java Native Interface의 장점
1. 성능 향상
   - Java는 가상 머신 기반 언어로 속도가 느린 편이지만, Native Interface를 사용하면 C,C++로 작성된 코드를 호출하여 성능을 향상시킬 수 있습니다.

2. 하드웨어 제어
    - Java는 하드웨어 제어가 어려운 편이지만, Native Interface를 사용하면 C,C++로 작성된 코드를 호출하여 하드웨어를 제어할 수 있습니다.

3. 기존 라이브러리 사용
    - 기존에 C,C++로 작성된 라이브러리를 사용하고 싶을 때 Native Interface를 사용하면 기존 라이브러리를 사용할 수 있습니다.

<br>

### Java Native Interface의 단점
1. 이식성
   - Java Native Interface를 사용하면 OS에 종속적인 코드를 작성하게 되어 이식성이 떨어집니다.

2. 보안
    - Java Native Interface를 사용하면 Java의 잠재적으로 위협할 수 있습니다.

3. 오류
    - Java Native Interface를 사용하면 C,C++로 작성된 코드를 호출하기 때문에 오류가 발생할 수 있습니다.
   
4. 메모리 누수
    - Java Native Interface를 사용하면 메모리 누수가 발생할 수 있습니다.

### Native Interface의 사용 예시

```java
public class HelloJNI {
  static {
    System.loadLibrary("hello"); //  "hello"라는 이름의 네이티브 라이브러리를 로드합니다.
  }

  private native void sayHello(); // native 키워드는 이 메소드가 Java가 아닌 다른 언어(보통 C나 C++)로 구현되었음을 나타냅니다.


  public static void main(String[] args) {
    new HelloJNI().sayHello(); //HelloJNI 클래스의 새 인스턴스를 생성하고, 그 인스턴스의 sayHello() 메소드를 호출합니다.
    
  }
}
```

1.라이브러리 로딩:

"hello"라는 이름의 라이브러리를 static 블록에서 로드합니다.
이는 클래스가 메모리에 로드될 때 한 번만 실행되므로, 효율적으로 라이브러리를 로드하는 방법입니다.


2.native 메소드:

sayHello()는 native 메소드로 선언되어 있습니다.
이는 이 메소드의 실제 구현이 Java가 아닌 다른 언어(주로 C나 C++)로 작성되어 있음을 의미합니다.
이 메소드의 실제 구현은 로드된 "hello" 라이브러리 내에 있습니다.


3.main에서의 호출:

main 메소드에서 HelloJNI 객체를 생성하고 그 객체의 sayHello() 메소드를 호출합니다.
이 호출은 실제로 네이티브 라이브러리에 구현된 함수를 실행하게 됩니다.





#### 참고사이트

https://hbase.tistory.com/82
