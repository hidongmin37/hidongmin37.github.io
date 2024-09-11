---
title: "스프링 Aop"
date: 2023-12-28
comments: true
categories:
  - posts
tags:
  - aop
  - coding
---
<div class="sc-eGRUor gdnhbG atom-one"><h3 id="스프링-aop">스프링 AOP</h3>
<blockquote>
<p>스프링 AOP(Aspect-Oriented Programming)는 스프링 프레임워크에서 제공하는 중요한 기능 중 하나로, 관점 지향 프로그래밍을 구현하는 방법</p>
</blockquote>
<h3 id="스프링-aop의-역할">스프링 AOP의 역할</h3>
<p>스프링 AOP는 이러한 횡단 관심사를 별도의 클래스(Aspect)로 분리하여 관리할 수 있게 해줍니다. </p>
<h4 id="단어-설명">단어 설명</h4>
<ul>
<li>Aspect: 횡단 관심사를 모듈화한 클래스입니다. 어떤 기능을 어디에 적용할지를 정의합니다.</li>
<li>Advice: Aspect의 구체적인 행동을 정의합니다. 예를 들어, 메소드 실행 전/후, 예외 발생 시 등 특정 시점에 적용할 로직을 정의합니다.</li>
<li>Join Point: Advice가 적용될 수 있는 위치, 예를 들어 메소드 실행 지점 등을 말합니다.</li>
<li>Pointcut: Join Point 중에서 Advice가 실제로 적용될 위치를 선별하는 패턴 또는 표현식입니다.</li>
<li>Proxy: 스프링 AOP는 프록시 패턴을 사용하여 Aspect의 적용을 구현합니다. 클라이언트가 호출하는 대상 객체 대신 프록시 객체가 위치하여 Advice를 수행하고 실제 객체를 호출합니다.</li>
</ul></div>
