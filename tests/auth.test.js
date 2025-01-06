import request from "supertest";
import app from "../app.js";
import { User } from "../models/index.js";

describe("Authentication Endpoints", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("User Registration (POST /register)", () => {
    it("should register a new user with valid input", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data.email).toBe(userData.email);
    });

    it("should not register a user with missing required fields", async () => {
      const userData = {
        name: "Test User",
        email: "",
        password: "Password123!",
      };

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Email is required");
    });

    it("should not register a user with a duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      };

      await request(app).post("/api/v1/auth/register").send(userData);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Email already in use"); // Match the exact error message
    });
  });

  describe("User Login (POST /login)", () => {
    beforeEach(async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      };
      await request(app).post("/api/v1/auth/register").send(userData);
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Password123!",
      };

      const res = await request(app).post("/api/v1/auth/login").send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "WrongPassword",
      };

      const res = await request(app).post("/api/v1/auth/login").send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain(
        "The email or password you entered is incorrect"
      );
    });

    it("should not login with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      const res = await request(app).post("/api/v1/auth/login").send(loginData);

      expect(res.status).toBe(401); // Change to 401 if non-existent email should return Unauthorized
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Invalid email or password"); // Adjust error message if needed
    });
  });
  // Cleanup after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
});

// import request from "supertest";
// import app from "../app.js";
// import { User } from "../models/index.js";

// describe("Authentication", () => {
//   beforeEach(async () => {
//     await User.deleteMany({});
//   });

//   describe("Registration", () => {
//     it("should register a new user", async () => {
//       const userData = {
//         name: "Test User",
//         email: "test@example.com",
//         password: "Password123",
//         passwordConfirm: "Password123",
//       };

//       const res = await request(app)
//         .post("/api/v1/auth/register")
//         .send(userData);

//       expect(res.status).toBe(201);
//       expect(res.body.token).toBeDefined();
//     });

//     it("should not register user with existing email", async () => {
//       const userData = {
//         name: "Test User",
//         email: "test@example.com",
//         password: "Password123",
//         passwordConfirm: "Password123",
//       };

//       await request(app).post("/api/v1/auth/register").send(userData);
//       const res = await request(app)
//         .post("/api/v1/auth/register")
//         .send(userData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//     });
//   });

//   describe("Login", () => {
//     beforeEach(async () => {
//       const userData = {
//         name: "Test User",
//         email: "test@example.com",
//         password: "Password123",
//         passwordConfirm: "Password123",
//       };
//       await request(app).post("/api/v1/auth/register").send(userData);
//     });

//     it("should login with valid credentials", async () => {
//       const loginData = {
//         email: "test@example.com",
//         password: "Password123",
//       };

//       const res = await request(app).post("/api/v1/auth/login").send(loginData);

//       expect(res.status).toBe(200);
//       expect(res.body.token).toBeDefined();
//     });

//     it("should not login with invalid password", async () => {
//       const loginData = {
//         email: "test@example.com",
//         password: "wrongpassword",
//       };

//       const res = await request(app).post("/api/v1/auth/login").send(loginData);

//       expect(res.status).toBe(401);
//       expect(res.body.success).toBe(false);
//     });
//   });
// });
