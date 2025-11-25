# GISTree Backend

GIST 연말 쪽지 서비스의 NestJS 백엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API Documentation**: Swagger
- **Authentication**: JWT (+ IDP 연동 예정)

## 프로젝트 구조

```
src/
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts           # 루트 모듈
├── prisma/                 # Prisma 서비스
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                   # 인증 모듈 
├── users/                  # 사용자 모듈 
├── messages/               # 쪽지 모듈
├── ornaments/              # 오너먼트 모듈
├── trees/                  # 트리 모듈
├── mailbox/                # 우편함 모듈
└── notifications/          # 알림 모듈

libs/
└── infoteam-idp/           # GIST IDP 인증 라이브러리
    ├── src/
    │   ├── index.ts
    │   ├── infoteam-idp.module.ts
    │   ├── infoteam-idp.service.ts
    │   └── types/
    │       ├── idp.type.ts
    │       └── userInfo.type.ts
    └── README.md
```


## 시작하기

### 사전 요구사항

- Node.js 18+ (권장: Node.js 20+)
- PostgreSQL 데이터베이스
- npm

### 설치

1. **의존성 설치**
```bash
npm install
```

2. **환경 변수 설정**

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정합니다:

```bash
cp .env.example .env
```

주요 환경 변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `PORT`: 서버 포트 (기본값: 3000)

3. **데이터베이스 설정**

#### Option 1: Docker 사용 (권장)
```bash
# 프로젝트 루트 디렉토리에서
cd ..
docker compose up -d
cd backend
```

#### Option 2: 로컬 PostgreSQL 사용
로컬에 PostgreSQL을 설치하고 `.env` 파일의 `DATABASE_URL`을 수정합니다:
```
DATABASE_URL="postgresql://username:password@localhost:5432/gistree_db?schema=public"
```

4. **Prisma 마이그레이션 실행**
```bash
npx prisma migrate dev --name init
```

5. **개발 서버 실행**
```bash
npm run start:dev
```

서버가 시작되면:
- API 서버: http://localhost:3000
- Swagger 문서: http://localhost:3000/api

## 주요 명령어

### 개발
```bash
npm run start:dev          # 개발 모드로 실행 (hot reload)
npm run start              # 일반 실행
npm run start:prod         # 프로덕션 모드 실행
```

### 빌드
```bash
npm run build              # 프로덕션 빌드
```

### 테스트
```bash
npm run test               # 단위 테스트
npm run test:e2e           # E2E 테스트
npm run test:cov           # 테스트 커버리지
```

### Prisma
```bash
npx prisma generate        # Prisma Client 생성
npx prisma migrate dev     # 마이그레이션 생성 및 적용
npx prisma migrate deploy  # 프로덕션 마이그레이션 적용
npx prisma studio          # Prisma Studio 실행 (데이터베이스 GUI)
npx prisma db seed         # 시드 데이터 삽입
```

## 데이터베이스 스키마

주요 모델:
- `User`: 사용자 정보
- `Message`: 쪽지
- `Ornament`: 오너먼트 아이템
- `UserOrnament`: 사용자가 획득한 오너먼트
- `UserTree`: 사용자 트리 꾸미기 데이터
- `MailboxSettings`: 우편함 설정
- `Notification`: 알림

자세한 스키마는 `prisma/schema.prisma` 파일을 참조하세요.

## API 문서

서버를 실행한 후 http://localhost:3000/api 에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

## Docker

### Docker로 빌드 및 실행
```bash
# 이미지 빌드
docker build -t gistree-backend .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env gistree-backend
```

### Docker Compose 사용 (데이터베이스 포함)
```bash
# 프로젝트 루트에서
docker compose up -d
```

## 개발 가이드

### 새로운 모듈 생성
```bash
nest g module <module-name>
nest g controller <module-name>
nest g service <module-name>
```

### 새로운 Prisma 모델 추가
1. `prisma/schema.prisma` 파일 수정
2. 마이그레이션 생성: `npx prisma migrate dev --name <migration-name>`
3. Prisma Client 업데이트: `npx prisma generate`

## 라이센스

MIT License
