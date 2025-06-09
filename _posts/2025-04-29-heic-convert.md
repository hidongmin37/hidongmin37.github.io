---
title: HEIC 변환(WebP) 문제 해결하기
date: 2025-04-29
comments: true
categories:
  - images
tags:
  - webp
---

## 문제 상황

Spring Boot 애플리케이션에서 Java 17을 사용하고 있었고, Scrimage 라이브러리를 통해 HEIC 이미지를 변환하려 했습니다.  
그러나 다음과 같은 에러가 발생했습니다:

```
 {resultCode: 400, resultMessage: WebP 변환 오류: Image parsing failed for unknown image format. Tried the following ImageReader implementations:
flutter: com.sksamuel.scrimage.webp.WebpImageReader@627be199 failed due to java.io.IOException: [Decoding of /tmp/input4037700734218202580webp failed., Status: 3(BITSTREAM_ERROR)]
flutter: com.sksamuel.scrimage.nio.ImageIOReader (delegates to the JDK javax.imageio readers) failed due to No javax.imageio.ImageReader supported this image format
flutter: com.sksamuel.scrimage.nio.PngReader (delegates to ar.com.hjg.pngj) failed}
```


## 원인 분석

### HEIC 포맷의 특수성

HEIC(High Efficiency Image Container)는 Apple이 iOS 11부터 도입한 이미지 포맷으로, 기존 JPEG보다 압축률이 높지만 **호환성 문제가 존재**합니다.  
특히 서버 환경에서는 지원 라이브러리가 부족한 편입니다.

### Scrimage의 한계

- Scrimage는 기본적으로 HEIC 포맷을 지원하지 않음
- Java ImageIO도 HEIC를 기본적으로 지원하지 않음
- HEIC → WebP 직접 변환은 불가능

## 해결 과정

### 1️⃣ HEIC 지원 라이브러리 추가 시도

#### `build.gradle.kts`

TwelveMonkeys ImageIO 라이브러리를 추가하여 HEIC 포맷을 지원하려고 했습니다.  
그러나 검색 결과, HEIC 지원은 TwelveMonkeys가 Java 21부터 지원하고 있어서, **현재 Java 17을 사용하는 프로젝트에서는 적용이 불가능**했습니다.

### 2️⃣ 순수 Java 솔루션 검토

외부 프로세스 없이 Java만으로 해결하려고 했으나:

- HEIC 포맷은 Java 표준 라이브러리에서 지원되지 않음
- Scrimage + TwelveMonkeys 조합도 한계가 있음

따라서 **Java-only 접근법은 현실적으로 어려웠습니다**.

### 3️⃣ 클라이언트 측 해결 검토 (Flutter)

처음에는 클라이언트 측에 HEIC → JPEG 또는 WebP 변환을 요청할 수도 있었습니다.  
하지만 이미 "서버에서 처리해 달라"는 요구가 있었기 때문에 서버 쪽에서 해결 방안을 찾는 방향으로 진행했습니다.

### 4️⃣ 최종 해결책: Docker + ImageMagick 활용

결국 HEIC 파일을 WebP로 변환하기 위해 **ImageMagick을 사용하는 방법**을 선택했습니다.

HEIC 처리를 위해 필요한 패키지는 다음과 같습니다:

```dockerfile
FROM openjdk:17-alpine

# ImageMagick과 WebP 도구 설치
RUN apk add --no-cache \
    imagemagick \
    libwebp-tools \
    libheif

COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

이렇게 서버 내에서 HEIC 파일을 WebP로 변환할 수 있었습니다.

### 결론
HEIC 포맷 처리는 서버 측에서 생각보다 복잡할 수 있습니다. 따라서 다음과 같은 전략이 유효합니다:

- 가능하면 클라이언트에서 변환 요청 → 가장 단순하고 효율적

- 서버에서 처리 필요 시 ImageMagick 활용 → Docker 이미지 크기 증가 감수

- 사용자에게 적절한 안내 제공 → JPEG 포맷 사용 권장

- HEIC 포맷 변환 라이브러리 사용 → 제약이 좀 있음

HEIC는 Apple 생태계에서는 표준이 되었지만, 웹 환경에서는 여전히 호환성 이슈가 많습니다.
장기적으로는 브라우저 및 서버 환경에서의 네이티브 지원이 개선되기를 기대해 봅니다.