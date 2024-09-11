---
title: "Load Balancing"
date: 2024-02-05
comments: true
categories:
  - posts
tags:
  - load-balancing
  - coding
---
<div class="sc-eGRUor gdnhbG atom-one"><p>로드 밸런서의 기본 기능</p>
<p><a href="https://aws-hyoh.tistory.com/entry/Server-Load-Balancing-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0">https://aws-hyoh.tistory.com/entry/Server-Load-Balancing-%EC%89%BD%EA%B2%8C-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0</a></p>
<h5 id="서버-부하분산은-외부의-사용자로부터-들어오는-다수의-요청naver-접속-등을-서버들에게-적절히-배분하여-서버들로-하여금-요청을-처리하는-것을-뜻한다-중요한-것은-서버가-요청을-직접-받는-것이-아니라-부하-분산-스위치-또는-소프트웨어가-이를-적절히-나누어-주는-것">서버 부하분산은 외부의 사용자로부터 들어오는 다수의 요청(naver 접속 등)을 서버들에게 적절히 배분하여 서버들로 하여금 요청을 처리하는 것을 뜻한다. 중요한 것은 서버가 요청을 직접 받는 것이 아니라 부하 분산 스위치 또는 소프트웨어가 이를 적절히 나누어 주는 것.</h5>
<p>1️⃣ Health Check </p>
<p>2️⃣ 알고리즘에 따른 분산처리</p>
<p>&nbsp;&nbsp;&nbsp; ① &nbsp;&nbsp;least connection 알고리즘</p>
<p>&nbsp;&nbsp;&nbsp; 현재 매핑되어 있는 커넥션이 가장 적은 서버로 세션을 연결해주는 방식, 잘 사용하지는 않는다.세션이 오랫동안 유지되어 있을 경우 배당이 쉽지 않음) 부하가 가장 덜한 서버에게 요청을 전달.</p>
<p>&nbsp;&nbsp;&nbsp; ② &nbsp;&nbsp;round robin 알고리즘<br>
&nbsp;&nbsp; 들어오는 트래픽을 서버 순서대로 배치하는 방식, 연결된 세션이 비교적 오래 사용되지 않는 경우에 채택하는 것이 좋음.(이미 들어올 때부터 순서가 정해짐)</p>
<p>&nbsp;&nbsp;&nbsp; ③ &nbsp;&nbsp;Hash(해쉬) 알고리즘<br>
&nbsp;&nbsp;&nbsp; 특정 기준을 잡아 특정 서버에 매핑하여 고정적으로 트래픽을 분산해주는 방식. 일반적으로 사용되는 기준은 출발지(클라이언트)의 IP가 됨.</p>
<p>그외) ratio(각 서버가 가질 수 있는 커넥션 비율을 이미 정해둔다), fatest(응답 속도가 가장 빠른 서버에게 우선적으로 할당하는 방식)</p>
<p>참고: <a href="https://www.youtube.com/watch?v=kYipnodgi2I">https://www.youtube.com/watch?v=kYipnodgi2I</a></p>
<p>3️⃣ NAT(Natwork Address Translation)</p>
<p>4️⃣ DSR(Direct Server Return)<br>
로드 밸런서를 거치지 않고 서버에서 클라이언트로 직접 트래픽(패킷)을 전달하는 것을 의미</p>
<p>DSR</p>
<ul>
<li>Client의 요청에 대해 서버에서 직접 응답하는 방식</li>
<li>L4를 경유하지 않고 바로 Client로 응답하여 L4장비 부하가 적어짐. </li>
<li>응답 속도가 빠름.</li>
<li>Server에서 Client IP를 확인할 수 있어 다양한 데이터 축적에 활용될 수 있음.</li>
<li>같은 L4에 등록되어있는 다른 서비스와 통신이 어려움.</li>
</ul>
<p>Proxy-Mode</p>
<ul>
<li>Client의 요청과 응답이 모두 로드 밸런서를 통과하는 방식</li>
<li>모든 통신과정에서 L4를 거치기 때문에 로드밸러서의 부하가 비교적 심함</li>
<li>Server와 로드 밸런서의 통신과정에서 NAT을 사용하여 네트워크를 사용함.</li>
</ul>
<h4 id="proxy-mode">proxy-mode</h4></div>