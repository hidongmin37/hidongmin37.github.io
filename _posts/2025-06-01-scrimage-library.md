---
title: Docker 환경에서 Scrimage WebP 변환 이슈 해결하기
date: 2025-04-01
comments: true
categories:
  - issues
  - docker
  - kotlin
tags:
  - docker
  - webp
  - scrimage
  - kotlin
---

## 문제 상황

Spring Boot 애플리케이션에서 이미지를 WebP 포맷으로 변환하는 기능을 구현했는데, 로컬에서는 잘 동작하던 코드가 Docker 환경에서는 다음과 같은 에러가 발생했습니다.

```
WebP 변환 실패: IOException - Cannot run program "/tmp/cwebp13152885294486185014binary": error=2, No such file or directory
java.io.IOException: Cannot run program "/tmp/cwebp13152885294486185014binary": error=2, No such file or directory
    at java.base/java.lang.ProcessBuilder.start(ProcessBuilder.java:1143)
    at com.sksamuel.scrimage.webp.CWebpHandler.convert(CWebpHandler.java:95)
    at com.sksamuel.scrimage.webp.WebpWriter.write(WebpWriter.java:61)
```

## 원인 분석

### Scrimage 라이브러리의 동작 방식
[Scrimage](https://github.com/sksamuel/scrimage)는 Kotlin/Java용 이미지 처리 라이브러리입니다. WebP 변환을 위해 내부적으로 Google의 `cwebp` 바이너리를 사용합니다.

```kotlin
// 이런 식으로 WebP 변환을 시도
fun convertToWebpWithLossless(imageFile: File): ByteArray {
    val image = ImmutableImage.loader().fromFile(imageFile)
    return image.output(WebpWriter.DEFAULT)
}
```

### 문제의 핵심
1. Scrimage는 시스템에 `cwebp` 바이너리가 설치되어 있다고 가정
2. Docker 베이스 이미지(주로 Alpine Linux나 Debian slim)에는 `cwebp`가 없음
3. Scrimage가 임시 디렉토리에 바이너리를 추출하려 하지만 실패

## 실제로 실무에서 해결했던 방법

### 1. Dockerfile에 webp 패키지 설치

#### Alpine Linux 기반
```dockerfile
FROM openjdk:17-alpine

# webp 도구 설치
RUN apk add --no-cache libwebp-tools

COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Debian/Ubuntu 기반
```dockerfile
FROM openjdk:17-slim

# webp 도구 설치
RUN apt-get update && \
    apt-get install -y webp && \
    rm -rf /var/lib/apt/lists/*

COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```


## 추가 고려사항

### 1. 대안 라이브러리
Scrimage 대신 다른 방법들:
- **ImageIO WebP Plugin**: 순수 Java 구현
- **TwelveMonkeys ImageIO**: 다양한 포맷 지원
- **Sharp for Java**: Node.js Sharp의 Java 바인딩

## 결론

이미지 처리 라이브러리를 사용할 때는 외부 바이너리 의존성을 항상 고려해야 합니다. Docker 환경에서의 배포 시, 필요한 도구를 명시적으로 설치하는 것이 중요합니다.


이번 이슈를 통해 배운 점:
1. 로컬과 프로덕션 환경의 차이를 항상 고려
2. 외부 의존성은 Dockerfile에 명시적으로 선언
