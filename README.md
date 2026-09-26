# CAPSTONE EXPRESS ORM — Pinterest

Backend API theo đề bài: **ExpressJS + Prisma ORM + MySQL**.
Kiến trúc: `Router → Controller → Service → Prisma → Database`.

Token Cybersoft được lưu trong `.env` và đọc bằng `process.env.CYBERSOFT_TOKEN` (gửi kèm header `tokenCybersoft` khi cần), không hard-code trong source, README, seed hay docker-compose.

---

## 1. Công nghệ

- Node.js v24, ExpressJS, JavaScript ES Modules (`"type": "module"`)
- Prisma ORM 6.x, datasource `mysql` (4 model: User, Image, Comment, SavedImage)
- MySQL 8.0
- bcrypt, jsonwebtoken, dotenv, cors, nodemon, swagger-ui-express, execa (chỉ dùng trong script khởi động)

## 2. Cấu trúc project

```
server.js                          # Entry: dotenv, middleware, router, error handler
scripts/
  dev.js                           # Script bootstrap - `npm run dev` tu dong dung moi truong
src/
  common/
    constants/config.js            # Load dotenv, kiểm tra JWT_SECRET, export config
    constants/messages.js          # Hằng số thông điệp lỗi
    constants/swagger.js           # Đặc tả OpenAPI cho Swagger UI
    helpers/response.helper.js     # Chuẩn hoá response { status, statusCode, message, data }
    helpers/jwt.helper.js          # sign / verify access token
    helpers/validate.helper.js     # parseId — trả 400 nếu id không hợp lệ
    helpers/asyncHandler.helper.js # Bọc controller async, chuyển lỗi về error handler
    middlewares/protect.middleware.js        # Bắt buộc Bearer token
    middlewares/errorHandler.middleware.js   # Global error handler
    middlewares/notFound.middleware.js       # 404 cho route không tồn tại
    prisma/prismaClient.js         # Prisma Client dùng chung
  controllers/                     # auth / image / user
  routers/                         # root / auth / image / user
  services/                        # auth / image / comment / savedImage / user
prisma/
  schema.prisma
  seed.js
  migrations/
```

## 3. Database và quan hệ

```prisma
User       { id, email @unique, password, fullName, age, avatar, createdAt, updatedAt }
Image      { id, name, imageUrl, description, userId, createdAt, updatedAt, user, comments, savedBy }
Comment    { id, content, userId, imageId, createdAt, updatedAt, user, image }
SavedImage { id, userId, imageId, createdAt, @@unique([userId, imageId]) }
```

Quan hệ:

- User **1 – N** Image
- User **1 – N** Comment
- Image **1 – N** Comment
- User **N – N** Image thông qua SavedImage (composite unique `userId + imageId` → không lưu trùng một ảnh)

## 4. Biến môi trường

```sh
cp .env.example .env
```

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Chuỗi kết nối MySQL cho Prisma (bản mẫu đã khớp với Docker) |
| `PORT` | Cổng server, mặc định `8000` |
| `JWT_SECRET` | Khóa ký JWT — **bắt buộc**, thiếu sẽ báo lỗi ngay khi khởi động |
| `JWT_EXPIRES_IN` | Hạn token, mặc định `7d` |
| `CYBERSOFT_TOKEN` | Token Cybersoft — trong `.env.example` chỉ là placeholder, giá trị thật chỉ nằm trong `.env` local |

`.env` đã được thêm vào `.gitignore` và không được commit. `CYBERSOFT_TOKEN` không bao giờ hard-code.

Cách dùng token Cybersoft nếu bài cần gọi API Cybersoft:

```js
fetch(url, { headers: { tokenCybersoft: process.env.CYBERSOFT_TOKEN } });
```

## 5. Cách chạy (khuyến nghị — một lệnh duy nhất)

```sh
npm install
npm run dev
```

Lệnh `npm run dev` thực chất chạy `node scripts/dev.js`, tự động làm các bước sau:

1. **Kiểm tra Docker Engine** — nếu Docker Desktop chưa chạy, script báo lỗi rõ ràng:
   `Docker Desktop chưa chạy. Hãy mở Docker Desktop rồi chạy lại npm run dev.`
   và dừng lại, không chạm tới MySQL80 hệ thống.
2. **Khởi động MySQL của project** bằng `docker compose up -d` (idempotent — đã chạy rồi thì không recreate database vô lý). MySQL chạy ở **port 3307** để tránh xung đột.
3. **Chờ MySQL healthy** rồi mới chạy tiếp.
4. **Chạy `npx prisma generate` và `npx prisma migrate deploy`.**
5. **Seed thông minh:** chỉ seed dữ liệu mẫu khi database đang trống. Database đã có dữ liệu (user/ảnh/bình luận bạn tạo lúc test) sẽ được giữ nguyên, không bị reset mỗi lần restart.
6. Cuối cùng chạy `nodemon server.js` (xem log Swagger tại `http://localhost:8000/api-docs`).

Khi container đã chạy sẵn, lần `npm run dev` tiếp theo **rất nhanh** (chỉ kiểm tra/generate/migrate rồi vào nodemon).

Từ lần sau, trong thư mục project **chỉ cần:**

```sh
npm run dev
```

## 6. Cách chạy không dùng Docker

Người dùng cần chuẩn bị trước:

- Cài MySQL 8.x
- Tạo database (ví dụ `pinterest_orm`) và user có quyền tạo/chạy migration
- Sửa `DATABASE_URL` trong `.env` cho khớp môi trường local

Sau đó chạy:

```sh
npx prisma migrate deploy
npm run seed
npm start
```

*Lưu ý: `npm run dev` ở máy không có Docker sẽ dừng lại với thông báo yêu cầu mở Docker Desktop, nên trường hợp này dùng `npm start`.*

## 7. Các lệnh Prisma

```sh
npx prisma generate                  # sinh Prisma Client
npx prisma migrate dev --name <tên>  # dev: tạo và áp dụng migration mới
npx prisma migrate deploy            # máy mới / production: áp dụng migration đã có
npx prisma studio                    # mở Prisma Studio
```

Tương ứng npm scripts:

```sh
npm run generate
npm run migrate:dev -- --name <tên>
npm run migrate:deploy
npm run studio
```

## 8. Seed dữ liệu

```sh
npm run seed
```

Dữ liệu mẫu: **3 users · 10 images · 14 comments · 8 savedImages**.
Mật khẩu trong database được lưu bằng **bcrypt hash**. Script seed chạy lại nhiều lần vẫn an toàn (xoá theo đúng thứ tự khoá ngoại: SavedImage → Comment → Image → User).

## 9. Tài khoản seed để test

| Email | Mật khẩu |
| --- | --- |
| `alice@gmail.com` | `123456` |
| `bob@gmail.com` | `123456` |
| `charlie@gmail.com` | `123456` |

Các trường `fullName`, `age`, `avatar` đều có dữ liệu mẫu.

## 10. Danh sách API

Cú pháp response thành công:

```json
{ "status": "success", "statusCode": 200, "message": "...", "data": ... }
```

Cú pháp response lỗi:

```json
{ "status": "error", "statusCode": 400, "message": "..." }
```

### 10.1. Xác thực (Auth)

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/api/auth/register` | Đăng ký. Email unique, mật khẩu bcrypt hash. Trả về `{ user (không có password), accessToken }`. |
| POST | `/api/auth/login` | Đăng nhập. Trả về `accessToken`. |

Body đăng ký:

```json
{
  "email": "a@gmail.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "age": 22,
  "avatar": "https://..."
}
```

Body đăng nhập:

```json
{ "email": "a@gmail.com", "password": "123456" }
```

### 10.2. Trang chủ

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/api/images` | Danh sách hình ảnh (kèm thông tin người tạo). |
| GET | `/api/images/search?name=...` | Tìm hình ảnh theo tên (so khớp `contains`). |

### 10.3. Chi tiết ảnh, bình luận và lưu ảnh

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/api/images/:imageId` | Chi tiết ảnh kèm người tạo (không trả password). |
| GET | `/api/images/:imageId/comments` | Danh sách bình luận của ảnh (kèm người viết). |
| GET | `/api/images/:imageId/saved` | `[protect]` Trả `{ "saved": true \| false }`. |
| POST | `/api/images/:imageId/comments` | `[protect]` Tạo bình luận. `userId` lấy từ JWT, không nhận từ body. |
| POST | `/api/images/:imageId/save` | `[protect]` Lưu ảnh (idempotent). |
| DELETE | `/api/images/:imageId/save` | `[protect]` Bỏ lưu ảnh. |

### 10.4. Người dùng

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/api/users/:userId` | Thông tin người dùng (không có password). |
| GET | `/api/users/:userId/saved-images` | Danh sách ảnh người dùng đã lưu. |
| GET | `/api/users/:userId/created-images` | Danh sách ảnh người dùng đã tạo. |
| DELETE | `/api/images/:imageId` | `[protect]` Chỉ chủ ảnh được xoá, người khác nhận `403`. |

## 11. Các route cần Bearer token

Gửi kèm header:

```
Authorization: Bearer <accessToken>
```

Các route bắt buộc đăng nhập:

- `GET /api/images/:imageId/saved`
- `POST /api/images/:imageId/comments`
- `POST /api/images/:imageId/save`
- `DELETE /api/images/:imageId/save`
- `DELETE /api/images/:imageId`

## 12. Body mẫu

| API | Body |
| --- | --- |
| Đăng ký | `{ "email", "password", "fullName", "age", "avatar" }` — xem mục 10.1 |
| Đăng nhập | `{ "email", "password" }` — xem mục 10.1 |
| Bình luận | `{ "content": "Ảnh đẹp quá!" }` |

Gửi thêm `userId` trong body bình luận **không có tác dụng** — server luôn lấy `userId` từ JWT (`req.user.id`).

## 13. Cách test nhanh

Sau khi `npm run seed`:

```sh
# Đăng ký
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"x@gmail.com\",\"password\":\"123456\",\"fullName\":\"Nguyễn Văn X\"}"

# Đăng nhập và lấy token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@gmail.com\",\"password\":\"123456\"}"

# Danh sách và tìm kiếm ảnh
curl http://localhost:8000/api/images
curl "http://localhost:8000/api/images/search?name=Sunset"

# Chi tiết ảnh và bình luận
curl http://localhost:8000/api/images/1
curl http://localhost:8000/api/images/1/comments

# Các route cần token
curl http://localhost:8000/api/images/1/saved -H "Authorization: Bearer <token>"
curl -X POST http://localhost:8000/api/images/1/comments \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d "{\"content\":\"Ảnh đẹp quá!\"}"
curl -X POST http://localhost:8000/api/images/1/save -H "Authorization: Bearer <token>"

# Thông tin người dùng
curl http://localhost:8000/api/users/1
```

## 14. Endpoint kiểm tra sức khỏe

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/` | Thông báo server đang chạy |
| GET | `/api/health` | `{ "data": { "status": "ok" } }` |
| GET | `/api-docs` | Giao diện Swagger UI |

## 15. Tài liệu API (Swagger)

Khởi động server rồi truy cập: **http://localhost:8000/api-docs**

Swagger mô tả đầy đủ nhóm `Auth`, `Images`, `Comments`, `Saved`, `Users` kèm nút **Authorize** để dán access token vào các route `[protect]`.

## 16. Các kỹ thuật bảo mật đã áp dụng

- Kiểm tra `imageId` / `userId` bằng `validate.helper.js`: giá trị `abc`, `0`, `-1`, `1.5` trả `400`; tài nguyên không tồn tại trả `404` (không để lỗi Prisma thành `500`)
- Response thống nhất `{ status, statusCode, message, data }`; `statusCode` trong body khớp HTTP status thực tế
- Global error handler chỉ kèm stack trace ở môi trường development, production trả message chung
- Middleware `protect`: thiếu token hoặc token sai/hết hạn → `401`
- Xoá ảnh: chỉ chủ ảnh được xoá, người khác → `403`
- Mật khẩu **không bao giờ** xuất hiện trong response (đăng ký, đăng nhập, lấy user, lấy danh sách ảnh)
- `userId` của bình luận / lưu ảnh luôn lấy từ JWT, không thể giả mạo qua body
- `JWT_SECRET` bắt buộc, không có giá trị fallback mặc định
- Seed idempotent, không phụ thuộc cứng vào giá trị ID cụ thể khi test

## 17. Deploy lên Vercel

Vercel hiện hỗ trợ Express **zero-config**: chỉ cần src/app.js
xport default app — Vercel tự nhận và serve, **không cần**
pi/index.js hay ercel.json.

Phân biệt rõ hai môi trường:

| | Local (development) | Production (Vercel) |
| --- | --- | --- |
| Database | MySQL trong **Docker** trên localhost:3307 | **MySQL cloud** (endpoint online) |
| Entry | server.js (có pp.listen) | src/app.js (xport default app, không listen) |
| Env vars | .env (không commit) | Vercel → Project Settings → Environment Variables |

### Các bước deploy

1. **Tạo MySQL database online** (PlanetScale, Railway, Aiven, Clever Cloud, …).
   Lấy connection string dạng:
   mysql://USER:PASSWORD@HOST:PORT/DATABASE
2. **Import project lên GitHub**, sau đó import vào Vercel.
3. **Thêm Environment Variables** trên Vercel:
   - DATABASE_URL — connection string MySQL cloud
   - JWT_SECRET — giá trị mạnh, sinh riêng
   - JWT_EXPIRES_IN — ví dụ 7d
   - CYBERSOFT_TOKEN — token Cybersoft thật
4. **Deploy** (Vercel sẽ tự chạy prisma generate qua postinstall).
5. **Chạy migration** trên database production (một lần, thủ công):
   `sh
   # với .env trỏ vào production DATABASE_URL
   npm run migrate:deploy
   `
6. **Seed nếu muốn có dữ liệu demo** (tùy chọn, chạy chủ động):
   `sh
   npm run seed
   `
   > Production **không** tự seed và **không** chạy migrate dev khi server khởi động.
7. **Truy cập:**
   - https://<ten-du-an>.vercel.app/api/health
   - https://<ten-du-an>.vercel.app/api-docs

### Lưu ý kỹ thuật

- Vercel zero-config tự detect src/app.js default-export — không cần rewrite
  hay đặt entry trong pi/.
- Prisma client dùng singleton (globalThis), tránh tạo nhiều instance
  trong serverless invocation.
- Swagger dùng servers: [{ url: "/" }] — tự lấy origin hiện tại,
  nên chạy cả local lẫn Vercel, không hard-code domain.
- CORS để mở (cors()), thuận tiện cho demo; có thể giới hạn lại nếu cần.
## 18. Lưu ý khi đóng góp bài nộp

Bài nộp **không được** chứa:

- `.env`
- `node_modules/`
- `.mysql-data/`
- `*.log`
- Token Cybersoft thật hoặc JWT secret thật

Bài nộp **cần có**:

- Toàn bộ source code
- `package.json`, `package-lock.json`
- `.env.example`
- `prisma/schema.prisma`, `prisma/seed.js`, `prisma/migrations`
- `docker-compose.yml`
- `README.md`
