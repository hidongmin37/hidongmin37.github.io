---
title: 기존 이미지 및 새로운 이미지 캐싱을 위한 CloudFront 활용법(1)
date: 2025-09-30
comments: true
categories:
  - CloudFront
tags:
  - AWS
  - CloudFront
  - 이미지 캐싱
  - CDN
---

## 목차
1. [실무에서의 문제점](#실무에서의-문제점)
2. [CloudFront를 활용한 이미지 캐싱 전략](#CloudFront를-활용한-이미지-캐싱-전략)
   - [기존 이미지 캐싱](#1-기존-이미지-캐싱)
3. [결론](#결론)
---


## 실무에서의 문제점
이미지를 업로드하거나, 조회하는 api가 많았고 서버측 이미지 및 파일 캐싱은 크게 하고 있지 않고 있었습니다. 또한, 기존에 업로드된 이미지들이 많아 이를 효과적으로 캐싱하는 방법이 필요했습니다. 그러면서 동시에 새로운 이미지들도 빠르게 캐싱할 수 있는 방법이 필요했습니다.

<br>
<br>

## CloudFront를 활용한 이미지 캐싱 전략
AWS CloudFront는 전 세계에 분산된 엣지 로케이션을 통해 콘텐츠를 빠르게 전달하는 CDN 서비스입니다. 이를 활용하여 이미지 캐싱 전략을 수립했습니다.


## 1. 기존 이미지 캐싱

### a. AWS Certificate Manager(ACM)를 통한 인증서 발급 

#### 1) region us-east-1 선택
CloudFront는 오직 us-east-1 리전에서만 SSL/TLS 인증서를 발급할 수 있습니다. 따라서, 인증서를 발급할 때는 반드시 이 리전을 선택해야 합니다.
<img src="/assets/cloudfront/acm.png" alt="coco" itemprop="image">

<img src="/assets/cloudfront/cloudfront2.png" alt="coco" itemprop="image">

#### 2) CloudFront에서 이미지 캐싱으로 쓰일 도메인 입력
저는 이미 도메인을 가지고 있었기 때문에, 캐싱에 필요한 서브 도메인을 입력했습니다. 예를 들어, cdn.example.com과 같은 형식입니다.
<img src="/assets/cloudfront/cloudfront3.png" alt="coco" itemprop="image">
#### 3) 15~30분 정도 소요
인증서 발급되기 전 상태는 "Pending validation" 또는 "검증 대기 중" 상태로 표시됩니다. 인증서가 발급되기까지는 일반적으로 15~30분 정도 소요됩니다.

cname은 자동으로 생성되며, 도메인 소유권 확인을 위해 DNS 설정에 해당 cname 레코드가 연결됩니다.

<img src="/assets/cloudfront/cloudfront4.png" alt="coco" itemprop="image">

### b. CloudFront 배포 생성

#### 1) 배포 설정
CloudFront 콘솔에서 "Create Distribution" 또는 "배포 생성" 을 클릭하여 새로운 배포를 생성합니다.

<img src="/assets/cloudfront/cloudfront5.png" alt="coco" itemprop="image">

#### 2) 오리진 설정
1단계에서는 distribution name에는 식별하기 쉬운 이름을 입력합니다.

<img src="/assets/cloudfront/cloudfront6.png" alt="coco" itemprop="image">

그리고 제일 중요한 2단계 오리진 설정에서는 origin type은 Amazon S3를 선택하고 
기존 이미지가 저장된 S3 버킷 주소 입력합니다. 예를 들어, mybucket.s3.amazonaws.com과 같은 형식입니다. 나머지는 기본값으로 두었습니다.

<img src="/assets/cloudfront/cloudfront8.png" alt="coco" itemprop="image">

보안 보호는 활성화 해도 되고 안해도 됩니다. 비용차이가 얼마 나지 않아 활성화 했습니다.

<img src="/assets/cloudfront/cloudfront9.png" alt="coco" itemprop="image">

4단계는 그냥 체크하고 생성 해주면됩니다. "Create Distribution" 또는 "배포 생성" 버튼을 클릭하여 배포를 생성합니다. 

#### 4) 도메인 연결하기 
배포가 생성되면, CloudFront 배포의 도메인 이름을 확인할 수 있습니다. 그리고 라우트 도메인 연결을 해줍니다. AWS Certificate Manager(ACM) 발급할때 설정해뒀던 도메인으로 연결해줍니다. 팝업이 뜨면, setup routing automatically를 선택해줍니다.
그러면 자동으로 A레코드, AAA레코드가 연결된 것을 확인할 수 있습니다.

<img src="/assets/cloudfront/cloudfront10.png" alt="coco" itemprop="image">

#### 5) 배포 상태 확인
배포가 생성되면, 배포 상태가 "In Progress"로 표시됩니다. 배포가 완료되면 상태가 "Deployed"로 변경됩니다. 이 과정은 몇 분 정도 소요될 수 있습니다.


#### 6) 기존 이미지 캐싱 확인
배포가 완료되면, CloudFront 도메인 이름을 통해 기존 이미지를 캐싱할 수 있습니다. 예를 들어, https://cdn.example.com/myimage.jpg 와 같은 형식으로 접근할 수 있습니다. 기존 이미지가 정상적으로 캐싱되는지 확인합니다.


## 결론 

> 이와 같은 방법으로 기존 이미지를 효과적으로 캐싱할 수 있었습니다. 다음 포스트에서는 새로운 이미지 캐싱 방법에 대해 다루겠습니다.
