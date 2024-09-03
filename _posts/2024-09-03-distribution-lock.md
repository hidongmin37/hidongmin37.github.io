---
title: "distribution lock"
date: 2024-09-03
comments: true
categories:
  - posts
tags:
  - distribution lock
  - coding
---

<br>

### 분산락(Distribution Lock)이란?

> 분산락은 여러 서버나 프로세스가 공유 리소스에 동시에 접근하는 것을 제어하는 동기화 메커니즘입니다. 이는 분산 시스템에서 데이터의 일관성과 무결성을 유지하는 데 중요한 역할을 합니다.

---
<br>

### 분산락이 필요한 이유?
임계 구역의 상호 배제를 보장하기 위하여 Lock을 사용하는데, 임계 구역을 하나의 서버가 접근하는 경우 언어에서 제공하는 Lock의 기능을 활용할 수 있지만 , 여러 대의 서버에서 임계 구역을 접근하는 경우에는 임계 구역의 상호 배제를 보장하는 방법이 필요한 데 이를 분산락이라고 합니다. 

<br>

### 구현 방식
분산락은 보통 모든 서버가 접근할 수 있는 중앙 시스템(예: 데이터베이스, Redis, ZooKeeper)을 사용하여 구현됩니다.


<br>

### 1. Database를 이용한 분산락
- 데이터베이스를 이용한 분산락은 데이터베이스의 트랜잭션을 이용하여 구현합니다.

<br>

#### 장점

- 기존 사용하던 RDB 인프라를 활용하여 구현할 수 있어서 구현이 쉽습니다.

<br>

#### 단점

- 자체 타임아웃 기능이 없고, 서버에서 별도로 타임아웃 스케줄링이 필요합니다.
- Spin Lock을 사용하기 때문에 SQL을 반복적으로 실행하게 되어 부하가 발생할 수 있습니다.
- Redis에 비해 상대적으로 무겁습니다.


<br>


---

### 2. ZooKeeper를 이용한 분산락
- ZooKeeper는 분산 시스템에서 노드 간의 협업과 동기화를 지원하는 분산 코디네이션 서비스입니다. ZooKeeper를 사용하면 분산 시스템 환경에서 분산 락(distributed lock) 메커니즘을 구현할 수 있습니다.

<img src="https://blog.kakaocdn.net/dn/P1ENO/btrzMJQKQns/6Gk6Msr07rjRHJp0VN8GAK/img.png" srcset="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&amp;fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FP1ENO%2FbtrzMJQKQns%2F6Gk6Msr07rjRHJp0VN8GAK%2Fimg.png" onerror="this.onerror=null; this.src='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png'; this.srcset='//t1.daumcdn.net/tistory_admin/static/images/no-image-v1.png';" width="750" height="301" data-origin-width="1609" data-origin-height="645" data-phocus-index="0">

#### 주키퍼의 3가지 특징
- 클러스터링 : 주키퍼는 홀수로 구성된 클러스터로 구성합니다. 홀수로 구성하는 이유는 다수결을 통해 데이터의 일관성을 유지하기 위함입니다.

- 데이터베이스 : 주키퍼는 키-값 기반의 데이터베이스를 제공합니다. 데이터베이스를 사용하여 분산 시스템의 구성, 동기화, 상태 관리등을 수행합니다. 

- 복제 : 주키퍼는 데이터베이스의 모든 데이터를 복제합니다. 따라서, 주키퍼 클러스터의 일부 서버가 장애가 발생하더라도, 데이터의 손실없이 시스템을 유지할 수 있습니다. 

#### 장점
- 높은 신뢰성 : ZooKeeper는 분산 시스템에서 사용되는 분산 코디네이션 서비스로 높은 신뢰성을 가지고 있습니다.
- 자동 락 해제 : ZooKeeper는 클라이언트가 세션을 종료하거나 연결이 끊어지면 자동으로 락을 해제합니다.
- 순서 보장 : ZooKeeper는 클라이언트가 락을 획득한 순서대로 락을 해제합니다.
- 높은 확장성 : ZooKeeper는 높은 확장성을 가지고 있어서 수천 대의 서버를 지원합니다.

#### 주요 구성 요소

- **ZooKeeper 클러스터(Ensemble)**<br> ZooKeeper는 여러 개의 서버로 구성된 클러스터(Ensemble) 형태로 동작합니다. 클러스터는 일반적으로 3대 이상의 ZooKeeper 서버로 구성되며, 서버의 개수는 항상 홀수로 구성됩니다. 이유는 다수결을 통해 데이터를 처리하기 위함입니다. 예를 들어, 3대 중 2대가 동일한 결정을 내려야만 데이터가 확정됩니다.

- **ZNode**<br> ZooKeeper는 데이터를 ZNode라고 불리는 노드 형태로 저장합니다. ZNode는 디렉토리와 유사한 구조를 가지고 있으며, 각 ZNode에는 데이터와 메타데이터(버전, 타임스탬프 등)가 저장됩니다. ZNode는 /로 구분된 계층적 트리 구조로 관리됩니다. 예를 들어, /app/config라는 경로에 설정 정보를 저장할 수 있습니다.

<br>
  <img style="margin: auto" alt="" width="442" height="253" loading="lazy" src="https://miro.medium.com/v2/resize:fit:884/0*e7OajreBS1BhL8vU.jpg">


- **세션(Session)**<br> 클라이언트가 ZooKeeper와 연결될 때 세션이 만들어집니다. 클라이언트는 ZooKeeper와의 세션이 살아있는 동안 ZNode를 생성하거나 수정할 수 있습니다. 만약 클라이언트가 ZooKeeper와의 연결이 끊어지면 세션이 종료되고, ZooKeeper는 세션과 관련된 작업들을 자동으로 정리합니다.

- **Watcher(감시자)**<br> 클라이언트는 특정 ZNode에 대해 Watcher를 설정할 수 있습니다. Watcher는 ZNode의 변경사항(데이터 변경, 삭제 등)이 발생할 때 클라이언트에게 알림을 주는 이벤트 리스너와 같은 역할을 합니다. 이를 통해 클라이언트는 실시간으로 데이터의 변경을 감지하고 대응할 수 있습니다.

#### 구현 단계

#### ⓵ 리더 선출
서버들은 리더라는 특별한 멤버를 선출하고 나머지 다른 서버는 팔로워가 된다. 과반수 팔로워의 상태가 리더와 동기화 되면 대표 선출 단계가 끝난다.

#### ⓶ Atomic Broadcast
모든 요청은 리더에게 전달되고, 리더는 팔로워에게 업데이트를 broadcast 한다. 과반수 노드에서 변경을 저장하면 리더는 업데이트 연산을 commit하고, 클라이언트는 업데이터가 성공했다는 응답을 받게 된다.


#### 3. Redis를 이용한 분산락
Redis를 이용한 분산락은 Redis의 단일 스레드 특성과 원자적 명령어를 활용하여 구현합니다. 주로 Redisson과 Lettuce 라이브러리를 사용하여 구현합니다.



#### Redisson을 이용한 분산락

**특징:**
1. **편리한 API:** 분산 환경에서의 동시성 제어를 위한 직관적이고 사용하기 쉬운 API를 제공합니다.
2. **락 획득 대기 시간 설정:** 락 획득을 위한 대기 시간을 설정할 수 있어, 무한 대기를 방지할 수 있습니다.
3. **자동 락 갱신 (Watch Dog 메커니즘):** 락을 보유한 스레드가 작업을 수행하는 동안 자동으로 락의 만료 시간을 연장합니다.
4. **pub/sub 방식:** 스핀락 방식이 아닌 pub/sub 방식을 사용하여 Redis 서버의 부하를 줄입니다.
5. **페어락(Fair Lock):** 요청 순서대로 락을 획득할 수 있는 공정한 락 획득 방식을 제공합니다.


<br>

### 결론
분산락은 분산 시스템에서 데이터의 일관성과 무결성을 유지하는 데 중요한 역할을 합니다. 주요 구현 방식인 데이터베이스, ZooKeeper, Redis를 이용한 방식을 비교해 보면 다음과 같습니다:

<br>

⓵ **데이터베이스를 이용한 분산락**

장점: 기존 RDB 인프라 활용 가능, 별도 시스템 도입 불필요<br>
단점: 성능 부하 가능성, 자체 타임아웃 기능 부재
적합한 상황: 간단한 분산 환경, 추가 인프라 구축이 어려운 경우


⓶ **ZooKeeper를 이용한 분산락**

장점: 높은 신뢰성, 자동 락 해제, 순서 보장, 높은 확장성<br>
단점: 별도의 ZooKeeper 클러스터 구축 및 관리 필요
적합한 상황: 복잡한 분산 시스템, 높은 신뢰성이 요구되는 경우

③ **Redis(Redisson)를 이용한 분산락**

장점: 높은 성능, 편리한 API, 자동 락 갱신, 다양한 락 타입 제공<br>
단점: Redis 서버 의존성, 네트워크 파티션 시 주의 필요
적합한 상황: 고성능이 요구되는 분산 시스템, 빈번한 락 연산이 필요한 경우
---

<br>

결론적으로, 소규모 시스템에서는 데이터베이스를 이용한 방식이 간단하고 효과적일 수 있습니다. 중대규모 시스템에서는 Redis(Redisson)를 이용한 방식이 성능과 사용 편의성 면에서 우수한 선택이 될 수 있습니다. 매우 복잡하고 높은 신뢰성이 요구되는 대규모 분산 시스템에서는 ZooKeeper를 고려해 볼 수 있습니다.


#### 참고사이트

https://devoong2.tistory.com/entry/Spring-Redisson-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-Distribute-Lock-%EB%8F%99%EC%8B%9C%EC%84%B1-%EC%B2%98%EB%A6%AC-1

https://channel.io/ko/blog/distributedlock_2022_backend

https://jaemunbro.medium.com/zookeeper-%EC%A3%BC%ED%82%A4%ED%8D%BC%EC%9D%98-%EA%B8%B0%EB%B3%B8-%ED%8A%B9%EC%A7%95-7da2a51351c5