---
title: 실무에서의 Redis Stream 활용기
date: 2025-10-20
comments: true
categories:
  - Redis
tags:
  - Redis
  - Stream
---

레디스 publish/subscribe 구조는 간단한 메시징 시스템을 구현하는 데 유용하지만,
메시지의 신뢰성, 영속성, 소비자 그룹 관리 등 고급 기능이 부족하다.
우리는 유실 없이, 다시 읽을 수 있고, 처리 속도 조절도 가능한 메시징이 필요할 때가 있다.

## 1. Redis Stream 소개
Stream은 로그(append-only log) 형태로 메시지를 쌓고,
소비자 그룹(Consumer Group)으로 메시지를 안정적으로 분산 처리하고,
필요하면 다시 읽고, 재처리할 수 있는 메시징 구조를 제공한다.

## 2. Publish/Subscribe와의 비교

| 기능 비교        | Pub/Sub        | Stream                  |
|--------------|----------------|-------------------------|
| 메시지 저장       | X (실시간 전송)     | O (로그로 저장)              |
| 구독자 없으면 메시지? | 바로 소멸          | 그대로 남음                  |
| 재처리 / 재시도    | 불가능            | 가능 (`XACK`, `XCLAIM`)   |
| 소비 방식        | push broadcast | pull-based (클라이언트가 가져감) |
| 병렬 처리        | 직접 관리 필요       | Consumer Group 으로 자동 분산 |
| 운영 난이도       | 쉬움             | 중간 (개념 이해 필요)           |

Stream은 Kafka의 단일 파티션 버전이라고 이해하면 감각적으로 딱 맞다.

## 3. Redis Stream 기본 구조

### 1) Stream 은 ID + Key-Value Map 형태로 메시지가 쌓인다.


<img src="/assets/redis/img.png" alt="coco" itemprop="image">

저장되면 이런 식으로 저장됨:

<img src="/assets/redis/img_1.png" alt="coco" itemprop="image">

ID는 시간 기반(millisecond 단위)으로 자동 증가한다.

### 핵심 포인트
- Append-Only Log: 뒤에 계속 쌓인다.
- 중간 삭제는 일반 사용에서는 하지 않는다.
- 필요 시 길이 제한 가능: `XADD mystream MAXLEN ~ 1000 * user=...`

### 2) 메시지 읽기

<img src="/assets/redis/img_3.png" alt="coco" itemprop="image">

- `XRANGE mystream - +` : 전체 읽기

<img src="/assets/redis/img_4.png" alt="coco" itemprop="image">

- `XREAD COUNT 2 STREAMS mystream 0` : 0부터 2개 읽기

<img src="/assets/redis/img_5.png" alt="coco" itemprop="image">

- `XREAD BLOCK 0 STREAMS mystream $` : 새로 추가되는 메시지 대기 후 읽기
- 실시간으로 읽는 것을 확인할 수 있다.
- $ 는 “가장 최신에서부터 기다린다”는 의미.

## 3) Consumer Group 으로 안정적 분산 처리

이게 Stream 의 진짜 힘이다.
#### 1) Consumer Group 생성
```redis
XGROUP CREATE mystream mygroup 0
```

#### 2) Consumer 가 메시지 읽기
```redis
XREADGROUP GROUP mygroup worker-1 BLOCK 0 STREAMS mystream >
```
- `mygroup` 이라는 Consumer Group 에서 `worker-1` 이라는 Consumer 가 메시지를 읽는다.

- `>` 는 아직 어떤 Consumer 도 읽지 않은 새로운 메시지를 의미.

#### 3) 메시지 처리 완료 알림

```redis
XACK mystream mygroup 1697041234567-0
```
- 처리 완료 시 ACK 를 보내줘야 한다.
- ACK 를 보내지 않으면 해당 메시지는 미처리 상태로 남아있다.

#### 4) 만약 Consumer 가 중간에 죽으면?

Pending List 에 처리되지 않고 남는다.

```redis
XPENDING mystream mygroup
```
다른 워커가 가져가서 재처리:

```redis
XCLAIM mystream mygroup worker-2 60000 1697041234567-0
```
- 60000 밀리초(1분) 이상 ACK 가 없는 메시지를 `worker-2` 가 가져가서 처리.

## 3. 운영에서 알아야할 핵심 구조

Stream (메시지 로그)

└── Consumer Group

├── Consumer-1 (워커)

├── Consumer-2 (워커)

└── Pending List (미처리 메시지 큐)

### 자동 병렬 처리
워커를 늘리면 Redis가 메시지를 자동으로 라운드로빈 분배해준다.

> Kafka의 파티션 단위 병렬처리 = Redis Stream에서는 컨슈머 개수만 늘려도 병렬처리 됨


## 4. 실무 활용 팁
| 문제               | 해결 전략                              |
|------------------|------------------------------------|
| 메시지가 무한 증가       | `MAXLEN ~` 으로 soft trim            |
| 워커 장애로 메시지 유실 가능 | XACK + XPENDING + XCLAIM 으로 복구     |
| 유저별 속도 차이 클 때    | 컨슈머 그룹 내 워커 수 확장                   |
| 특정 메시지 무한 재시도    | 실패 카운트 저장 + Dead Letter Queue 패턴   |
| 대량 데이터 처리        | Stream → Kafka or SQS 로 클라우드 전환 고려 |

## 5. 내가 실무에서 활용한 아키텍쳐 구조

> Client → WebSocket Server → Redis Pub/Sub (Broadcast) → Redis Stream (Log & Delivery) → Chat Worker → DB 저장

- 메시지 유실 없이 저장 가능
- 채팅 검색/기록 가능
- 후처리(읽음 표시/알림) 가능

## 6. 요약

| 키워드      | 설명                               |
|----------|----------------------------------|
| 저장형 메시징  | Pub/Sub과 달리 메시지가 로그로 남음          |
| 안정적 처리   | ACK / 재처리 / 재전송 가능               |
| 자동 병렬 처리 | Consumer Group 확장으로 성능 scale-out |
| 적절한 용도   | 채팅, 작업 큐, 이벤트 처리, 로그 수집          |

Streams는 Redis의 “가볍지만 강력한 Kafka 느낌” 이다.


