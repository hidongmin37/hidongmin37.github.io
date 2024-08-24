---
title: "Transaction에서의 격리 수준에 대해서"
date: 2024-08-09
comments: true
categories:
  - posts
tags:
  - transaction
  - coding
---

<br>

## Transaction이란?
>트랜잭션은 데이터베이스에서 하나의 논리적 작업 단위를 구성하는 연산들의 집합입니다. 트랜잭션은 일반적으로 데이터베이스의 상태를 변화시키는 작업들을 포함하고, 주 역할은 트랜잭션내에서 에러가 발생했을 때 데이터를 보호하고, 데이터의 일관성 유지를 목표로 합니다.


### | Transaction의 ACID
- A - 원자성
  - 트랜잭션은 'All' or 'Nothing'의 원칙을 따릅니다 -> 완전히 수행되거나, 아예 수행되지 않아야합니다
  - 한 트랜잭션 내에서 어떠한 이유로 중단(Abort)됐을 때, 트랜잭션은 실패하고 모든 변경사항이 취소됩니다.
  - 트랜잭션 성공 시 모든 변경사항 적용하는 커밋(Commit)을 합니다.
  
  <br>
- C - 일관성
  - 트랜잭션 실행 전후로 데이터베이스가 일관된 상태를 유지합니다.
  - 정확성과 유효성을 보장하는 속성입니다.
  - 예를 들어,T1(출금)은 성공, T2(입금)는 실패한 경우
    결과: X 계좌에서만 돈이 빠져나가고 Y 계좌에는 입금되지 않은 경우 => 일관성 깨짐

  <br>
- I - 격리성
  - 여러 트랜잭션이 동시에 실행될 때 서로 간섭하지 않고 독립적으로 동작하는 특성을 말합니다.
  - 각 트랜잭션은 다른 트랜잭션의 중간 상태를 확인할 수 없습니다.
  - 트랜잭션 실행순서를 제어하거나,동시성 제어 기법(lock,버전관리), 트랜잭션 격리 수준설정을 통해 제어를 합니다.
  
  <br>
- D - 내구성
  - 완료된 트랜잭션의 결과가 비휘발적인 영구적으로 반영되어야 합니다.
  
  <br>

### | 격리 수준을 알기 전 지식
- **Dirty Read**:
<br> 트랜잭션이 아직 Commit되지 않은 상태에서 데이터를 읽는 상황입니다. 
<br> 예를들어, 트랜잭션A가 한 row를 update하고, commit하지 않은 상태로 두었을때, 그 사이 트랜잭션 B가 A가 업데이트한 row를 읽으려고 할때, 트랜잭션A가 commit을 하지 않았음에도 update한 내용을 읽어오게 됩니다.

<br>

- **Non-repeatable Reads**:
<br> 한 트랜잭션안에서 같은 row를 두번 읽었을때, 첫번째로 읽었을때와 두번째로 읽었을 때의 결과 값이 다를 때를 의미합니다. 
<br>예를 들어, 동시성으로 인해 트랜잭션A가 읽기 시작할때,트랜잭션 B가 update를 하고 commit을 한다고 가졍했을때 트랜잭션 A에서는 다른 값을 불러오게 됩니다.

<br>

- **Phantom Reads**:
  <br> 한 트랜잭션 내에서 같은 쿼리를 실행했을 때, 이전에 없던 레코드가 나타나거나 있던 레코드가 사라지는 현상을 의미합니다.
<br> 예를 들어, 
  - 1. 트랜잭션 A에서 "나이가 30세 이상인 사용자" 조회 (결과: 10명)하고, 
  - 2. 트랜잭션 A에서 다른 작업을 수행하고나서
  - 3. 트랜잭션 A에서 다시 "나이가 30세 이상인 사용자" 조회 (결과: 11명)했을때,
  - 4. 트랜잭션 B (A의 1과 3 사이에 실행)가 새로운 사용자를 추가 후 commit 했을 때의 상황입니다.

#### 📌 두개의 차이점
Non-repeatable Reads: 기존 레코드의 값 변경<br>
Phantom Reads: 쿼리 결과 집합의 레코드 수 변경

<br>

### | DBMS의 트랜잭션 격리 수준 
- **Read Uncommitted**:
  <br>**특징**:<br>&emsp; 다른 트랜잭션의 커밋되지 않은 변경사항도 읽을 수 있음<br>
  **발생 가능한 문제**:<br>&emsp; Dirty Read, Non-repeatable Read, Phantom Read<br>
  **장점**:<br>&emsp; 높은 동시성, 낮은 오버헤드<br>
  **단점**:<br>&emsp; 데이터 일관성 보장이 매우 약함<br>
  **사용 예**:<br>&emsp; 실시간 대략적인 집계 등 정확성보다 속도가 중요한 경우

<br>

- **Read Committed**:
  <br>**특징**:<br>&emsp; 커밋된 데이터만 읽을 수 있음<br>
  **방지되는 문제**:<br>&emsp; Dirty Read<br>
  **발생 가능한 문제**:<br>&emsp; Non-repeatable Read, Phantom Read<br>
  **장점**:<br>&emsp; Dirty Read 방지로 기본적인 데이터 일관성 제공<br>
  **단점**:<br>&emsp; 같은 쿼리를 반복 실행 시 결과가 달라질 수 있음<br>
  **사용 예**:<br>&emsp; 일반적인 웹 애플리케이션의 기본 설정

<br>

- **Repeatable Read**:
  <br> **특징**:<br>&emsp; 트랜잭션 내에서 같은 데이터를 여러 번 읽어도 동일한 결과 보장<br>
  **방지되는 문제**:<br>&emsp; Dirty Read, Non-repeatable Read<br>
  **발생 가능한 문제**:<br>&emsp; Phantom Read<br>
  **작동 방식**: 읽은 데이터에 대해 공유 락을 유지, 다른 트랜잭션의 수정 방지<br>
  **장점**:<br>&emsp; 데이터 일관성이 높음<br>
  **단점**:<br>&emsp; Read Committed보다 동시성이 낮아질 수 있음<br>
  **사용 예**:<br>&emsp; 트랜잭션 내에서 데이터 일관성이 중요한 경우



<br>

- **Serializable**:
  <br> **특징**:<br>&emsp; 트랜잭션들이 순차적으로 실행되는 것과 동일한 결과 보장 <br>
  **방지되는 문제**:<br>&emsp; Dirty Read, Non-repeatable Read, Phantom Read <br>
  **작동 방식**:<br>&emsp; 범위 락을 사용하여 새로운 데이터 삽입도 방지 <br>
  **장점**:<br>&emsp; 가장 높은 수준의 데이터 일관성과 정확성 보장 <br>
  **단점**:<br>&emsp; 동시성이 매우 낮아 성능 저하 가능성이 높음 <br>
  **사용 예**:<br>&emsp; 금융 거래 등 데이터 정확성이 절대적으로 중요한 경우


  <br>

#### 참고사이트

https://www.geeksforgeeks.org/transaction-isolation-levels-dbms/ <br>
https://www.geeksforgeeks.org/transaction-isolation-levels-dbms/?ref=header_outind