---
title: "필터와 인터셉터의 차이 그리고 로깅"
date: 2024-08-25
comments: true
categories:
  - posts
tags:
  - filter
  - interceptor
  - coding
---

<br>

### 필터란?
> 필터는 Java Servlet 스펙의 일부로, 웹 애플리케이션의 요청-응답 처리 사이클에서 작동합니다. 클라이언트의 요청이 **서블릿에 도달하기 전**과 서블릿의 응답이 클라이언트에게 반환되기 전에 동작합니다.


<br>

<img src="/assets/filter-inter/img1.png" alt="filter" itemprop="image">

<br>

### 필터의 주요 특징

① 광범위한 적용 범위<br>
모든 서블릿 기반 웹 애플리케이션에 적용 가능합니다.

② 체인 구조 지원<br>
여러 개의 필터를 체인 구조로 연결하여 사용할 수 있습니다.

③ URL 패턴 지원<br>
특정 URL 패턴에 대해서만 필터를 적용할 수 있습니다.

<br>

### 주요 메서드

- init(FilterConfig config): <br>
  필터 초기화
<br>

- doFilter(ServletRequest request, ServletResponse response, FilterChain chain):<br>
실제 필터링 로직

- destroy():<br>
필터 종료 시 호출

<br>

### 필터의 사용 예시

```java
public class LoggingFilter implements Filter {
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        System.out.println("Request received");
        chain.doFilter(request, response);
        System.out.println("Response sent");
    }
    // init() 및 destroy() 메서드 구현...
}
```


<br>

### 주요 용도

- <p style="font-size:19px;font-weight: bold">인증 및 권한 검사</p>
  
- <p style="font-size:19px;font-weight: bold">인코딩 변환</p>
  
- <p style="font-size:19px;font-weight: bold">로깅 및 감사</p>
  
- <p style="font-size:19px;font-weight: bold">요청/응답 데이터 변환 및 압축</p>


<br>

### 2. 인터셉터란?
> 인터셉터는 Spring MVC 프레임워크에서 제공하는 기능으로, 컨트롤러의 호출 전후에 동작합니다. DispatcherServlet과 컨트롤러 사이에서 요청과 응답을 가로챕니다.


<br>

<img src="/assets/filter-inter/interceptor.png" alt="filter" itemprop="image">

<br>

### 인터셉터의 주요 특징

① spring 전용<br>
Spring MVC 프레임워크에서만 사용 가능합니다.

② 세밀한 제어<br>
특정 컨트롤러나 핸들러 메서드에 대해 선택적으로 적용 가능합니다.

③ Spring Bean 활용 가능<br>
다른 Spring Bean을 주입받아 사용할 수 있습니다.

④ AOP와 유사<br>
메서드 실행 전후에 로직을 삽입할 수 있어 AOP와 유사한 기능을 제공합니다.


<br>

### 인터셉터의 주요 메서드

- preHandle(HttpServletRequest request, HttpServletResponse response, Object handler):<br>
컨트롤러 실행 전
<br>


- postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView):<br>
컨트롤러 실행 후, 뷰 렌더링 전
<br>


- afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex):<br>
뷰 렌더링 후
<br>

### 인터셉터의 사용 예시

```java

public class PerformanceInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        return true;
    }

    public void postHandle(HttpServletRequest request, HttpServletResponse response, 
            Object handler, ModelAndView modelAndView) throws Exception {
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        System.out.println("Request processing time: " + (endTime - startTime) + "ms");
    }
    // afterCompletion() 메서드 구현...
}
```
<br>

### 주요 용도

- <p style="font-size:19px;font-weight: bold">세부적인 권한 검사</p>

- <p style="font-size:19px;font-weight: bold">트랜잭션 처리</p>

- <p style="font-size:19px;font-weight: bold">로깅 및 모니터링</p>

- <p style="font-size:19px;font-weight: bold">컨트롤러 실행 시간 측정</p>


<br>
<br>


### 필터 vs 인터셉터 📌
<br>

---
Spring MVC 통합:

인터셉터: HandlerMethod( Spring MVC에서 HTTP 요청을 처리하는 컨트롤러 메서드에 대한 메타데이터를 나타내는 클래스)를 사용하여 컨트롤러의 메서드 정보를 로깅할 수 있습니다. 이는 Spring MVC의 특정 기능입니다.

필터: 필터에서는 HandlerMethod에 접근할 수 없습니다. 필터는 서블릿 수준에서 동작하기 때문입니다.

---
실행 시점:

인터셉터: preHandle, postHandle, afterCompletion 메서드를 통해 요청 처리의 여러 단계에 개입할 수 있습니다.

필터: doFilter 메서드 하나만 있어, 요청 전후로만 로직을 추가할 수 있습니다.

---
예외 처리:

인터셉터: afterCompletion 메서드에서 예외 정보를 받아 처리할 수 있습니다.
필터: 예외 정보를 직접 받지 못하며, try-catch로 감싸서 처리해야 합니다.


ModelAndView 접근:

인터셉터: postHandle 메서드에서 ModelAndView에 접근할 수 있습니다.
필터: ModelAndView에 접근할 수 없습니다.
---
<br>

#### 면접을 봤을때 왜 필터가 아닌 인터셉터를 사용하셨냐고 물어보면 뭐라고 대답하는게 좋을까?

**Spring MVC와의 통합**:
우리 프로젝트는 Spring MVC 기반으로 구축되어 있습니다. 인터셉터는 Spring MVC의 일부로, HandlerMethod를 통해 컨트롤러와 메서드에 대한 더 상세한 정보에 접근할 수 있습니다. 이를 통해 로깅, 보안 검사 등을 더 세밀하게 구현할 수 있었습니다.

**요청 처리 생명주기**:
인터셉터는 preHandle, postHandle, afterCompletion 메서드를 제공하여 요청 처리의 여러 단계에 개입할 수 있습니다. 이를 통해 요청 처리 전, 후, 그리고 뷰 렌더링 후에 각각 다른 로직을 적용할 수 있어 더 유연한 처리가 가능했습니다.

**예외 처리**:
afterCompletion 메서드에서 예외 정보를 직접 받아 처리할 수 있어, 예외 상황에 대한 로깅이나 추가적인 처리를 더 쉽게 구현할 수 있었습니다.

**Spring 기능 활용**:
인터셉터는 Spring의 다른 기능들(예: 의존성 주입)을 쉽게 활용할 수 있어, 더 복잡한 비즈니스 로직을 인터셉터 내에서 구현할 수 있었습니다.

**성능**:
필터는 모든 요청에 대해 동작하지만, 인터셉터는 DispatcherServlet이 처리하는 요청에 대해서만 동작합니다. 이는 불필요한 처리를 줄여 성능 향상에 도움이 됩니다.


---
####  반대로 왜 인터셉터가 아닌 필터를 선택했냐는 질문을 받았을때에는 어떻게 대답하는게 좋을까?

**광범위한 적용 범위**:
필터는 서블릿 컨테이너 수준에서 작동하기 때문에, Spring의 DispatcherServlet에 도달하기 전에 모든 요청을 처리할 수 있습니다. 우리 프로젝트는 Spring MVC 뿐만 아니라 다른 서블릿 기반 요소들도 포함하고 있어, 모든 요청에 대해 일관된 처리가 필요했습니다.

**프레임워크 독립성**:
필터는 서블릿 스펙의 일부이므로, Spring 프레임워크에 의존하지 않습니다. 이는 향후 프레임워크 변경이나 마이그레이션 시에도 현재의 로직을 그대로 사용할 수 있다는 장점이 있습니다.

**요청/응답 객체 변형**:
우리 프로젝트에서는 요청이나 응답 객체를 수정해야 하는 경우가 있었습니다. 예를 들어, 멀티파트 요청의 파싱이나 응답 압축 등의 작업은 필터에서 더 적절하게 처리할 수 있었습니다.

**보안 관련 처리**:
인증이나 로깅과 같은 보안 관련 작업은 애플리케이션 로직이 실행되기 전에 처리되어야 합니다. 필터는 이러한 요구사항을 만족시키는 데 적합했습니다.

**성능 고려**:
일부 처리는 Spring 컨텍스트가 로드되기 전에 수행되어야 했습니다. 필터를 사용함으로써 불필요한 처리를 줄이고 전반적인 요청 처리 속도를 개선할 수 있었습니다.

**서드파티 라이브러리 통합**:
우리가 사용하는 일부 서드파티 보안 라이브러리들이 필터 기반으로 동작하기 때문에, 이들과의 일관성을 위해 필터를 선택했습니다.

---


#### 참고사이트

https://mozzi-devlog.tistory.com/9
