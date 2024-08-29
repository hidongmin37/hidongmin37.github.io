---
title: "Argument Resolver란?"
date: 2024-08-30
comments: true
categories:
  - posts
tags:
  - argument resolver
  - coding
---

<br>

### Argument Resolver란?
> Argument Resolver는 **컨트롤러 메서드**의 파라미터 값들을 결정하고 바인딩하는 역할을 합니다. 스프링에서는 다양한 Argument Resolver를 제공하고 있습니다.

<br>


### Argument Resolver의 종류 

```java
@GetMapping
public void get(HttpServletRequest req, @PathVariable long id) {}

@PostMapping
public void post(@RequestBody Body body) {}
```

- HttpServletRequest, @RequestParam, @RequestBody, Model 등

<br>


### 동작 방식
- 요청이 들어오면 DispatcherServlet이 적절한 컨트롤러 메서드를 찾습니다.

```java
public interface HandlerMethodArgumentResolver {

  boolean supportsParameter(MethodParameter parameter);

  Object resolveArgument(
    MethodParameter parameter,
    @Nullable ModelAndViewContainer mavContainer,
    NativeWebRequest webRequest,
    @Nullable WebDataBinderFactory binderFactory
  ) throws Exception;
}
```

- **supportsParameter()** 메서드를 통해 해당 Argument Resolver가 지원하는 파라미터인지 확인합니다.
- **resolveArgument()** 메서드를 통해 파라미터 값을 결정하고 바인딩합니다.


<br>

### Custom Argument Resolver 만들기

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auth {
  Role value() default Role.USER;
}
```
- **@Auth** 어노테이션을 만들어서 커스텀 Argument Resolver를 만들어보겠습니다.

```java
@Sl4j  
@Component  
@RequiredArgsConstructor  
public class AuthArgumentResolver implements HandlerMethodArgumentResolver {  
  
	private final AuthService authService;  
	private final MemberRepository memberRepo;  
	  
	@Override  
	public boolean supportsParameter(MethodParameter parameter) {  
		boolean hasAuthAnnotation =  
				parameter.hasParameterAnnotation(Auth.class);  
		boolean hasMemberType =  
				Member.class.isAssignableFrom(parameter.getParameterType());  
		  
		log.debug("hasAuthAnnotation = {}, hasMemberType = {}", hasAuthAnnotation, hasMemberType);  
		return hasAuthAnnotation && hasMemberType;
	}  
	  
	@Nullable  
	@Override  
	public Object resolveArgument(  
			MethodParameter parameter,  
			@Nullable ModelAndViewContainer mavContainer,  
			NativeWebRequest webRequest,  
			@Nullable WebDataBinderFactory binderFactory  
	) {  
		// token 얻기  
		String token = webRequest.getHeader("Authorization");  
		if (!StringUtils.hasText(token)) {  
			throw new InvalidTokenException("'token' must not be empty");  
		}  
		  
		// Auth 어노테이션의 role 얻기  
		Auth authAnnotation = parameter.getParameterAnnotation(Auth.class);  
		if (authAnnotation == null) {  
			throw new NullPointerException("'Auth annotation' must not be null");  
		}  
		Role role = authAnnotation.value();  
		  
		// 토큰 검증 받기  
		TokenInfo tokenInfo = authService.verifyToken(token);  
		  
		// member 조회  
		Member member = memberRepo.findByUid(tokenInfo.getUid())  
				.orElseThrow(() -> new InvalidTokenException("잘못된 토큰입니다"));  
		  
		// role 권한 체크  
		if (member.getRole().getCode() < role.getCode()) {  
			throw new InvalidAuthException("권한이 없습니다");  
		}  
		  
		return member;  
	}  
}
```
- supportsParameter() 메서드는 Auth 어노테이션을 가지고 있으면서 Member 타입일 경우에만 true를 리턴한다.
- resolveArgument() 메서드는 요청에서 Authorization 토큰을 찾고, 파라미터에서 Role을 찾아 토큰 검증, member 조회, role 권한을 체크하고 조회한 member를 리턴한다.
- 권한과 토큰을 검증하게 되면서 컨트롤러 메서드에서 Auth 어노테이션을 사용하게 되면서 권한을 체크할 수 있게 된다.



#### 참고사이트

https://velog.io/@hoho4190/Spring-Boot-Custom-ArgumentResolver