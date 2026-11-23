# p-14175-2 스프링부트 REST API + Next.js 게시판

- 수업: https://www.slog.gg/p/14175
- 참고 코드: [jhs512/p-14175-2](https://github.com/jhs512/p-14175-2)
- 백엔드: [jhs512/p-14172-2](https://github.com/jhs512/p-14172-2)의 `068` 태그 (Spring Boot, `http://localhost:8080`)
- 프론트엔드: Next.js 16 (App Router), TypeScript, Tailwind CSS (`http://localhost:3000`)

## 실행 방법

### 백엔드 (터미널 1)

```powershell
git clone https://github.com/jhs512/p-14172-2.git p-14172-2-backend
cd p-14172-2-backend
git checkout 068
./gradlew bootRun
```

- 068 백엔드에는 `localhost:3000`에서 오는 요청을 허용하는 CORS 설정(`WebMvcConfig`)이 이미 들어 있습니다.

### 프론트엔드 (터미널 2)

```powershell
pnpm install
pnpm dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 사용하는 백엔드 API

| 기능 | 메서드 | 주소 |
|---|---|---|
| 글 다건조회 | `GET` | `/api/v1/posts` |
| 글 단건조회 | `GET` | `/api/v1/posts/{id}` |
| 글 삭제 | `DELETE` | `/api/v1/posts/{id}` |
| 글 작성 | `POST` | `/api/v1/posts` |
| 글 수정 | `PUT` | `/api/v1/posts/{id}` |
| 댓글 다건조회 | `GET` | `/api/v1/posts/{postId}/comments` |
| 댓글 삭제 | `DELETE` | `/api/v1/posts/{postId}/comments/{id}` |
| 댓글 작성 | `POST` | `/api/v1/posts/{postId}/comments` |

## 진행 방식

기능 하나를 여러 커밋으로 나눠서 구현합니다. 커밋마다 바뀐 파일과 핵심 개념을 아래에 정리합니다.

1. 홈
2. 글 다건조회
3. 글 단건조회
4. 글 삭제
5. 글 작성
6. 글 수정
7. 댓글 다건조회
8. 댓글 삭제
9. 댓글 작성

---

## 0. 프로젝트 생성

### 커밋 0-1: create-next-app으로 프로젝트 생성

```powershell
pnpm create next-app@16.4.6 p-14175-2 --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --react-compiler
```

| 옵션 | 의미 |
|---|---|
| `--ts` | TypeScript 사용 |
| `--tailwind` | 클래스 이름만으로 스타일을 주는 Tailwind CSS 사용 |
| `--eslint` | 코드 규칙 검사 도구 ESLint 사용 |
| `--app` | App Router 사용: `src/app` 폴더 구조가 곧 주소가 됨 |
| `--src-dir` | 소스 코드를 `src/` 아래에 둠 |
| `--import-alias "@/*"` | `@/lib/...`처럼 `src/` 기준으로 import 가능 |

**주요 파일**

| 파일 | 역할 |
|---|---|
| `src/app/layout.tsx` | 모든 페이지를 감싸는 공통 틀(`<html>`, `<body>`) |
| `src/app/page.tsx` | `/` 주소의 페이지 |
| `src/app/globals.css` | 전체 CSS. Tailwind를 불러옴 |
| `package.json` | 사용하는 라이브러리와 실행 명령(`pnpm dev` 등) |

### 커밋 0-2: README 작성

과제 개요, 실행 방법, 사용할 백엔드 API 목록을 정리했습니다.
