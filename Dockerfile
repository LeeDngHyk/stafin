# StaFin Mark II — 단일 컨테이너 (Express가 API + Expo 웹 빌드 서빙)
# 어떤 컨테이너 호스트(Fly.io, Railway, Cloud Run, VPS 등)에도 배포 가능
FROM node:20-slim AS build
WORKDIR /app
COPY . .
# 1) Expo 웹 빌드 → app/dist
RUN cd app && npm install && npx expo export --platform web
# 2) 서버 의존성 + Prisma 클라이언트
RUN cd server && npm install && npx prisma generate

ENV NODE_ENV=production
ENV WEB_DIR=/app/app/dist
ENV PORT=4000
EXPOSE 4000

# 서버가 부팅 시 스키마 push + 시드를 자동 수행
CMD ["npm", "--prefix", "server", "run", "start"]
