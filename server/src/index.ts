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

// 부팅 시 스키마/시드 자동 초기화 (배포 환경에서 빈 DB 자가 복구)
async function ensureDb() {
  try {
    await prisma.sector.count();
  } catch {
    console.log("⚙️  스키마 없음 → prisma db push 실행");
    execSync("npx prisma db push --skip-generate --accept-data-loss", { cwd: SERVER_ROOT, stdio: "inherit" });
  }
  await seedIfEmpty();
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
