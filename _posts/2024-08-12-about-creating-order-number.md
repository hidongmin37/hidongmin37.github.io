---
title: "주문 번호 생성에 대해서"
date: 2024-08-12
categories:
  - posts
tags:
  - Order number
  - coding
---

<br>

## 주문번호에서의 요구 조건은 무엇일까?

- 업무효율성 향상을 위해주문에 대한 대략적인 정보를 담고있어야 합니다
- 고객실수를 방지하기 위해 길이가 고정되어있어야 합니다.
- 길이가 최대한 짧으면 좋습니다.
- 주문별로 고유한 값이어야 합니다.

  <br>

### |  다른 회사에서 주문번호는 어떻게 생성할까?

#### 네이버 페이
숫자로만 구성 된 17글자의 주문번호
#### 쿠팡
숫자로만 구성 된 13글자의 주문번호

<br>


### | 주문번호에 담을 수 있는 것들은 뭐가 있을까?

- 상품 분류코드
- 혜택 정보
- 환불 절차 코드
- 위탁 상품 유무 코드
- 주문번호를 잘못 소통했을때 첫글자와 마지막 숫자를 더한 값을 주문코드 마지막에 checksum 추가


<br>

### | 하루에 주문양에 따라 주문번호를 정할 수 있습니다.

<table class="bg-bg-100 min-w-full border-separate border-spacing-0 text-sm leading-[1.88888]"><thead class="border-b-border-100/50 border-b-[0.5px] text-left"><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><th class="text-text-000 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] font-400 px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">no</th><th class="text-text-000 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] font-400 px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">규칙</th><th class="text-text-000 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] font-400 px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">길이</th><th class="text-text-000 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] font-400 px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">경우의 수</th><th class="text-text-000 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] font-400 px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">Note</th></tr></thead><tbody><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"><strong>▼ 숫자만의 구성</strong></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">1</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 3자리&lt;br&gt;예 : 201811111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">9자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 1,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">2</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 4자리&lt;br&gt;예 : 2018111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">10자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 10,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">3</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 5자리&lt;br&gt;예 : 20181111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">11자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 100,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">4</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 6자리&lt;br&gt;예 : 201811111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">12자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 1,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟡 조금 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">5</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 7자리&lt;br&gt;예 : 2018111111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 10,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">6</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 8자리&lt;br&gt;예 : 20181111111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">14자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 100,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">7</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 랜덤숫자 9자리&lt;br&gt;예 : 201811111111111</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">15자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 1,000,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"><strong>▼ 영문과 숫자의 무작위 제한된 영어+숫자로 구성</strong></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">8</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 3자리&lt;br&gt;예 : 201811A1B</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">9자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 27,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">9</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 4자리&lt;br&gt;예 : 201811A1B2</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">10자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 810,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">10</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 5자리&lt;br&gt;예 : 201811A1B2C</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">11자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 24,300,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">11</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 6자리&lt;br&gt;예 : 201811A1B2C3</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">12자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 729,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟡 조금 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">12</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 7자리&lt;br&gt;예 : 201811A1B2C3D</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 21,870,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 8자리&lt;br&gt;예 : 201811A1B2C3D</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 656,100,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">14</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + '규칙'영문자 9자리&lt;br&gt;예 : 201811A1B2C3D</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 19,683,000,000,000개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"><strong>▼ 영어+숫자로 구성</strong></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;"></td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;"></td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">15</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 3자리&lt;br&gt;예 : 201811A1B</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">9자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 46,656개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">16</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 4자리&lt;br&gt;예 : 201811A1B2</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">10자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 1,679,616개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">17</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 5자리&lt;br&gt;예 : 201811A1B2C</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">11자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 60,466,176개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟢 적정값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">18</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 6자리&lt;br&gt;예 : 201811A1B2C3</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">12자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 2,176,782,336개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🟡 조금 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">19</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 7자리&lt;br&gt;예 : 201811A1B2C3D</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">13자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 78,364,164,096개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">20</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 8자리&lt;br&gt;예 : 201811A1B2C3D4</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">14자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 2,821,109,907,456개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr><tr class="[tbody>&amp;]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">21</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: left;">연월일(YYMMDD) + 모든 영문자 9자리&lt;br&gt;예 : 201811A1B2C3D4E</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">15자리</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: right;">하루당 101,559,956,668,416개</td><td class="border-t-border-100/50 [&amp;:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&amp;:not(:first-child)]:border-l-[0.5px]" style="text-align: center;">🔴 긴 값이</td></tr></tbody></table>

1. 2 : E와 발음이 비슷
2. 5 : O와 발음이 비슷
3. E : 2와 발음이 비슷
4. I : L과 모양이 비슷
5. L : I와 모양이 비슷
6. O : 5와 발음이 비슷
-> 해당 문자와 숫자는 제외시키고 만든 테이블입니다.

해당 테이블에서 보이는 것처럼 트래픽이나 유저 수에 따라서 주문 번호의 길이를 정할 수 있는데, 12글자로 정의를 해보겠습니다.

<br>

### 주문에서 UUID를 만드려면 동시성 때문에 중복이 될 수도 있다.

- 여러 서버나 프로세스가 동시에 번호를 생성할 때 중복이 발생할 수 있습니다. 이는 데이터 일관성과 무결성을 해칠 수 있습니다.

### | 스노우 플레이크란?
Twitter의 Snowflake 알고리즘은 분산 시스템에서 유일한 ID를 생성하는 데 매우 효과적인 방법입니다.<br>

1.구조<br>
  64비트 정수로 구성됩니다.
<br>

2.구성 요소
- 타임스탬프 (41비트): 밀리초 단위의 시간 정보
- 데이터센터 ID (5비트): 최대 32개의 데이터센터 식별
- 워커 ID (5비트): 각 데이터센터 내 최대 32개의 워커 식별
- 시퀀스 번호 (12비트): 같은 밀리초 내에서 4096개의 고유 ID 생성 가능
<br>

3.장점:

- 시간에 따라 정렬 가능
- 분산 시스템에 적합
- 높은 성능
- ID의 의미를 쉽게 해석 가능

<br>
4.작동 방식:

- 현재 시간을 기반으로 ID의 첫 부분을 생성
- 데이터센터와 워커 정보를 추가
- 같은 밀리초 내에서는 시퀀스 번호를 증가시켜 고유성 보장

<br>

5.사용 사례:

대규모 분산 시스템에서의 고유 ID 생성
데이터베이스 샤딩을 위한 키 생성
마이크로서비스 아키텍처에서의 트랜잭션 ID 생성


### 만들어보기 

1️⃣ &nbsp; &nbsp;트위터 snowflake 이용
* 날짜 부분 (5자리):

년도의 마지막 두 자리 (2자리)
해당 년도의 일 수 (3자리, 001-366)

* 유니크 부분 (7자리):
스노우플레이크 ID의 하위 7자리

  

- YY(년도 2자리)DDD(해당 년도의 일 수 3자리) 형식으로 반환
```java
  private String generateCompressedDatePart(long snowflakeId) {
        // 스노우플레이크 ID에서 타임스탬프 추출
        long timestamp = (snowflakeId >> 22) + SnowflakeIdGenerator.TWEPOCH;
        LocalDate date = Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDate();
        
        // 년도의 마지막 두 자리
        int year = date.getYear() % 100;
        // 해당 년도의 일 수 (1-366)
        int dayOfYear = date.getDayOfYear();
        
        // YY(년도 2자리)DDD(해당 년도의 일 수 3자리) 형식으로 반환
        return String.format("%02d%03d", year, dayOfYear);
    }
```

```java

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

public class OrderNumberGenerator {
    private final SnowflakeIdGenerator snowflake;

    public OrderNumberGenerator(long datacenterId, long workerId) {
        this.snowflake = new SnowflakeIdGenerator(datacenterId, workerId);
    }

    public String generateOrderNumber() {
        long snowflakeId = snowflake.nextId();
        // 날짜 부분 (5자리)과 고유 부분 (7자리)를 조합하여 12자리 주문번호 생성
        String datePart = generateCompressedDatePart(snowflakeId);
        String uniquePart = String.format("%07d", snowflakeId % 10000000L);
        return datePart + uniquePart;
    }

    private String generateCompressedDatePart(long snowflakeId) {
        // 스노우플레이크 ID에서 타임스탬프 추출
        long timestamp = (snowflakeId >> 22) + SnowflakeIdGenerator.TWEPOCH;
        LocalDate date = Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDate();
        
        // 년도의 마지막 두 자리
        int year = date.getYear() % 100;
        // 해당 년도의 일 수 (1-366)
        int dayOfYear = date.getDayOfYear();
        
        // YY(년도 2자리)DDD(해당 년도의 일 수 3자리) 형식으로 반환
        return String.format("%02d%03d", year, dayOfYear);
    }

    // 스노우플레이크 ID 생성기 내부 클래스
    private static class SnowflakeIdGenerator {
        // 2010-11-04 09:42:54.657 UTC - 스노우플레이크 시작 시간
        private static final long TWEPOCH = 1288834974657L;
        
        // 각 부분의 비트 수 정의
        private static final long WORKER_ID_BITS = 5L;
        private static final long DATACENTER_ID_BITS = 5L;
        private static final long SEQUENCE_BITS = 12L;
        
        // 최대값 계산
        private static final long MAX_WORKER_ID = -1L ^ (-1L << WORKER_ID_BITS);
        private static final long MAX_DATACENTER_ID = -1L ^ (-1L << DATACENTER_ID_BITS);
        
        // 비트 시프트 값 계산
        private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
        private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
        private static final long TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;
        
        private static final long SEQUENCE_MASK = -1L ^ (-1L << SEQUENCE_BITS);
        
        private long workerId;
        private long datacenterId;
        private long sequence = 0L;
        private long lastTimestamp = -1L;

        public SnowflakeIdGenerator(long datacenterId, long workerId) {
            // 데이터센터 ID와 워커 ID의 유효성 검사
            if (workerId > MAX_WORKER_ID || workerId < 0) {
                throw new IllegalArgumentException("Worker ID can't be greater than " + MAX_WORKER_ID + " or less than 0");
            }
            if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
                throw new IllegalArgumentException("Datacenter ID can't be greater than " + MAX_DATACENTER_ID + " or less than 0");
            }
            this.workerId = workerId;
            this.datacenterId = datacenterId;
        }

        // 다음 ID 생성
        public synchronized long nextId() {
            long timestamp = timeGen();
            
            // 시계가 뒤로 갔는지 체크
            if (timestamp < lastTimestamp) {
                throw new RuntimeException("Clock moved backwards. Refusing to generate id for " + (lastTimestamp - timestamp) + " milliseconds");
            }
            
            // 같은 밀리초 내에서의 처리
            if (lastTimestamp == timestamp) {
                sequence = (sequence + 1) & SEQUENCE_MASK;
                if (sequence == 0) {
                    // 같은 밀리초 내에서 시퀀스를 모두 사용했으면 다음 밀리초까지 대기
                    timestamp = tilNextMillis(lastTimestamp);
                }
            } else {
                sequence = 0L;
            }

            lastTimestamp = timestamp;

            // ID 조합: 타임스탬프 + 데이터센터 ID + 워커 ID + 시퀀스
            return ((timestamp - TWEPOCH) << TIMESTAMP_LEFT_SHIFT) |
                    (datacenterId << DATACENTER_ID_SHIFT) |
                    (workerId << WORKER_ID_SHIFT) |
                    sequence;
        }

        // 다음 밀리초까지 대기
        private long tilNextMillis(long lastTimestamp) {
            long timestamp = timeGen();
            while (timestamp <= lastTimestamp) {
                timestamp = timeGen();
            }
            return timestamp;
        }

        // 현재 시간을 밀리초로 반환
        private long timeGen() {
            return System.currentTimeMillis();
        }
    }

    public static void main(String[] args) {
        OrderNumberGenerator generator = new OrderNumberGenerator(1, 1);
        String orderNumber = generator.generateOrderNumber();
        System.out.println("Generated Order Number: " + orderNumber);
    }
}


```

2️⃣ &nbsp; &nbsp; 날짜 + 시간 + 상품 카테고리 + 시퀀스

```java

public class OrderNumberGenerator {
    private static int sequence = 0;

    public synchronized String generateOrderNumber(int categoryCode) {
        LocalDateTime now = LocalDateTime.now();
        int dayOfYear = now.getDayOfYear();
        int secondOfDay = now.getHour() * 3600 + now.getMinute() * 60 + now.getSecond();
        
        sequence = (sequence + 1) % 100; // 0-99 사이의 시퀀스
        
        return String.format("%03d%05d%02d%02d", dayOfYear, secondOfDay, categoryCode, sequence);
    }
}
```
<br>

### | 날짜를 포함하면 좋은 점들 

- 데이터 분산 및 중복 방지: <br>
  날짜를 포함하면 시간에 따라 자연스럽게 데이터를 분산시킬 수 있습니다.
  특정 파티션이나 샤드에 데이터 몰리는 것 방지 그리고 날짜로 인하여 생성될때 중복이 방지될 수 있습니다.
<br>

- 데이터 관리 용이성: <br>
  오래된 데이터를 쉽게 아카이브(압축해서 보관)하거나 삭제할 수 있습니다.<br> 예를 들어, 1년 이상 된 데이터를 별도 저장소로 이동하거나 삭제하는
  작업이 간편해집니다.
<br>


<h3> | 파티션 및 샤딩? </h3>

> 대규모 데이터베이스를 관리하고 성능을 최적화하기 위한 기술.

<h5>1. 파티셔닝 (Partitioning)</h5>
파티셔닝은 단일 데이터베이스 내에서 테이블을 여러 부분으로 나누는 기술입니다.
<h5>주요 특징:</h5>
<ul>
<li>논리적으로는 하나의 테이블이지만 물리적으로는 여러 부분으로 나뉩니다.</li>
<li>각 파티션은 같은 스키마를 공유하지만 다른 저장 위치를 가질 수 있습니다.</li>
<li>주로 대용량 테이블의 성능을 향상시키고 관리를 용이하게 하기 위해 사용됩니다.</li>
</ul>

<h5>파티셔닝을 사용할 경우</h5>
<ul>
<li>테이블이 매우 크고 쿼리 성능이 저하될 때</li>
<li>특정 열을 기준으로 데이터를 분리하고 싶을 때 (예: 날짜, 지역 등)</li>
<li>데이터 유지 관리(아카이빙, 삭제 등)를 효율적으로 하고 싶을 때</li>
</ul>

<h5>2. 샤딩 (Partitioning)</h5>
샤딩은 데이터를 여러 데이터베이스 서버에 분산시키는 기술입니다.
<h5>주요 특징:</h5>
<ul>
<li>데이터를 여러 물리적 서버에 분산시킵니다.</li>
<li>각 샤드(조각)는 독립적인 데이터베이스처럼 작동할 수 있습니다.</li>
<li>수평적 확장을 가능하게 하여 시스템의 처리량을 증가시킵니다.</li>
</ul>

<h5>샤딩을 사용할 경우</h5>
<ul>
<li>단일 데이터베이스 서버의 용량이나 성능 한계에 도달했을 때</li>
<li>지리적으로 분산된 사용자를 지원해야 할 때</li>
<li>고가용성과 내결함성을 높이고 싶을 때</li>
</ul>

#### 참고사이트

https://velog.io/@dochis/CS%EC%B2%98%EB%A6%AC%EC%97%90-%ED%9A%A8%EC%9C%A8%EC%A0%81%EC%9D%B8-%EC%A3%BC%EB%AC%B8%EB%B2%88%ED%98%B8-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%A3%BC%EB%AC%B8%EB%B2%88%ED%98%B8-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98 <br>

https://velog.io/@disdos0928/DB%EC%97%90-%EC%A0%91%EA%B7%BC%ED%95%98%EC%A7%80-%EC%95%8A%EC%9C%BC%EB%A9%B4%EC%84%9C-%EC%A3%BC%EB%AC%B8%EB%B2%88%ED%98%B8%EB%A5%BC-%EC%83%9D%EC%84%B1%ED%95%B4%EC%95%BC%ED%95%9C%EB%8B%A4

<br>

https://popcorn-overflow.tistory.com/10