import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description: "API documentation for the E-Commerce platform",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "1234567890abcdef12345678" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-12-25T10:00:00Z",
            },
          },
        },
        Product: {
          type: "object",
          required: ["name", "price", "category", "stock"],
          properties: {
            _id: {
              type: "string",
              description: "The product's unique identifier",
              example: "5fdd0b63bcbf3b7b87a7a6a7",
            },
            name: {
              type: "string",
              description: "Name of the product",
              example: "Laptop",
            },
            description: {
              type: "string",
              description: "Description of the product",
              example: "High-end laptop with 16GB RAM and 512GB SSD.",
            },
            price: {
              type: "number",
              description: "Price of the product",
              example: 1299.99,
            },
            category: {
              type: "string",
              description: "Category of the product",
              example: "electronics",
            },
            stock: {
              type: "integer",
              description: "Available stock quantity",
              example: 100,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the product was created",
              example: "2024-12-25T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the product was last updated",
              example: "2024-12-26T10:00:00Z",
            },
          },
        },
        Order: {
          type: "object",
          required: ["items", "totalPrice", "user"],
          properties: {
            _id: {
              type: "string",
              description: "Unique identifier for the order",
              example: "60c72b2f5f1b2c001f0e4a9e",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: {
                    type: "string",
                    example: "5fdd0b63bcbf3b7b87a7a6a7",
                  },
                  quantity: { type: "integer", example: 2 },
                },
              },
            },
            totalPrice: {
              type: "number",
              description: "Total price of the order",
              example: 2599.98,
            },
            user: {
              type: "string",
              description: "ID of the user who placed the order",
              example: "1234567890abcdef12345678",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Order creation timestamp",
              example: "2024-12-25T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Order update timestamp",
              example: "2024-12-26T10:00:00Z",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Ensure this path matches your project structure
};

export default swaggerJsdoc(options);

// import swaggerJsdoc from "swagger-jsdoc";

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "E-Commerce API Documentation",
//       version: "1.0.0",
//       description: "API documentation for the E-Commerce platform",
//     },
//     servers: [
//       {
//         url: process.env.API_URL || "http://localhost:5001",
//         description: "Development server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//       schemas: {
//         User: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "1234567890abcdef12345678" },
//             name: { type: "string", example: "John Doe" },
//             email: {
//               type: "string",
//               format: "email",
//               example: "john@example.com",
//             },
//             role: { type: "string", enum: ["user", "admin"], example: "user" },
//             createdAt: {
//               type: "string",
//               format: "date-time",
//               example: "2024-12-25T10:00:00Z",
//             },
//           },
//         },
//       },
//     },
//   },
//   apis: ["./routes/*.js"], // Ensure this path matches your project structure
// };

// export default swaggerJsdoc(options);

// import swaggerJsdoc from "swagger-jsdoc";

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "E-Commerce API Documentation",
//       version: "1.0.0",
//       description: "API documentation for the E-Commerce platform",
//     },
//     servers: [
//       {
//         url: process.env.API_URL || "http://localhost:5001",
//         description: "Development server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//       schemas: {
//         User: {
//           type: "object",
//           properties: {
//             id: { type: "string", example: "1234567890abcdef12345678" },
//             name: { type: "string", example: "John Doe" },
//             email: {
//               type: "string",
//               format: "email",
//               example: "john@example.com",
//             },
//             role: { type: "string", enum: ["user", "admin"], example: "user" },
//             createdAt: {
//               type: "string",
//               format: "date-time",
//               example: "2024-12-25T10:00:00Z",
//             },
//           },
//         },
//       },
//     },
//   },
//   apis: ["./routes/*.js"], // Ensure this path matches your project structure
// };

// export default swaggerJsdoc(options);
