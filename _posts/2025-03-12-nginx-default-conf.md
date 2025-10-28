---
title: conf.d 설정 파일이 자동으로 include될 때 생기는 함정
date: 2025-03-12
comments: true
categories:
  - Nginx
tags:
  - Nginx
  - conf.d
  - 설정
  - include

---

Nginx 설정을 하다 보면 /etc/nginx/conf.d/ 디렉터리 안의 .conf 파일들이 **자동으로 포함(include)** 된다는 사실을 모르고 헤매는 경우가 있었습니다.처음엔 이걸 모르고 “왜 설정이 안 먹지?” 하면서 밤늦게까지 로그만 들여다본 적이 있었죠.


### 목차
- [Nginx 기본 설정 구조](#nginx-기본-설정-구조)
- [실제로 겪은 “야근 상황”](#실제로-겪은-야근-상황)
- [해결 방법](#해결-방법)
- [결론](#결론)



## Nginx 기본 설정 구조
Nginx의 메인 설정 파일(/etc/nginx/nginx.conf)을 열어보면 보통 이런 설정이 있습니다.

```
http {
    include /etc/nginx/conf.d/*.conf;
    ...
}
```

이 구문은 말 그대로,
> /etc/nginx/conf.d/ 디렉터리 안에 있는 모든 .conf 파일을 http 블록 안으로 **자동으로 불러와 합친다**는 뜻입니다.


## 실제로 겪은 “야근 상황”
이걸 모르고 한 번은 정말 몇시간 동안 삽질을 했었습니다.
```
# /etc/nginx/nginx.conf 
http { include /etc/nginx/conf.d/*.conf; }

# /etc/nginx/conf.d/default.conf (기본 파일 - 삭제 안함) 
server { listen 80 default_server; server_name _; }

# /etc/nginx/conf.d/myapp.conf (새로 추가한 파일)
server { listen 80; server_name myapp.com; }
```

default.conf**의 default_server 설정이 모든 요청을 가로채고 있었던 것**이었습니다. default.conf가 myapp.conf보다 먼저 로드되고, 기본 서버로 등록되어 있어서 **새로 추가한 서버 블록이 뒤에 와도 무시**됐었 던 겁니다.


## 해결 방법

1. **기본 default.conf 수정하기**

2. **default.conf 파일 자체를 삭제하기**


📌 파일명 순서(default.conf, myapp.conf)가 알파벳 순으로 처리되기 때문에, 기본 설정이 먼저 읽히면 **새로운 설정이 덮어지지 않을 수도 있다는 점**도 주의해야합니다.


## 결론

> conf.d 안의 설정은 자동으로 합쳐지지만, **default.conf가 기본 서버로 남아 있으면 새 설정이 무시될 수 있다.** 따라서 새로 설정할 때는 **default.conf를 수정하거나 삭제**하자.





