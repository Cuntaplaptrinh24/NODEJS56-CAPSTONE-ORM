// OpenAPI spec. Mo tai http://localhost:8000/api-docs
// servers de [] hoac [/] de khong hard-code domain (tuong thich local + Vercel).
const bearerAuth = [{ bearerAuth: [] }];

const ok = (dataRef) => ({
  content: { "application/json": { schema: dataRef } },
});

const userSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    email: { type: "string", format: "email" },
    fullName: { type: "string", nullable: true },
    age: { type: "integer", nullable: true },
    avatar: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
  },
};

const imageSchema = {
  type: "object",
  properties: {
    id: { type: "integer", example: 1 },
    name: { type: "string" },
    imageUrl: { type: "string" },
    description: { type: "string", nullable: true },
    userId: { type: "integer" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    user: userSchema,
  },
};

const commentSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    content: { type: "string" },
    userId: { type: "integer" },
    imageId: { type: "integer" },
    createdAt: { type: "string", format: "date-time" },
    user: userSchema,
  },
};

const imageIdParam = {
  in: "path",
  name: "imageId",
  required: true,
  schema: { type: "integer" },
  example: 1,
};

const userIdParam = {
  in: "path",
  name: "userId",
  required: true,
  schema: { type: "integer" },
  example: 1,
};

const errorSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "error" },
    statusCode: { type: "integer", example: 400 },
    message: { type: "string" },
  },
};

const jsonBody = (schema) => ({
  required: true,
  content: { "application/json": { schema } },
});

// OpenAPI 3.x: moi HTTP status phai la mot Response Object (khong phai Array).
const errorResponse = (description) => ({
  description,
  ...ok(errorSchema),
});

const successResponse = (description, dataRef) => ({
  description,
  ...ok(dataRef),
});

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Capstone Express ORM - Pinterest API",
    version: "1.0.0",
    description:
      "Backend API: ExpressJS + Prisma + MySQL. Cac route `[protect]` can header `Authorization: Bearer <accessToken>`.",
  },
  // servers tuong doi: Swagger UI tu lay host hien tai (local + Vercel deu dung).
  servers: [{ url: "/", description: "Current origin" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: { User: userSchema, Image: imageSchema, Comment: commentSchema, Error: errorSchema },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Dang ky tai khoan moi",
        requestBody: jsonBody({
          type: "object",
          required: ["email", "password", "fullName"],
          properties: {
            email: { type: "string", format: "email", example: "a@gmail.com" },
            password: { type: "string", example: "123456" },
            fullName: { type: "string", example: "Alice Nguyen" },
            age: { type: "integer", example: 22 },
            avatar: { type: "string", example: "https://..." },
          },
        }),
        responses: {
          201: successResponse("Register thanh cong", { type: "object", properties: { status: { type: "string" }, statusCode: { type: "integer" }, message: { type: "string" }, data: { type: "object" } } }),
          400: errorResponse("Thieu truong bat buoc"),
          409: errorResponse("Email da ton tai"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Dang nhap, tra accessToken",
        requestBody: jsonBody({
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        }),
        responses: {
          200: successResponse("Login thanh cong", { type: "object" }),
          400: errorResponse("Thieu truong bat buoc"),
          401: errorResponse("Email hoac mat khau sai"),
        },
      },
    },
    "/api/images": {
      get: {
        tags: ["Images"],
        summary: "Danh sach hinh anh",
        responses: {
          200: successResponse("OK", { type: "array", items: { $ref: "#/components/schemas/Image" } }),
        },
      },
    },
    "/api/images/search": {
      get: {
        tags: ["Images"],
        summary: "Tim hinh anh theo ten",
        parameters: [{ in: "query", name: "name", schema: { type: "string" }, example: "Sunset" }],
        responses: {
          200: successResponse("OK", { type: "array", items: { $ref: "#/components/schemas/Image" } }),
        },
      },
    },
    "/api/images/{imageId}": {
      get: {
        tags: ["Images"],
        summary: "Chi tiet hinh anh + nguoi tao",
        parameters: [imageIdParam],
        responses: {
          200: successResponse("OK", imageSchema),
          400: errorResponse("imageId khong hop le"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
      delete: {
        tags: ["Images"],
        summary: "Xoa hinh anh (chi owner)",
        security: bearerAuth,
        parameters: [imageIdParam],
        responses: {
          200: successResponse("Xoa thanh cong", { type: "object" }),
          400: errorResponse("imageId khong hop le"),
          401: errorResponse("Thieu hoac sai token"),
          403: errorResponse("Khong phai chu so huu"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
    },
    "/api/images/{imageId}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Binh luan cua mot hinh anh",
        parameters: [imageIdParam],
        responses: {
          200: successResponse("OK", { type: "array", items: { $ref: "#/components/schemas/Comment" } }),
          400: errorResponse("imageId khong hop le"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Tao binh luan (userId lay tu JWT)",
        security: bearerAuth,
        parameters: [imageIdParam],
        requestBody: jsonBody({
          type: "object",
          required: ["content"],
          properties: { content: { type: "string", example: "Anh dep qua!" } },
        }),
        responses: {
          201: successResponse("Tao thanh cong", commentSchema),
          400: errorResponse("imageId khong hop le hoac content rong"),
          401: errorResponse("Thieu hoac sai token"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
    },
    "/api/images/{imageId}/saved": {
      get: {
        tags: ["Saved"],
        summary: "Da luu hinh anh hay chua",
        security: bearerAuth,
        parameters: [imageIdParam],
        responses: {
          200: successResponse("OK", { type: "object", properties: { saved: { type: "boolean" } } }),
          400: errorResponse("imageId khong hop le"),
          401: errorResponse("Thieu hoac sai token"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
    },
    "/api/images/{imageId}/save": {
      post: {
        tags: ["Saved"],
        summary: "Luu hinh anh (idempotent)",
        security: bearerAuth,
        parameters: [imageIdParam],
        responses: {
          201: successResponse("Luu thanh cong", { type: "object" }),
          400: errorResponse("imageId khong hop le"),
          401: errorResponse("Thieu hoac sai token"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
      delete: {
        tags: ["Saved"],
        summary: "Bo luu hinh anh",
        security: bearerAuth,
        parameters: [imageIdParam],
        responses: {
          200: successResponse("Bo luu thanh cong", { type: "object" }),
          400: errorResponse("imageId khong hop le"),
          401: errorResponse("Thieu hoac sai token"),
          404: errorResponse("Khong tim thay hinh anh"),
        },
      },
    },
    "/api/users/{userId}": {
      get: {
        tags: ["Users"],
        summary: "Thong tin user (khong co password)",
        parameters: [userIdParam],
        responses: {
          200: successResponse("OK", userSchema),
          400: errorResponse("userId khong hop le"),
          404: errorResponse("Khong tim thay user"),
        },
      },
    },
    "/api/users/{userId}/saved-images": {
      get: {
        tags: ["Users"],
        summary: "Hinh anh user da luu",
        parameters: [userIdParam],
        responses: {
          200: successResponse("OK", { type: "array", items: { $ref: "#/components/schemas/Image" } }),
          400: errorResponse("userId khong hop le"),
          404: errorResponse("Khong tim thay user"),
        },
      },
    },
    "/api/users/{userId}/created-images": {
      get: {
        tags: ["Users"],
        summary: "Hinh anh user da tao",
        parameters: [userIdParam],
        responses: {
          200: successResponse("OK", { type: "array", items: { $ref: "#/components/schemas/Image" } }),
          400: errorResponse("userId khong hop le"),
          404: errorResponse("Khong tim thay user"),
        },
      },
    },
  },
};
