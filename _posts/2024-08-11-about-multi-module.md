---
title: "멀티 모듈에 대해서"
date: 2024-08-11
comments: true
categories:
  - posts
tags:
  - Multi Module
  - coding
---

<br>

## 멀티 모듈이란?
>멀티모듈 프로젝트는 여러 개의 독립적인 모듈을 하나의 상위 프로젝트 아래에 구성하는 소프트웨어 개발 방식입니다. 이 구조는 대규모 애플리케이션을 더 관리하기 쉽고 유지보수가 용이한 작은 단위로 분할할 수 있게 해줍니다.
> <br>
> 모듈 단위로 독립적으로 배포되고 빌드할 수 있는 것이 특징입니다.


### | 그렇다면 개발자들은 멀티모듈을 왜 사용할까?

- 서로 다른 프로젝트에서 공통된 코드를 사용하게 되면, 코드 복붙을 많이 해야하기 때문에 중복된 코드를 줄이기 위해서 
- 여러 프로젝트에서는 인스턴스를 그만큼 실행해야하기 때문에 리소스가 너무 크기 때문에 
- 각각의 모듈과 패키지가 독립적인 역할을 해서 의존성이 낮아지기 때문에
- 



```angular2html
root-project/
├── common-module/
│   ├── src/
│   └── build.gradle
├── auth-module/
│   ├── src/
│   └── build.gradle
├── api-module/
│   ├── src/
│   └── build.gradle
├── web-module/
│   ├── src/
│   └── build.gradle
├── settings.gradle
└── build.gradle
```
이런 구조에서 common-module은 공통 유틸리티와 도메인 로직을, auth-module은 인증관련 기능을,api-module과 web-module은 api서버와 웹 인터페이스를 담당할 수 있습니다.


<br>

<img src="/assets/multi-module-1/img.png" alt="multi-module" itemprop="image">
[출처:우아한멀티모듈 by 우아한형제들 권용근님]

해당 영상(https://www.youtube.com/watch?v=nH382BcycHc)을 들어보면, 이미지와 같이 member 도메인을 복사 붙여넣기 하는 과정에서 많은 시행착오가 있었음을 알 수있습니다.

<br>
<img src="/assets/multi-module-1/img3.png" alt="multi-module" itemprop="image">

그리고 결과적으로 위와 같은 이미지의 멀티 모듈에 단일 프로젝트를 만들게 되었다고 합니다. 시스템으로 보장되는 일관성 그리고 빠른 개발 사이클의 장점을 가지고 갈 수 있었다라는 것을 알 수 있습니다.

하지만! common에 모든 로직을 넣다가 보니깐

1. 스파게티 코드 
    1. 코드가 서로 너무 의존적이게 되어 전체가 영향을 받음
2. 너무 의존적인 코드(common안에서) -> 여러가지 라이브러리들을 common에 모두 넣음
3. 같이 설정을 하지 않아도 되는 것까지 공통 모듈에 넣어졌던 부분

멀티 모듈에 대해서 장점을 취하려다가 새로운 단점이 생기게 되었다고 합니다. 



결국에 멀티모듈 프로젝트에서 가장 중요한 것은 모듈에 대한 기준입니다.

1.&nbsp;&nbsp;의미있는 경계 설정
  - 각 모듈은 독립적으로 의미를 가질 수 있는 논리적 단위어야 합니다.
  - 모듈 내의 컴포넌트들은 서로 밀접한 관련이 있어야하며, 다른 모듈과는 명확히 구분되어야합니다.

2.&nbsp;&nbsp;역할과 책임의 명확성
   - 각 모듈은 명확하고 구체적인 역할을 가져야합니다.
   - 모듈의 책임 범위가 너무 넓거나 좁지 않도록 해야합니다.

3.&nbsp;&nbsp;협력 관계의 적절성
  - 모듈간의 상호작용과 의존성이 자연스럽고 효율적이어야합니다.
  - 순환 의존성을 피하고, 모듈 간 결합도를 최소화로 해야합니다.





<img src="/assets/multi-module-1/img4.png" alt="multi-module" itemprop="image">

=>  BOOT(Server), INFRA, DATA(Domain), SYSTEM(Cloud)을 기준으로 나누라고 합니다.

- BOOT(Server):<br>
  애플리케이션의 실행과 관련된 설정
  웹 서버 구성, 요청 처리 등

- INFRA:<br>
  인프라스트럭처 관련 코드 (데이터베이스 연결, 캐싱 등)

- DATA(Domain):<br>
  비즈니스 로직과 도메인 모델
  데이터 접근 계층 (repositories)

- SYSTEM(Cloud):<br>
  클라우드 서비스 통합
  분산 시스템 관련 기능 (로드 밸런싱, 서비스 디스커버리 등)

[인프런2022-멀티모듈프로젝트구조와설계 part]

#### 📌 멀티 모듈에서 중요한 점은 구성과 기준
효과적인 모듈 구성은 프로젝트의 복잡성을 관리하고, 코드의 재사용성을 높이며, 유지보수를 용이하게 만듭니다. 따라서 프로젝트의 특성과 요구사항을 고려하여 이러한 기준을 신중히 적용하는 것이 중요합니다.






#### 참고사이트

https://techblog.woowahan.com/2637/ <br>

https://www.youtube.com/watch?v=nH382BcycHc

https://woo0doo.tistory.com/37?category=1181257