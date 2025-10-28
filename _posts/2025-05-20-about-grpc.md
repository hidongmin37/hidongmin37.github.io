---
title: gRPC에 관하여
date:  2025-05-20
comments: true
categories:
  - gRPC
tags:
  - gRPC
  - 원격 프로시저 호출
  - Protocol Buffers

---

## 목차
1. [gRPC란?](#gRPC란)
2. [예시 코드](#예시-코드)
3. [gRPC는 그렇다면 왜? 사용이 되고 있을까?](#gRPC는-그렇다면-왜-사용이-되고-있을까)
4. [실무에서 REST vs gRPC 선택 기준](#실무에서-REST-vs-gRPC-선택-기준)
5. [gRPC의 한계와 주의사항](#gRPC의-한계와-주의사항)

## gRPC란?
원격 함수 호출(Remote Procedure Call, RPC)을 현대적으로 구현한 프레임워크입니다.
-> “다른 서버에 있는 함수를, 마치 내 로컬 코드 처럼 호출하게 해주는 통신 방식” 이라고 생각하면 쉬울 것 같습니다. 즉, 네트워크 요청/응답을 직접 처리하지 않아도 서버의 함수를 그냥 코드로 부르듯 호출할 수 있게 만들어 주는 기술입니다.



## 예시 코드
아래는 간단한 **덧셈(Add)** 예제입니다.

서버는 **JavaScript (Node.js)**, 클라이언트는 **Java**로 작성돼 있지만,
둘 다 같은 .proto 파일을 기반으로 완벽하게 통신합니다.

#### Server (JavaScript / Node.js)
```
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "./add.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const adderPackage = grpcObject.sample;

function add(call, callback) {
  const result = call.request.a + call.request.b;
 console.log(`Received: ${call.request.a} + ${call.request.b} = ${result}`);
  callback(null, { result });
}

function main() {
  const server = new grpc.Server();
  server.addService(adderPackage.Adder.service, { Add: add });
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log("✅ gRPC Server running on port 50051");
  });
}

main();

```

##### server.addService() 부분에서 실제 서비스(Adder)와 함수(Add)를 연결합니다.
클라이언트가 Add 함수를 호출하면, call.request.a + call.request.b를 계산해 응답을 보냅니다.
HTTP나 JSON 처리를 직접 하지 않고, gRPC가 **Protobuf 바이너리 포맷**으로 데이터를 주고받습니다.

#### Client (Java)

```
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import sample.AdderGrpc;
import sample.AddRequest;
import sample.AddResponse;

public class GrpcClient {
    public static void main(String[] args) {
        // 서버와의 채널 생성
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 50051)
                .usePlaintext()
                .build();

        // gRPC 스텁 생성
        AdderGrpc.AdderBlockingStub stub = AdderGrpc.newBlockingStub(channel);

        // 요청 생성
        AddRequest request = AddRequest.newBuilder()
                .setA(5)
                .setB(3)
                .build();

        // 서버 호출
        AddResponse response = stub.add(request);

        System.out.println("5 + 3 = " + response.getResult());

        channel.shutdown();
    }
}

```
ManagedChannel을 통해 Node.js 서버(localhost:50051)에 연결합니다.
##### AdderGrpc.newBlockingStub(channel)로 서버에 정의된 메서드를 “로컬 함수”처럼 쓸 수 있는 객체를 생성합니다.
stub.add(request)를 호출하면 gRPC가 자동으로 네트워크 요청을 만들어 서버의 Add 함수를 실행하고, 응답(AddResponse)을 받습니다.


## gRPC는 그렇다면 왜? 사용이 되고 있을까?

gRPC를 지탱하는 핵심 기술에는 3가지가 있습니다.

1. HTTP/2 기반 전송
2. Protobuf (Protocol Buffers)
3. 스트리밍 (Streaming)


#### 1) HTTP/2 기반 전송
gRPC는 기본적으로 HTTP/2 위에서 동작하도록 설계되어 있습니다. 물론 REST API도 HTTP/2를 사용할 수 있지만, 대부분의 REST 프레임워크는 여전히 HTTP/1.1을 기본으로 하고 있습니다. 
반면 gRPC는 HTTP/2의 기능(멀티플렉싱, 헤더 압축, 스트리밍)을 **언어 수준에서 적극 활용**하도록 만들어졌기 때문에 “요청 여러 개 / 응답 여러 개 / 실시간 양방향 스트리밍” 같은 고성능 통신 패턴에 더 자연스럽게 맞습니다.


- 하나의 TCP 연결에서 여러 요청을 동시에 보낼 수 있다. -> 동시 호출이 많은 마이크로서비스 환경에서 병목(헤드 오브 라인 블로킹) 줄어듦

- 헤더 압축 등으로 불필요한 중복 전송을 줄인다.
- 서버가 먼저 데이터를 푸시하거나(서버 스트리밍 등) 클라이언트/서버가 동시에 주고받는 양방향 스트리밍이 가능하다


##### 2) Protobuf (Protocol Buffers)
gRPC는 메세지를 JSON이 아니라 바이너리 형태인 Protobuf로 직렬화합니다. 그래서 다음과 같은 특징을 가지고 있습니다.
- 직렬화/역직렬화가 매우 빠르다.
- 전송되는 Payload크기가 JSON보다 훨씬 작다. -> 모바일처럼 대역폭이 제한적인 환경, 내부 마이크로서비스 고QPS 환경에서 굉장히 유리하다.

##### 3) 스트리밍 (Streaming)
gRPC는 4가지 호출 패턴을 지원한다.
1. Unary 요청(REST 와 같다고 보면됨)
2. Server streaming
  - 클라이언트가 한 번 요청하면 서버가 여러 개의 응답을 스트리밍으로 계속 보냄.
  - 실시간 로그 tail, 주가 스트림
3. Client streaming
  - 클라이언트가 여러 메시지를 연속으로 보내고 서버는 마지막에 한번에 응답
  - 클라이언트가 큰 데이터를 조각내서 업로드
4. Bidirectional streaming
  - 양쪽이 동시에 계속 주고 받음(양방향 전이중 통신)
  - 채팅, 실시간 게임 상태 동기화


REST/HTTP 1.1 세계에서는 이걸 구현하려면 WebSocket, SSE, 폴링 등 별도 채널을 또 만들어야 하는데
gRPC는 애초에 언어 차원에서 이 패턴을 네이티브 지원한다.


요약하면:
* 외부(클라이언트 다양함, 브라우저 포함)에게 열어줄 퍼블릭 API → REST가 편하다.
* 내부(마이크로서비스끼리 엄청 자주 호출, 성능 민감) → gRPC가 훨씬 낫다.


AWS와 여러 아티클에서도 “브라우저 지원 한계 때문에 퍼블릭 웹은 여전히 REST가 더 무난하지만,
서비스 내부/백엔드 간 통신은 gRPC가 고성능이라 각광받는다”고 정리하고 있다



## 실무에서 REST vs gRPC 선택 기준

| 상황                    | 추천   | 이유                      |
|-----------------------|------|-------------------------|
| 외부 Public API         | REST | 브라우저 호환, 디버깅 용이         |
| 내부 서비스 간 통신           | gRPC | 성능, 타입 안정성              |
| 고트래픽 환경 (초당 수천~수만 요청) | gRPC | 낮은 레이턴시, 작은 페이로드        |
| 빠른 프로토타이핑             | REST | 별도 proto 정의 불필요         |
| 실시간 양방향 통신            | gRPC | Bidirectional streaming |


## gRPC의 한계와 주의사항
- **브라우저 직접 지원 불가**: gRPC-Web 프록시 필요
- **학습 곡선**: .proto 작성, 코드 생성 과정 필요
- **HTTP/2 필수**: 일부 레거시 인프라에서 지원 안 될 수도