// /Users/syenty/SyentyProject/qs-server/dashboard.js

import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Redis 연결 설정 (Docker 환경 변수 우선 사용)
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// 모니터링할 큐 인스턴스 생성
const emailQueue = new Queue("email-queue", { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// UI 설정 추가 (업데이트 주기 2초로 변경)
serverAdapter.setUIConfig({
  pollInterval: 2000,
});

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[Dashboard] Bull Board server is running on http://localhost:${PORT}/admin/queues`);
  console.log("[Dashboard] Press Ctrl+C to exit.");
});
