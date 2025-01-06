# 🛒 E-Commerce Backend

## 📌 Project Overview

This project is an E-commerce backend API built using **Node.js**, **Express**, and **MongoDB**. It provides robust functionalities for user authentication, product management, order processing, and more. The API is designed to be **RESTful** and follows best practices for security and performance.

## 📋 Table of Contents

1. [🚀 Technologies Used](#technologies-used)
2. [📦 Setup Instructions](#setup-instructions)
3. [📚 API Endpoints](#api-endpoints)
4. [🧪 Testing the Project](#testing-the-project)
5. [🚨 Error Handling](#error-handling)
6. [📁 Project Structure](#project-structure)
7. [🤝 Contributing](#contributing)
8. [📄 License](#license)
9. [📖 Swagger API Documentation](#swagger-api-documentation)

## 🚀 Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: Web framework for Node.js to build APIs.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: For user authentication.
- **Jest**: Testing framework for JavaScript.
- **Supertest**: HTTP assertions for testing APIs.
- **Bcryptjs**: For password hashing.
- **Express-validator**: For request validation.
- **Helmet**: For security headers.
- **Compression**: For response compression.
- **Morgan**: For HTTP request logging.
- **Cors**: For Cross-Origin Resource Sharing.
- **MongoDB Memory Server**: For testing with in-memory MongoDB.

## 🌟 Key Features

- **👥 User Management**:

  - Secure user authentication using **JWT (JSON Web Tokens)**.
  - Role-based access control (user/admin) for protected routes.
  - Users can register, log in and manage their profiles.

- **🛍️ Product Management**:

  - Admin users can create, update, delete, and manage products.
  - Publicly accessible product listings with filtering and sorting capabilities.

- **📦 Order Management**:

  - Users can place orders and view their order history.
  - Support for managing order status and cancellation.

- **🔒 Validation and Security**:

  - Input validation using **Express Validator**.
  - Passwords are securely hashed using **bcryptjs**.
  - Security headers implemented using **Helmet**.
  - Cross-Origin Resource Sharing (CORS) support for frontend-backend communication.

- **📖 API Documentation**:

  - Interactive API documentation using **Swagger**.
  - Explore and test endpoints directly from the browser.

- **🧪 Comprehensive Testing**:

  - Unit and integration tests using **Jest** and **Supertest**.
  - Test coverage for critical functionalities such as authentication, product management, and orders.

- **🚀Optimized Performance**:

  - Response compression using **Compression** middleware.
  - Efficient database queries and indexing with **MongoDB**.

- **💻 Developer-Friendly Setup**:
  - Configurable using environment variables.
  - Lightweight and modular project structure.

---

## 📦 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (for cloud database) or local MongoDB installation
- Git (optional, for cloning the repository)

### Installation Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/e-commerce-backend.git
   cd e-commerce-backend
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` File**:
   Create a `.env` file in the root directory and add the following environment variables:

   ```plaintext
   NODE_ENV=development
   PORT=5000
   MONGO_URI="your_mongodb_connection_string"
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

4. **Run the Application**:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the API**:
   Open your browser or API client (like Postman) and navigate to:

   ```
   http://localhost:5000/api/v1/status
   ```

6. **Swagger API Docs**:
   Access the Swagger documentation to explore and test the APIs.
   Navigate to:
   ```
   http://localhost:5000/api-docs/
   ```

## 📁 Project Structure


```
/ecommerce-backend
├── /config # Configuration files
│   ├── db.js # Database configuration
│   └── config.js # Application configuration
├── /controllers # Request handlers
├── /models # Database models
├── /routes # API routes
├── /middleware # Custom middleware
├── /utils # Utility functions
└── /tests # Test files
    ├── setup.js # Test setup
    ├── helpers.js # Test helpers
    └── .test.js # Test files
```

## 📚 API Endpoints

### Authentication Routes

- **POST /api/v1/auth/register**: Register a new user.
- **POST /api/v1/auth/login**: Login a user.

### User Routes

- **GET /api/v1/users**: Get all users
- **GET /api/v1/users/:id**: Get a user by ID

### Product Routes

- **GET /api/v1/products**: Get all products.
- **POST /api/v1/products**: Create a new product (Admin only).
- **GET /api/v1/products/:id**: Get a product by ID.
- **PUT /api/v1/products/:id**: Update a product (Admin only).
- **DELETE /api/v1/products/:id**: Delete a product (Admin only).

### Order Routes

- **POST /api/v1/orders**: Create a new order.
- **GET /api/v1/orders**: Get all orders for the authenticated user.

## Testing the Project

### Running Tests

1. **Run All Tests**:

   ```bash
   npm run test:report  or npm run test
   ```

2. **Run Tests with Coverage**:

   ```bash
   npm run test:coverage
   ```

3. **Run Tests in Watch Mode**:
   ```bash
   npm run test:watch
   ```

### 🧪 Manual API Testing

You can also manually test the APIs using an API client like Postman. Below are the test scenarios for each endpoint:

<!-- #### User Authentication Tests -->

### Authentication Routes

#### Register User

- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "passwordConfirm": "password123",
    "role": "user" // Optional, defaults to "user"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user"
    }
  }
  ```

#### Login

- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "token": "jwt_token_here"
  }
  ```

#### Get Current User

- **Endpoint**: `GET /auth/me`
- **Description**: Get current logged-in user's profile
- **Authentication**: Required
- **Response**: `200 OK`

### Product Routes

#### Get All Products

- **Endpoint**: `GET /products`
- **Description**: Retrieve all products
- **Query Parameters**:
  - `category`: Filter by category
  - `price`: Filter by price range
  - `sort`: Sort products
- **Response**: `200 OK`

#### Create Product

- **Endpoint**: `POST /products`
- **Description**: Create a new product
- **Authentication**: Required (Admin only)
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category": "electronics",
    "stock": 100
  }
  ```
- **Response**: `201 Created`

#### Get Product by ID

- **Endpoint**: `GET /products/:id`
- **Description**: Get single product details
- **Response**: `200 OK`

#### Update Product

- **Endpoint**: `PUT /products/:id`
- **Description**: Update product details
- **Authentication**: Required (Admin only)
- **Request Body**: Same as Create Product
- **Response**: `200 OK`

#### Delete Product

- **Endpoint**: `DELETE /products/:id`
- **Description**: Delete a product
- **Authentication**: Required (Admin only)
- **Response**: `200 OK`

### User Routes

#### Get All Users

- **Endpoint**: `GET /users`
- **Description**: Get all users
- **Authentication**: Required (Admin only)
- **Response**: `200 OK`

#### Get User by ID

- **Endpoint**: `GET /users/:id`
- **Description**: Get user details
- **Authentication**: Required
- **Response**: `200 OK`

#### Update User Profile

- **Endpoint**: `PUT /users/:id`
- **Description**: Update user profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "email": "updated.email@example.com",
    "role": "admin" // Admin only
  }
  ```
- **Response**: `200 OK`

### Order Routes

#### Create Order

- **Endpoint**: `POST /orders`
- **Description**: Create a new order
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "items": [
      {
        "product": "product_id",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "City",
      "state": "State",
      "zipCode": "12345",
      "country": "Country"
    },
    "paymentMethod": "creditCard"
  }
  ```
- **Response**: `201 Created`

#### Get User Orders

- **Endpoint**: `GET /orders`
- **Description**: Get all orders for authenticated user
- **Authentication**: Required
- **Response**: `200 OK`

### Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Server Error`: Internal server error

### Authentication

All protected routes require a JWT token in the Authorization header:

### Edge Cases to Consider

- Invalid data formats (e.g., strings where numbers are expected).
- Unauthorized access to admin routes.
- Attempting to create orders with insufficient stock.
- Testing with empty request bodies.

## 🚨 Error Handling

The application uses a centralized error handling middleware to catch and respond to errors. Common error responses include:

- **400 Bad Request**: For validation errors.
- **401 Unauthorized**: For authentication failures.
- **404 Not Found**: When a resource is not found.
- **500 Internal Server Error**: For unexpected errors.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📖 Swagger API Documentation

The API uses Swagger to provide interactive and detailed documentation for all endpoints.

**How to Access Swagger Docs:**

1. **Run the server:**: Ensure the application is running locally or on a hosted environment.

2. **Navigate to Swagger URL:**: Open your browser and go to:

```
http://localhost:5000/api-docs
```

3. **Explore the APIs:**:

- `The Swagger UI provides an interactive interface to test the endpoints directly within the browser.`
- `Each endpoint includes descriptions, required parameters, request bodies, and example responses`

**Example Usage:**
GET /products:

**Description**: Retrieve a list of all products.

**How to Test**: Click on the endpoint in Swagger, then click "Try it out" to make a request.

POST /auth/register:

**Description**: Register a new user.

**How to Test**: Expand the endpoint, fill in the required fields, and click "Execute".
