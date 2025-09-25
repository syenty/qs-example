import express from "express";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import path from "path";
import { fileURLToPath } from "url";

// ES Module용 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express 앱 생성
const app = express();
app.use(express.json()); // JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.static(path.join(__dirname, "public"))); // public 디렉토리의 정적 파일 제공

// Redis 연결 설정 (Docker 환경 변수 우선 사용)
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// 'email-queue'라는 이름의 큐 생성
const emailQueue = new Queue("email-queue", { connection });

// 작업 추가 API 엔드포인트
app.post("/jobs", async (req, res) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: "Job name and data are required." });
    }

    // 큐에 작업 추가
    const job = await emailQueue.add(name, data);

    console.log(`[Producer] Job added with ID: ${job.id}`);
    res.status(201).json({ message: "Job added successfully", jobId: job.id });
  } catch (error) {
    console.error("[Producer] Error adding job:", error);
    res.status(500).json({ error: "Failed to add job to the queue." });
  }
});

// 작업 상태별 목록 조회 API 엔드포인트
app.get("/jobs", async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ error: "Query parameter 'status' is required." });
    }

    const jobStatuses = status.split(",").map((s) => s.trim());
    const validStatuses = ["completed", "waiting", "active", "delayed", "failed", "paused"];

    const allJobs = [];
    for (const jobStatus of jobStatuses) {
      // getJobs(types, start, end, asc) -> asc를 true로 설정하여 오름차순 정렬
      const jobs = await emailQueue.getJobs([jobStatus], 0, -1, true);
      jobs.forEach((job) => {
        allJobs.push({ ...job.toJSON(), status: jobStatus });
      });
    }

    res.status(200).json(allJobs);
  } catch (error) {
    console.error("[Producer] Error getting jobs:", error);
    res.status(500).json({ error: "Failed to get jobs from the queue." });
  }
});

// 작업 정리(clean) API 엔드포인트
app.delete("/jobs", async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Query parameter 'status' is required." });
    }

    // BullMQ의 clean 메서드가 지원하는 상태 값들입니다.
    // 'active' 상태의 작업을 정리하면 'failed' 상태로 이동됩니다.
    const validCleanStatuses = ["completed", "wait", "active", "delayed", "failed"];
    if (!validCleanStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `Cleaning jobs with status '${status}' is not supported.` });
    }

    // 큐에서 해당 상태의 작업들을 정리합니다. (grace: 0, limit: 1000)
    await emailQueue.clean(0, 1000, status);

    console.log(`[Producer] Cleaned jobs with status: ${status}`);
    res.status(200).json({ message: `Jobs with status '${status}' have been cleared.` });
  } catch (error) {
    console.error(`[Producer] Error cleaning jobs:`, error);
    res.status(500).json({ error: "Failed to clean jobs from the queue." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[Producer] API server listening on port ${PORT}`);
  console.log(`[Producer] Send a POST request to http://localhost:${PORT}/jobs to add a job.`);
  console.log(
    `[Producer] Send a GET request to http://localhost:${PORT}/jobs?status=<status> to view jobs.`
  );
  console.log(`[Producer] View the custom job dashboard at http://localhost:4000`);
});
