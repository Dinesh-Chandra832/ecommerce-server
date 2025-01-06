import request from "supertest";
import app from "../app.js";
import { Product } from "../models/index.js";
import { createUser } from "./helpers.js";

describe("Product Management", () => {
  let authToken, adminToken, userId, productId, adminId;

  beforeEach(async () => {
    // await Product.deleteMany({});
    // Initialize products and users before all tests, so we don’t recreate them for every test case.

    const { token: userToken, userId: uid } = await createUser(
      "user@test.com",
      "user"
    );
    const { token: adminTkn, userId: aid } = await createUser(
      "admin@test.com",
      "admin"
    );
    authToken = userToken;
    adminToken = adminTkn;
    userId = uid;
    adminId = aid;

    // Only create one product, which can be used for multiple tests.
    const product = await Product.create({
      name: "Test Product",
      description: "Test Description",
      price: 99.99,
      category: "electronics",
      stock: 100,
      createdBy: adminId,
    });
    productId = product._id;
  });

  describe("POST /api/v1/products", () => {
    it("should create a single product (admin only)", async () => {
      const productData = {
        products: [
          {
            name: "Smartphone",
            description:
              "A high-quality smartphone with a 6.5-inch display and 128GB storage.",
            price: 499.99,
            stock: 50,
            category: "electronics",
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1); // Check if only one product was created
      expect(res.body.data[0].name).toBe("Smartphone");
    });

    it("should create multiple products (admin only)", async () => {
      const productData = {
        products: [
          {
            name: "Smartphone",
            description:
              "A high-quality smartphone with a 6.5-inch display and 128GB storage.",
            price: 499.99,
            stock: 50,
            category: "electronics",
          },
          {
            name: "T-shirt",
            description: "A comfortable cotton T-shirt in various sizes.",
            price: 19.99,
            stock: 200,
            category: "clothing",
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toBe("Smartphone");
      expect(res.body.data[1].name).toBe("T-shirt");
    });

    it("should not allow regular user to create product", async () => {
      const productData = {
        name: "New Product",
        description: "New Description",
        price: 149.99,
        category: "electronics",
        stock: 50,
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(productData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should validate price is positive", async () => {
      const productData = {
        name: "Test Product",
        description: "Test Description",
        price: -10,
        category: "electronics",
        stock: 100,
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should validate stock is non-negative", async () => {
      const productData = {
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category: "electronics",
        stock: -1,
      };

      const res = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/products", () => {
    it("should filter products by category", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .query({ category: "electronics" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].category).toBe("electronics");
    });

    it("should search products by name", async () => {
      const res = await request(app)
        .get("/api/v1/products")
        .query({ search: "Test" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].name).toContain("Test");
    });
  });

  describe("Product Updates", () => {
    it("should allow admin to update product details with a category", async () => {
      const productData = {
        name: "Original Product",
        description: "Original Description",
        price: 299.99,
        stock: 100,
        category: "electronics", // Ensure category is included
      };

      // Create a product first to get a valid product ID
      const createRes = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ products: [productData] });

      const productId = createRes.body.data[0]._id; // Get the product ID

      // Update the product with new details
      const updateData = {
        name: "Updated Product",
        description: "Updated Description",
        price: 199.99,
        stock: 50,
        category: "clothing", // Ensure category is included
      };

      const updateRes = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      // Validate the response
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.name).toBe("Updated Product");
      expect(updateRes.body.data.price).toBe(199.99);
      expect(updateRes.body.data.stock).toBe(50);
      expect(updateRes.body.data.category).toBe("clothing"); // Check category
    });

    it("should not allow regular user to update product", async () => {
      const updateData = {
        name: "Updated Product",
      };

      const res = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    it("should delete product when admin", async () => {
      const res = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedProduct = await Product.findById(productId);
      expect(deletedProduct).toBeNull();
    });

    it("should not allow regular user to delete product", async () => {
      const res = await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should handle deleting non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`/api/v1/products/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await Product.deleteMany({});
  });
});

// it("should get all products with pagination", async () => {
//   // Create additional test products
//   await Product.create([
//     {
//       name: "Test Product 2",
//       description: "Test Description",
//       price: 149.99,
//       category: "electronics",
//       stock: 50,
//       createdBy: userId,
//     },
//     {
//       name: "Test Product 3",
//       description: "Test Description",
//       price: 199.99,
//       category: "electronics",
//       stock: 75,
//       createdBy: userId,
//     },
//   ]);

//   const res = await request(app)
//     .get("/api/v1/products")
//     .query({ page: 1, limit: 2 });

//   expect(res.status).toBe(200);
//   expect(res.body.success).toBe(true);
//   expect(Array.isArray(res.body.data)).toBe(true);
//   expect(res.body.pagination).toBeDefined();
//   expect(res.body.pagination.total).toBe(3);
//   expect(res.body.pagination.page).toBe(1);
//   expect(res.body.pagination.pages).toBe(2);
// });
