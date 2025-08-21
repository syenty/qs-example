// /path/to/your/project/worker.js

import { Worker } from "bullmq";
import IORedis from "ioredis";

// Redis 연결 설정 (Producer와 동일해야 함)
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// 'email-queue' 큐의 작업을 처리할 Worker 생성
const worker = new Worker(
  "email-queue",
  async (job) => {
    // 작업 처리 로직
    console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
    console.log(`[Worker] Data:`, job.data);

    // 실제 이메일 발송 로직이 들어갈 부분
    // 여기서는 5초간의 딜레이로 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 작업이 성공적으로 완료되었음을 반환
    return { status: "completed", email: job.data.email };
  },
  { connection }
);

// Worker 이벤트 리스너
worker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} completed! Result:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with error: ${err.message}`);
});

console.log("[Worker] Worker is running and waiting for jobs...");
