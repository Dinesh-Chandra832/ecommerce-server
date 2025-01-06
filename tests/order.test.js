import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { Order, Product } from "../models/index.js";
import { createUser, createTestProduct, createTestOrder } from "./helpers.js";

describe("Order Management", () => {
  let userToken, userId, productId, product;

  // beforeAll(async () => {
  //   // Creating a product to use in the tests
  //   product = new Product({
  //     _id: mongoose.Types.ObjectId(),
  //     name: "Test Product",
  //     price: 19.99,
  //     category: "Test Category", // Ensure this field is not missing
  //     stock: 10, // Sufficient stock
  //     createdBy: "user_id", // Assuming you use a user ID for creator
  //   });
  //   await product.save();
  // });

  // afterAll(async () => {
  //   await Product.deleteMany(); // Clean up created products
  //   await Order.deleteMany(); // Clean up orders
  //   await mongoose.connection.close();
  // });

  beforeEach(async () => {
    // await Order.deleteMany({});
    // await Product.deleteMany({});

    const { token, userId: uid } = await createUser("user@test.com", "user");
    userToken = token;
    userId = uid;

    // Create a product and pass the userId to set the createdBy field
    const product = await createTestProduct(userId);
    productId = product._id;
  });

  describe("Order Creation", () => {
    it("should create new order", async () => {
      const orderData = {
        items: [
          {
            product: productId, // Use valid product ID from created product
            quantity: 4,
            price: 19.99,
          },
        ],
        totalAmount: 79.96,
        shippingAddress: {
          street: "300 Birch Boulevard",
          city: "Austin",
          state: "Texas",
          zipCode: "73301",
          country: "USA",
        },
        paymentMethod: "debitCard",
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalAmount");
      expect(res.body.data.items).toHaveLength(1);
    });

    it("should not create order with invalid product", async () => {
      const orderData = {
        items: [{ product: "6405c9c83f55d5b3c2c3b001", quantity: 2 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should not place an order with insufficient stock", async () => {
      const orderData = {
        items: [{ product: productId, quantity: 999 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Order Retrieval", () => {
    it("should get all user orders", async () => {
      // Create an order first
      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "abc Test St",
          city: "CityTest",
          state: "StateTest",
          zipCode: "098986",
          country: "CountryTest",
        },
        paymentMethod: "creditCard",
      };

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("View Order History", () => {
    it("should fetch user's order history", async () => {
      // Create an order first
      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Orders retrieved successfully.");
    });

    it("should return an empty array if no orders exist", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("No orders foun");
    });
  });

  describe("View Single Order", () => {
    it("should fetch a single order by ID", async () => {
      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      const createdOrder = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      const res = await request(app)
        .get(`/api/v1/orders/${createdOrder.body.data._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdOrder.body.data._id);
    });

    it("should return 404 for non-existing order", async () => {
      const res = await request(app)
        .get("/api/v1/orders/invalidOrderId")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Cancel Order", () => {
    it("should cancel a pending order", async () => {
      // Create an order first
      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      const createdOrder = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send(orderData);

      const res = await request(app)
        .put(`/api/v1/orders/${createdOrder.body.data._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("cancelled");
    });

    it("should return 404 when canceling a non-pending order", async () => {
      const res = await request(app)
        .put("/api/v1/orders/invalidOrderId/cancel")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 when user is not authorized to cancel another user's order", async () => {
      // Create an order with another user
      const { token: anotherUserToken } = await createUser(
        "anotheruser@test.com",
        "user"
      );

      const orderData = {
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "creditCard",
      };

      const createdOrder = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send(orderData);

      const res = await request(app)
        .put(`/api/v1/orders/${createdOrder.body.data._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
  // Cleanup after all tests
  afterAll(async () => {
    await Product.deleteMany(); // Clean up created products
    await Order.deleteMany(); // Clean up orders
    await mongoose.connection.close();
  });
});
