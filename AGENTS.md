# AGENTS.md

This file provides guidance to coding agents (Claude Code, etc.) when working with code in this repository.

## Project Overview

**프론트엔드 전용 저장소입니다.** Turborepo + pnpm workspaces 기반 모노레포로, Next.js 앱 2개와 공유 패키지들로 구성됩니다.

백엔드(NestJS · Prisma · MySQL · Redis · Socket.IO)는 별도 저장소로 분리되어 있습니다: <https://github.com/kisn3089/ssurak-backend>
이 저장소는 백엔드와 **REST + Socket.IO로만** 통신하며, DB나 Prisma에 직접 접근하지 않습니다.

**Apps:**

- `@ssurak/order` - 고객용 주문 앱, Next.js 16 (port 3000)
- `@ssurak/console` - 매장 관리자용 콘솔 앱, Next.js 16 (port 3001)

**Shared Packages:**

- `@ssurak/api` - 도메인 타입, axios HTTP 클라이언트, React Query 훅, Zod 스키마
- `@ssurak/auth` - JWT 토큰 타입/유틸(jwt-decode), 인증 Provider
- `@ssurak/ui` - Radix UI 기반 컴포넌트 라이브러리 (Tailwind CSS v4)
- `@ssurak/lintconfig` - ESLint 9 FlatConfig
- `@ssurak/tsconfig` - 공유 TypeScript 설정 (base, nextjs, react-library)

**Package Dependencies:**

```text
order   → @ssurak/api, @ssurak/ui
console → @ssurak/api, @ssurak/auth, @ssurak/ui
@ssurak/api → @ssurak/auth
```

`@ssurak/api` → `@ssurak/auth` 방향은 단방향입니다. `auth`가 `api`를 참조하면 순환이 생기므로, 두 패키지가 공유하는 타입(예: `TokenPayload`)은 리프인 `auth`에 둡니다.

## Commands

**항상 `pnpm`을 사용합니다** (pnpm 9.0.0+, Node.js >= 22)

```bash
# Development
pnpm dev                           # 두 앱 모두 (turbo)
pnpm dev:order                     # 고객 앱 (3000)
pnpm dev:console                   # 콘솔 앱 (3001)

# Build & Quality
pnpm build                         # 전체 빌드 (turbo)
pnpm build:order
pnpm build:console
pnpm lint                          # 전체 lint (--max-warnings 0)
pnpm format                        # Prettier write (**/*.{ts,tsx,md})
pnpm format:check

# 특정 패키지만
pnpm build --filter=@ssurak/order
pnpm lint --filter=@ssurak/ui
```

앱을 실행하려면 **백엔드가 떠 있어야 합니다.** 백엔드 저장소에서 API 서버(8080)와 MySQL/Redis를 먼저 띄우세요.

> ⚠️ **`pnpm check-types`는 현재 `@ssurak/ui`에서만 동작합니다.** 다른 패키지에는 `check-types` 스크립트가 없어서 `turbo run check-types`가 사실상 아무것도 검증하지 않습니다. 타입 검증이 필요하면 해당 패키지에서 `npx tsc --noEmit`을 직접 실행하세요.

## Architecture

### 도메인 타입 (SSOT)

백엔드 분리 이전에는 `@ssurak/db`(Prisma)에서 타입을 가져왔지만, 이제 **`packages/api/src/types/`에 직접 선언합니다.**
엔티티별로 폴더를 두고 `<entity>.interface.ts`를 만듭니다.

```text
packages/api/src/types/
├── admin/admin.interface.ts
├── board/board.interface.ts
├── cart/cart.interface.ts
├── category/category.interface.ts
├── menu/menu.interface.ts, menuOptions.interface.ts
├── order/order.interface.ts
├── orderItem/orderItem.interface.ts
├── owner/owner.interface.ts
├── realtime/syncNotice.interface.ts
├── store/store.interface.ts
├── table/table.interface.ts
└── tableSession/tableSession.interface.ts
```

타입을 추가·수정할 때 지켜야 할 규칙:

1. **DB 스키마가 아니라 실제 API 응답을 기준으로 선언합니다.** 서버 내부용 `id`는 어떤 경우에도 클라이언트로 내려오지 않으므로 선언하지 않습니다. 식별자는 `publicId`(cuid2)입니다.
2. **날짜는 `string`입니다** (`Date` 아님). JSON 직렬화를 거치므로 ISO 문자열로 도착합니다.
3. **nullable 필드는 `string | null`로 선언합니다** (`?` 옵셔널 아님). JSON wire format과 일치시키기 위함입니다.
4. **엔티티 이름을 그대로 씁니다** (`Menu`, `Table`, `Order`). `XResponse` 접미사는 복합 응답에만 씁니다 (`OrderWithItemsResponse`, `StoreContextResponse`, `CategoryWithMenusResponse`, `BoardTableWithSessionResponse` 등).
5. **파생 응답은 유틸리티 타입으로 만듭니다** (`Omit`, `Pick`, 교차 타입). 필드를 복붙하지 않습니다.

**Enum은 const object 패턴으로 선언합니다** — 런타임 값으로도 쓰이기 때문입니다:

```typescript
export const OrderStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

`OrderStatus`(PENDING → ACCEPTED → PREPARING → COMPLETED, CANCELLED), `TableSessionStatus`(WAITING_ORDER → ACTIVE → PAYMENT_PENDING → CLOSED), `AdminRole`(SUPER, SUPPORT, VIEWER)이 여기에 해당합니다.

### 모듈 시스템 — 배럴 없음

**`index.ts` 배럴 파일을 만들지 않습니다.** 각 패키지는 `package.json`의 `exports` 서브패스 맵으로 `./src/**`를 직접 노출하고, 소비자는 심볼이 정의된 모듈을 그대로 import합니다.

```typescript
// ✅ Good — 정의된 모듈을 직접 가리킴
import { OrderStatus } from "@ssurak/api/types/order/order.interface";
import { httpOrder } from "@ssurak/api/core/order/order/httpOrder";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { useAuthInfo } from "@ssurak/auth/providers/AuthenticationProvider";

// ❌ Bad — 배럴 경유 (더 이상 존재하지 않음)
import { OrderStatus, httpOrder } from "@ssurak/api";
```

새 모듈을 추가할 때 `exports` 맵을 건드릴 필요는 없습니다. 이미 디렉터리 단위 와일드카드(`"./types/*": "./src/types/*.ts"` 등)로 열려 있습니다.

### HTTP 레이어 (`packages/api/src/core/`)

http 함수는 **기본적으로 응답 body를 벗겨서 도메인 타입을 반환합니다.**

```typescript
async function fetchList({ storeId }: FetchTableListParams): Promise<Table[]> {
  const response = await http.get<Table[]>(prefix(storeId));
  return response.data;
}
```

이 함수들은 React Query의 `queryFn`/`mutationFn`으로 바로 들어가고, 반환값이 그대로 캐시에 저장됩니다. 두 앱 모두 서버 prefetch + `dehydrate()`/`HydrationBoundary`를 쓰는데, `AxiosResponse`는 `config`(어댑터·transform 함수)와 `request`를 품고 있어 직렬화가 불가능하고 `config.headers`에 `Authorization`까지 들어 있습니다. **캐시에 봉투를 넣지 마세요.**

`AxiosResponse<T>`를 반환하는 건 **호출부가 응답 메타데이터(주로 `Set-Cookie` 헤더)를 필요로 할 때뿐입니다.** 현재 `httpAuth.createAccessToken`, `httpAuth.refreshAccessToken`, `httpSession.createSession` 세 개만 해당하며, Next의 미들웨어/서버 액션이 httpOnly 쿠키를 옮겨 심기 위해 `res.headers["set-cookie"]`를 읽습니다.

### Frontend Apps

- Next.js 16 (App Router), React 19, React Compiler 활성화 (`reactCompiler: true`)
- ESM (`"type": "module"`), Tailwind CSS v4 + PostCSS
- 두 앱 모두 `transpilePackages: ["@ssurak/ui", "@ssurak/api", "@ssurak/auth"]`
- 상태: `@tanstack/react-query` v5, 폼: React Hook Form + Zod, HTTP: axios
- `console`은 데이터 테이블에 `@tanstack/react-table` v8 사용
- 실시간: `socket.io-client` — 콘솔은 매장 룸(`store:{id}:admins`), 주문 앱은 테이블 룸(`store:{id}:table:{id}`) 구독
- 경로 별칭: `@/*` → `./src/*`

### 인증

- 관리자: JWT access/refresh, HTTP-only 쿠키
- 고객: 세션 토큰 (QR 스캔으로 발급)
- 미들웨어(`apps/console/src/middleware.ts`)가 access 토큰 만료를 감지해 refresh하고, 응답의 `Set-Cookie`를 Next 쿠키 스토어로 옮깁니다.

## TypeScript Standards

**타입 에러를 해결하려고 타입 단언(`as`)을 쓰지 마세요.** 제네릭 기본값, 교차 타입, 타입 좁히기 등 올바른 타입 설계로 해결합니다.

```typescript
// ❌ Bad
const data = response.data as Menu[];

// ✅ Good — 제네릭으로 응답 타입을 명시
const response = await http.get<Menu[]>(`${prefix}/menus`);
return response.data;
```

- strict mode, no implicit any
- 직관적이지 않은 축약어를 타입·함수·변수 이름에 쓰지 않습니다.

## Environment Variables

**앱별 `.env` 파일을 사용합니다** (루트 `.env` 아님). 각 앱의 `.env.example`을 복사해서 시작하세요.

| Variable                          | 사용처         | 설명                                                      |
| --------------------------------- | -------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_SSURAK_URL`      | order, console | 백엔드 API URL (브라우저 클라이언트용)                    |
| `NEXT_PUBLIC_SSURAK_INTERNAL_URL` | order, console | 백엔드 API URL (서버 컴포넌트/라우트 핸들러용)            |
| `NEXT_PUBLIC_IMAGE_HOSTNAME`      | order, console | 메뉴 이미지 CDN 호스트명 (S3 + CloudFront, dev/prod 분리) |
| `NEXT_PUBLIC_ORDER_APP_URL`       | console        | 고객 앱 URL (테이블 QR 코드 생성에 사용)                  |
| `COOKIE_DOMAIN`                   | console        | 인증 쿠키 도메인 (서브도메인 공유, production에서만 적용) |

## Docker

루트에는 docker-compose가 없습니다. 각 앱이 자체 프로덕션 이미지 정의를 가집니다:

- `apps/console/Dockerfile` + `apps/console/docker-compose.yml` + `nginx.conf` (nginx → console:3001, 호스트 81)
- `apps/order/Dockerfile` + `apps/order/docker-compose.prod.yml` + `nginx.conf` (nginx → order:3000, 호스트 80)

빌드 컨텍스트는 모노레포 루트(`context: ../../`)입니다.

DB/Redis/API 컨테이너는 백엔드 저장소의 docker-compose가 담당합니다.

## Git Hooks

**husky** pre-push 훅이 `pnpm build`를 실행합니다. 빌드가 깨지면 push가 막힙니다.

## Troubleshooting

| Issue                   | Solution                                                                    |
| ----------------------- | --------------------------------------------------------------------------- |
| 모듈 해석 에러          | 루트에서 `pnpm install`                                                     |
| `@ssurak/*` import 실패 | 배럴은 없습니다. 서브패스로 직접 import하세요 (`@ssurak/api/types/...`)     |
| API 호출이 전부 실패    | 백엔드가 떠 있는지 확인 (별도 저장소, 8080) 및 `NEXT_PUBLIC_API_SSURAK_URL` |
| 타입 에러가 안 잡힘     | `pnpm check-types`는 `ui`만 검사합니다. 해당 패키지에서 `npx tsc --noEmit`  |
| push 시 빌드 실패       | husky pre-push가 `pnpm build`를 돌립니다. 빌드 에러부터 고치세요            |
