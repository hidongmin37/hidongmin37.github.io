---
title: "소나큐브 개념과 적용"
date: 2024-08-25
comments: true
categories:
  - posts
tags:
  - SONARQUBE
  - coding
---

<br>

### 1. 소나큐브란?
> 소나큐브는 20개 이상의 프로그래밍 언어에서 버그, 코드 스멜, 보안 취약점을 발견할 목적으로 정적 코드 분석으로 자동 리뷰를 수행하기 위한 지속적인 코드 품질 검사용 오픈 소스 플랫폼입니다.

<br>


### 2. 주요특징

<img src="/assets/sonar/img.png" alt="sonar" itemprop="image">


**지속적인 코드 인스펙션**

지속적인 인스펙션은 소프트웨어 개발 라이프 사이클의 완전한 부분으로 소프트웨어 품질을 향상시키기 위해서 설계된 코드 품질 관리 방법입니다. 소나큐브는 코드를 지속적으로 검사하여 코드 품질을 향상시키는 데 도움을 줍니다.
  - 지속적인 검사: 지속적인 통합처럼 지속적인 검사 수행
  - 품질 가시화: 프로젝트 이해 관계자를 위한 품질 가시화
  - 조기에 문제 해결: 개발 초기 부터 문제를 해결하여 ROI를 높임
  - 문제 해결의 적시성: 알림을 통한 최대한 빠른 해결


### 3. 주요 기능
- **코드 품질 관리**
  - 프로젝트의 홈에서 품질 게이트, 버그, 취약성, 중복코드, 단위 테스팅 정보를 한눈에 보여주며 현재 코드의 품질 측면에서 위치를 확인시켜줌
  - 빌드와 통합을 통해 소스코드 품질의 변화를 즉각적으로 확인할 수 있음
  
- **다중 언어의 Coding Rules**
  - 소나큐브는 20개 이상의 프로그래밍 언어를 지원하며, 각 언어에 대한 코딩 규칙을 제공
  - checkstyle, PMD, FindBugs, Checkmarx, Fortify 등의 외부 분석기에 대한 플러그인 지원

- **Quality Profiles**
  - 소나큐브는 프로젝트에 대한 품질 프로필을 제공하며, 프로젝트에 대한 분석 시 사용되는 룰을 정의할 수 있음.

- **Quality Gates**
  - 품질 게이트를 통해 다양한 조직의 품질 요구사항을 설정 가능
  - 복잡도, 커버리지, 중복, 보안성, 유지보수성, 사이즈, 신뢰성, 이슈등 다양한 항목에 대해 품질 요구사항 설정

<br>


### 4. 소나큐브의 아키텍쳐
소나큐브는 크게 4가지로 구성되어 있습니다.

① **소나큐브 스캐너** 

② **소나큐브 컴퓨팅 엔진**

③ **소나큐브 서버**

④ **소나큐브 데이터베이스**

<br>


<img src="/assets/sonar/image2.png" alt="sonar" itemprop="image">


<br>

### 5. 소나큐브의 UI

<img src="/assets/sonar/image3.png" alt="sonar" itemprop="image">

<br>
<br>
<br>
<br>

<img src="/assets/sonar/image4.png" alt="sonar" itemprop="image">

<br>
<br>
<br>
<br>

<img src="/assets/sonar/image6.png" alt="sonar" itemprop="image">

<br>
<br>
<br>
<br>

<img src="/assets/sonar/image7.png" alt="sonar" itemprop="image">

### 6. 소나큐브 도커로 ec2 서버에 설치하기


① 기본적으로 소나큐브의 포트는 9000번으로 설정되어 있습니다. 따라서 ec2 서버의 9000번 포트를 열어줍니다. 하지만 기본적인 포트가 8080로 되어있기 때문에, 8080번 포트로 변경해줍니다.
```bash
docker run -d --name sonarqube -p 8080:9000 sonarqube
```

② 소나큐브의 컨테이너를 실행시킨 후, 브라우저에서 `http://{EC2-PUBLIC-IP}:8080`로 접속합니다.

③ 소나큐브의 초기 아이디와 초기 비밀번호는 `admin`으로 설정되어 있습니다. 따라서 초기 로그인 시 아이디와 비밀번호를 `admin`으로 입력합니다.

④ 로그인 후, 새로운 비밀번호를 설정합니다.

⑤ 소나큐브의 대시보드에서 Projects를 누르고 Create Project를 눌러 프로젝트를 생성합니다.
<br>
<br>

<img src="/assets/sonar/img8.png" alt="sonar" itemprop="image">

⑥ Use the global setting 클릭

⑦ 프로젝트 키와 프로젝트 이름을 입력하고, Generate 클릭

⑧ sqp로 시작하는 토큰을 보관한다.
<br>
<br>

<img src="/assets/sonar/img9.png" alt="sonar" itemprop="image">

⑨ 토큰을 확인하고 넘어가면 빌드 환경을 선택하면 프로젝트 연결을 위해 입력해야할 명령어가 나온다. 이때 복사를 해두고 다음으로 넘어간다.
<br>
<br>

<img src="/assets/sonar/img10.png" alt="sonar" itemprop="image">


⑩ 프로젝트를 생성하고, git flow를 이용하여 소나큐브를 연결한다.

```bash
      - name: SonarQube Scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: |
          ./gradlew sonarqube \
          -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }} \
          -Dsonar.host.url=${{ secrets.SONAR_URL }} \
          -Dsonar.login=${{ secrets.SONAR_TOKEN }}

```

⑪ 이때 git flow를 통해서 main에 머지할때나 pr을 날릴 때 코드를 검사할 수 있기에 코드 품질을 높일 수 있다.

#### 참고사이트


<br>

https://www.youtube.com/watch?v=4u9730Ky_w0