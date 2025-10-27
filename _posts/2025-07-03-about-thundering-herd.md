---
title: Thundering herd Problem 관하여
date: 2025-07-02
comments: true
categories:
  - Thundering herd Problem
tags:
  - 동시성
---

## 목차

1. [Thundering herd Problem란 무엇일까?](#Thundering herd Problem란 무엇일까?)
2.  [쉬운 예시](#쉬운-예시)
3.  [실제로는 어디서 발생할까?](#실제로는-어디서-발생할까)
4.  [PayPal Braintree의 사례](#PayPal-Braintree의-사례)
5.  [쉽게 생각할 수 있는 대응(?)](#쉽게-생각할-수-있는-대응)
6.  [여러 진짜 대응 방안들](#여러-진짜-대응-방안들)
7.  [결론](#결론)

---

## Thundering herd Problem란 무엇일까?[]
위키 백과에는 이렇게 나와있다.

> the thundering herd problem occurs when a large number of processes or threads waiting for an event are awakened when that event occurs, but only one process is able to handle the event.

여러 개의 프로세스나 스레드가 **같은 신호(이벤트)** 를 기다리고 있다가 그 신호가 한 번 발생하면 **모두 동시에 깨어나는 상황**을 말합니다.  => 되게 안 와닿는 표현인 듯 하다.


## 쉬운 예시)
식당으로 비유해보겠습니다. 100명이 문 앞에서 "오픈 10시"를 기다리고 있습니다.
정확히 10시에 문을 열면 100명이 동시에 몰려들어서 카운터가 마비되겠죠? 이것이 바로 Thundering Herd입니다.

<br>
<br>

앞에 식당에서는 여러 해결책을 둘 수 있습니다.
- 줄서기 번호표 나눠주기 (큐잉)
- 10시~10시5분 사이 랜덤 입장 (지터)
- 시간대별 예약제 (Rate Limiting)

<br>
<br>

## 실제로는 어디서 발생할까?

이 문제는 단순히 서버 수를 떠나서 시스템 내부의 동기화 패턴 때문에 발생하기도 합니다.

1. 분산 캐시나 DB락을 해제하는 순간 => 수많은 프로세스가 동시 접근
2. 큐에 작업이 새로 추가될때 => 여러 워커가 동시 접근
3. 재시도 로직이 동일한 간격으로 설정되었을 때 => 실패한 잡들이 모두 같은 지접에 재시도
4. 배치나 크론 잡이 같은 시각에 실행됨

<br>
<br>

### PayPal Braintree의 사례

dispute API 잡들이 모두 동일한 재시도 주기로 돌아오면서 외부 서비스에 한꺼번에 요청을 보내 시스템 전체가 마비되는 일이 발생했다고 합니다.

<br>
<br>

### 쉽게 생각할 수 있는 대응(?)

1. 캐싱하기
  - 캐싱도 일종의 전략이라고 볼 수 있지만, 캐싱이 미스가 되면, 한꺼번에 다시 요청이 되기 때문에 캐시 만료 시점에서 다시 발생할 수 있습니다.
  - 따라서 아래 진짜 대응 방안과 함께 섞어서 사용하면 좋습니다.

<br>
<br>

### 여러 진짜 대응 방안들

#### 1.지터(jitter) 적용 => 랜덤 분산(?)
  - 지터는 간격을 들쭉 날쭉 해지는 현상을 말합니다.
  - 재시도 간격이나 예약된 작업 실행 시점을 고정된 시간으로 두지말고, **랜덤하게 분산**
    → 5초 ± 1초 랜덤 식으로 약간의 지터
```
delay = min(max_delay, base_delay * (2 ** retry_count))
jitter = random.uniform(0, delay * 0.2)
sleep(delay + jitter)
```

#### 2.큐잉(버퍼링) / 메시지 브로커 적용
  - 이벤트나 요청이 몰릴 때, 큐에 담아둬서 관리 => 워커가 일정한 속도로 처리
  - 대량 재시도 => 한꺼번에 요청이 안되게

#### 3.Rate Limit / 토큰 버킷 적용
  - 사용자나 서비스 단위로 요청 속도 제한 =>  정해진 시간 동안 사용할 수 있는 토큰을 나눠주는 식으로
  - redis를 활용해서
   ```
   import redis.clients.jedis.Jedis;
   
   public class RedisRateLimiterLua {
    private final Jedis jedis;
    private final int limit;
    private final int expireSec;
   
    private static final String LUA_SCRIPT = """
        local current = redis.call("INCR", KEYS[1])
        if current == 1 then
            redis.call("EXPIRE", KEYS[1], ARGV[2])
        end
        if current > tonumber(ARGV[1]) then
            return 0
        else
            return 1
        end
        """;
   
    public RedisRateLimiterLua(Jedis jedis, int limit, int expireSec) {
        this.jedis = jedis;
        this.limit = limit;
        this.expireSec = expireSec;
    }
   
    public boolean isAllowed(String userId) {
        long nowSec = System.currentTimeMillis() / 1000;
        String key = String.format("rate:%s:%d", userId, nowSec);
   
        Object result = jedis.eval(LUA_SCRIPT, 1, key, String.valueOf(limit), String.valueOf(expireSec));
        return Long.valueOf(1L).equals(result);
    }
   }
   ```


#### 4.Exponential Backoff 전략 적용
  - 재시도 시간 텀을 늘려가며 재시도하는 전략

   ```
   @Retryable(
    value = [Exception::class],
    maxAttempts = 3,
    backoff = Backoff(
        delay = 1000,      // 1초 대기
        multiplier = 2.0,  // 재시도마다 2배씩 증가 (1초 -> 2초 -> 4초)
        maxDelay = 8000    // 최대 8초
    )
   ```

#### 5.사전 스케일링 및 지속적 모니터링
  - 트래픽이 예측가능한 경우 서버를 미리 확장 시켜둠 => 오토스케일링은 지연시간이 존재하여 허드 발생 순간 빠른 대응이 어려움.



## 결론

> 사실상 키포인트는 **분산**이라고 할 수 있습니다.  위 대응방안들도 결국에는 시간과 자원을 분산시키는 것이고, 모두가 동시에 깨어나지 않게 설계하는 것(PayPal Tech Talk)이 궁극적인 목표입니다. 이러한 분산 설계원칙을 지켜서 안정적이게 동작할 수 있도록 하게 해야할 것 같습니다.

