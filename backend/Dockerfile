# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# [필수] Prisma 실행을 위한 OpenSSL 설치
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# [필수] 실행 환경에서도 OpenSSL 필요
RUN apk add --no-cache openssl

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema for migrations
COPY prisma ./prisma/

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables will be provided at runtime via docker run -e or docker-compose
# No .env file is copied into the image

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# [수정된 실행 명령어]
# 1. ls -R dist: 디버깅을 위해 빌드된 파일 목록을 로그에 출력
# 2. prisma db push: 초기 개발 단계이므로 마이그레이션 파일 없이 DB 스키마 동기화
# 3. (node dist/main || node dist/src/main): 파일 위치가 바뀌었을 경우를 대비해 두 경로 모두 시도
CMD ["sh", "-c", "ls -R dist && npx prisma db push && (node dist/main || node dist/src/main)"]