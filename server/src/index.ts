import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { prisma } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import { authRouter } from "./routes/auth.js";
import { surveyRouter, sectorRouter } from "./routes/survey.js";
import { newsRouter, tipRouter } from "./routes/news.js";
import { myfinRouter } from "./routes/myfin.js";
import { portfolioRouter } from "./routes/portfolio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // server/src
const SERVER_ROOT = path.resolve(__dirname, ".."); // server
const WEB_DIR = process.env.WEB_DIR || path.resolve(__dirname, "../../app/dist"); // 빌드된 웹

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  if (req.path.startsWith("/api")) console.log(`${new Date().toISOString().slice(11, 19)}  ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "StaFin Mark II", ts: Date.now() }));
app.use("/api/auth", authRouter);
app.use("/api/survey", surveyRouter);
app.use("/api/sectors", sectorRouter);
app.use("/api/news", newsRouter);
app.use("/api/fintips", tipRouter);
app.use("/api/myfin", myfinRouter);
app.use("/api/portfolios", portfolioRouter);

// 빌드된 Expo 웹을 같은 도메인에서 서빙 (배포 시 단일 서비스)
if (fs.existsSync(path.join(WEB_DIR, "index.html"))) {
  app.use(express.static(WEB_DIR));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(WEB_DIR, "index.html"));
  });
  console.log(`🌐 웹 정적 서빙: ${WEB_DIR}`);
} else {
  console.log(`ℹ️  웹 빌드 없음(${WEB_DIR}) → API 전용 모드`);
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "internal error" });
});

// 부팅 시 스키마 동기화 + 시드 (Postgres 영속 DB: 최초 1회 테이블 생성·시드, 이후엔 no-op)
async function ensureDb() {
  try {
    // 매 부팅 스키마 동기화 (이미 일치하면 즉시 통과). 데이터 손실이 필요한 변경은
    // 비대화형에서 실패하므로 안전하게 보존됨.
    execSync("npx prisma db push --skip-generate", { cwd: SERVER_ROOT, stdio: "inherit" });
  } catch (e: any) {
    console.error("⚠️ prisma db push 경고(계속 진행):", e?.message ?? e);
  }
  try {
    await seedIfEmpty(); // 정적 데이터(섹터·시사·상품 등)가 비어 있을 때만 주입
  } catch (e) {
    console.error("⚠️ seed 경고:", e);
  }
}

const PORT = Number(process.env.PORT ?? 4000);
ensureDb()
  .catch((e) => console.error("DB init 경고:", e))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`\n⭐ StaFin Mark II → http://localhost:${PORT}`);
      console.log(`   health: http://localhost:${PORT}/api/health\n`);
    });
  });
