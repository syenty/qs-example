# BullMQ & Bull Board 큐 시각화 예제

이 프로젝트는 `BullMQ`를 사용하여 백그라운드 작업을 처리하는 큐(Queue)를 구현하고, `@bull-board/express`를 이용해 해당 큐의 상태를 시각적으로 모니터링하는 대시보드를 제공하는 간단한 예제입니다. `docker-compose`를 통해 모든 서비스를 쉽게 배포하고 실행할 수 있도록 구성되어 있습니다.

## ✨ 주요 기능

- **작업 큐 구현**: `BullMQ`를 사용하여 안정적이고 빠른 메시지 큐를 생성합니다.
- **큐 데이터 처리**: 큐에 추가된 작업을 처리하는 워커(Worker)를 구현합니다.
- **시각화 대시보드**: `@bull-board/ui`를 통해 큐의 상태(대기, 진행, 완료, 실패 등)를 실시간으로 확인할 수 있는 웹 UI를 제공합니다.
- **작업 추가 및 관리 API**: `Express` 서버를 통해 큐에 작업을 추가하고, 상태별로 조회하며, 정리하는 REST API를 제공합니다.
- **Express 연동**: `Express` 웹 서버에 Bull Board 대시보드를 쉽게 통합합니다.
- **Docker Compose**: Redis, Producer, Worker, Dashboard 서비스를 한 번에 쉽게 실행하고 관리할 수 있습니다.

## 🛠️ 주요 의존성

`package.json`에 명시된 주요 라이브러리는 다음과 같습니다.

- `express`: 웹 서버 프레임워크
- `bullmq`: Redis 기반의 빠르고 강력한 큐 라이브러리
- `ioredis`: 고성능 Redis 클라이언트
- `@bull-board/api`, `@bull-board/express`, `@bull-board/ui`: Bull/BullMQ 큐를 위한 시각화 대시보드

## ⚙️ 시작하기

### 사전 준비 사항

- **Node.js** (v14 이상 권장)
- **npm** 또는 **yarn**
- **Docker** 및 **Docker Compose** (모든 서비스를 한 번에 실행하기 위해 필요합니다.)

### 📦 설치 및 실행

1.  **프로젝트 클론**

    ```bash
    git clone [프로젝트-저장소-URL]
    cd [프로젝트-디렉토리명]
    ```

2.  **의존성 설치**

    ```bash
    npm install
    ```

3.  **Docker Compose로 모든 서비스 실행**

    프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 Redis, Producer, Worker, Dashboard 서비스를 모두 시작합니다.

    ```bash
    docker-compose up --build
    ```

    > **참고**: `worker.js` 파일이 존재하지 않는 경우, `worker` 서비스는 오류를 발생시키거나 종료될 수 있습니다. 실제 작업을 처리하려면 `worker.js` 파일을 구현해야 합니다. (예: `new Worker('email-queue', async job => { console.log('Processing job:', job.data); }, { connection });`)

    모든 서비스가 성공적으로 시작되면, 다음과 같은 메시지를 콘솔에서 확인할 수 있습니다.

    ```
    [Producer] API server listening on port 4000
    [Dashboard] Bull Board server is running on http://localhost:3000/admin/queues
    ```

## 🚀 사용법

`docker-compose up` 명령어로 모든 서비스가 실행된 후, 웹 브라우저나 API 클라이언트를 통해 프로젝트를 사용할 수 있습니다.

### 1. 작업 추가 및 관리 (Producer API)

`producer` 서비스는 `localhost:4000` 포트에서 실행됩니다.

- **작업 추가 (POST)**:
  `http://localhost:4000/jobs` 엔드포인트로 `POST` 요청을 보내 큐에 작업을 추가합니다.

  **예시 (cURL):**

  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"name": "send-email", "data": {"to": "test@example.com", "subject": "Hello BullMQ", "body": "This is a test email."}}' http://localhost:4000/jobs
  ```

- **작업 상태별 조회 (GET)**:
  `http://localhost:4000/jobs?status=<status>` 엔드포인트로 `GET` 요청을 보내 특정 상태의 작업을 조회합니다. `<status>`는 `completed`, `waiting`, `active`, `delayed`, `failed`, `paused` 중 하나 또는 콤마로 구분된 여러 개가 될 수 있습니다.

  **예시 (cURL):**

  ```bash
  curl http://localhost:4000/jobs?status=waiting,active
  ```

- **작업 정리 (DELETE)**:
  `http://localhost:4000/jobs?status=<status>` 엔드포인트로 `DELETE` 요청을 보내 특정 상태의 작업을 정리합니다. `<status>`는 `completed`, `wait`, `active`, `delayed`, `failed` 중 하나여야 합니다.

  **예시 (cURL):**

  ```bash
  curl -X DELETE http://localhost:4000/jobs?status=completed
  ```

### 2. 큐 시각화 대시보드 (Bull Board)

`dashboard` 서비스는 `localhost:3000` 포트에서 실행됩니다.

- 웹 브라우저에서 다음 주소로 접속하여 Bull Board 대시보드를 확인할 수 있습니다.
  `http://localhost:3000/admin/queues`

이 대시보드를 통해 큐에 등록된 작업의 목록과 상태를 실시간으로 모니터링하고, 작업을 재시도하거나 삭제하는 등의 관리를 할 수 있습니다.

## 📄 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.
