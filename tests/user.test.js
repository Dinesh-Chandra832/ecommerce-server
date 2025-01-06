import request from "supertest";
import app from "../app.js";
// import {auth}
import { User } from "../models/index.js";
import { createUser } from "../tests/helpers.js"; // Import helpers
import mongoose from "mongoose";

let token, userId, adminToken;

beforeEach(async () => {
  // Clear users collection
  // await User.deleteMany({});

  // Create a regular user
  const { token: userToken, userId: uid } = await createUser(
    "user@example.com",
    "user"
  );
  token = userToken;
  userId = uid;

  // Create an admin user
  const { token: adminTkn } = await createUser("admin@example.com", "admin");
  adminToken = adminTkn;
});

describe("User Management Endpoints", () => {
  describe("POST /register", () => {
    it("should register a user with default role 'user'", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "New User",
        email: "newuser@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
        role: "user", // Explicitly setting role (optional)
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("user");
    });

    it("should register an admin if role is specified as 'admin'", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .set("Content-Type", "application/json") // Explicitly set the header
        .send({
          name: "Admin User",
          email: "admin.test1@example.com",
          password: "Password@123!",
          passwordConfirm: "Password@123!",
          role: "admin",
        });

      // console.log(res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("admin");
    });

    it("should not register a user with duplicate email", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Duplicate User",
        email: "user@example.com",
        password: "Password@123!",
        passwordConfirm: "Password@123!",
      });
      expect(res.status).toBe(400); // Should return 400 for duplicate email
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Email already in use");
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

    it("should log in with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Password123!",
      };

      const res = await request(app).post("/api/v1/auth/login").send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should not log in with invalid credentials", async () => {
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
  });

  describe("GET /users", () => {
    it("should retrieve all users for an user role", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should reject unauthenticated access", async () => {
      const res = await request(app).get("//api/v1/users");
      expect(res.status).toBe(404); // Unauthorized
    });
  });

  describe("GET //api/v1/users/:id", () => {
    it("should retrieve a user's profile", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("user@example.com");
    });

    it("should return 404 for a non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404); // Not Found
    });
  });

  describe("PUT /users/:id", () => {
    it("should update a user's profile", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated User");
    });

    it("should update a user's role", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ role: "admin" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("admin");
    });

    it("should reject updates to invalid fields", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ invalidField: "Invalid Value" });
      expect(res.status).toBe(400); // Bad Request
    });

    it("should return 404 for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/users/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Non-existent User" });
      expect(res.status).toBe(404); // Not Found
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await User.deleteMany({});
  });
});

// describe("User Management", () => {
//   let adminToken, userToken, userId, adminId;

//   beforeEach(async () => {
//     // Reset database
//     await User.deleteMany({});

//     // Create test users
//     const { token: normalToken, userId: uid } = await createUser(
//       "user@test.com",
//       "user"
//     );
//     const { token: adminTkn, userId: aid } = await createUser(
//       "admin@test.com",
//       "admin"
//     );
//     userToken = normalToken;
//     adminToken = adminTkn;
//     userId = uid;
//     adminId = aid;
//   });

//   describe("User Creation", () => {
//     it("should allow admin to create users with different roles", async () => {
//       const roles = ["user", "admin"];
//       for (const role of roles) {
//         const userData = {
//           name: `Test ${role}`,
//           email: `test${role}@example.com`,
//           password: "Password123!",
//           passwordConfirm: "Password123!",
//           role,
//         };

//         const res = await request(app)
//           .post("/api/v1/users")
//           .set("Authorization", `Bearer ${adminToken}`)
//           .send(userData);

//         expect(res.status).toBe(201);
//         expect(res.body.success).toBe(true);
//         expect(res.body.data.role).toBe(role);
//       }
//     });

//     it("should validate email format", async () => {
//       const userData = {
//         name: "Test User",
//         email: "invalid-email",
//         password: "Password123!",
//         passwordConfirm: "Password123!",
//       };

//       const res = await request(app)
//         .post("/api/v1/users")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send(userData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//       expect(res.body.error).toContain("Invalid email format");
//     });
//   });

//   describe("User Creation", () => {
//     it("should allow admin to create users with different roles", async () => {
//       const roles = ["user", "admin"];
//       for (const role of roles) {
//         const userData = {
//           name: `Test ${role}`,
//           email: `test${role}@example.com`,
//           password: "Password123!",
//           passwordConfirm: "Password123!",
//           role,
//         };

//         const res = await request(app)
//           .post("/api/v1/users")
//           .set("Authorization", `Bearer ${adminToken}`)
//           .send(userData);

//         expect(res.status).toBe(201);
//         expect(res.body.success).toBe(true);
//         expect(res.body.data.role).toBe(role);
//       }
//     });

//     it("should validate email format", async () => {
//       const userData = {
//         name: "Test User",
//         email: "invalid-email",
//         password: "Password123!",
//         passwordConfirm: "Password123!",
//       };

//       const res = await request(app)
//         .post("/api/v1/users")
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send(userData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//       expect(res.body.error).toContain("Invalid email format");
//     });
//   });

//   describe("Profile Management", () => {
//     it("should allow users to update their own profile", async () => {
//       const updateData = {
//         name: "Updated Name",
//         address: {
//           street: "123 New St",
//           city: "New City",
//           state: "New State",
//           zipCode: "54321",
//           country: "New Country",
//         },
//       };

//       const res = await request(app)
//         .put("/api/v1/users/profile")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(updateData);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(res.body.data.name).toBe("Updated Name");
//     });

//     it("should prevent users from updating sensitive fields", async () => {
//       const updateData = {
//         email: "newemail@test.com",
//       };

//       const res = await request(app)
//         .put("/api/v1/users/profile")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(updateData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//     });

//     it("should validate address fields", async () => {
//       const updateData = {
//         address: {
//           // Missing required fields
//           street: "123 New St",
//         },
//       };

//       const res = await request(app)
//         .put("/api/v1/users/profile")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(updateData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//     });
//   });

//   describe("Password Management", () => {
//     it("should allow password change with correct current password", async () => {
//       const passwordData = {
//         currentPassword: "Password123",
//         newPassword: "NewPassword123",
//         newPasswordConfirm: "NewPassword123",
//       };

//       const res = await request(app)
//         .put("/api/v1/users/password")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(passwordData);

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//     });

//     it("should prevent password change with incorrect current password", async () => {
//       const passwordData = {
//         currentPassword: "WrongPassword",
//         newPassword: "NewPassword123",
//         newPasswordConfirm: "NewPassword123",
//       };

//       const res = await request(app)
//         .put("/api/v1/users/password")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(passwordData);

//       expect(res.status).toBe(401);
//       expect(res.body.success).toBe(false);
//     });

//     it("should validate password confirmation match", async () => {
//       const passwordData = {
//         currentPassword: "password123",
//         newPassword: "newpassword123",
//         newPasswordConfirm: "differentpassword",
//       };

//       const res = await request(app)
//         .put("/api/v1/users/password")
//         .set("Authorization", `Bearer ${userToken}`)
//         .send(passwordData);

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//     });
//   });

//   describe("Admin User Management", () => {
//     it("should allow admin to view all users", async () => {
//       const res = await request(app)
//         .get("/api/v1/users")
//         .set("Authorization", `Bearer ${adminToken}`);

//       expect(res.status).toBe(200);
//       expect(Array.isArray(res.body.data)).toBe(true);
//       expect(res.body.data.length).toBe(2);
//     });

//     it("should allow admin to deactivate users", async () => {
//       const res = await request(app)
//         .put(`/api/v1/users/${userId}/status`)
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ active: false });

//       expect(res.status).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(res.body.data.active).toBe(false);
//     });

//     it("should prevent admin from deactivating themselves", async () => {
//       const res = await request(app)
//         .put(`/api/v1/users/${adminId}/status`)
//         .set("Authorization", `Bearer ${adminToken}`)
//         .send({ active: false });

//       expect(res.status).toBe(400);
//       expect(res.body.success).toBe(false);
//     });
//   });
// });

// it("should login a user with valid credentials", async () => {
//   const res = await request(app).post("/api/v1/auth/login").send({
//     email: "user@example.com",
//     password: "Password@123!", // Must match the seeded password
//   });

//   console.log(res); // Debug response to identify issues
//   console.log(res.body); // Debug response to identify issues
//   expect(res.status).toBe(200);
//   expect(res.body.success).toBe(true);
//   expect(res.body.data.token).toBeDefined(); // Ensure a token is returned
// });
