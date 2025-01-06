import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env` });

dotenv.config({ path: path.join(__dirname, "..", ".env") });

let mongod, mongoServer;

// Setup in-memory MongoDB before all tests
beforeAll(async () => {
  try {
    // Close any existing connections
    await mongoose.disconnect();

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {}
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {}
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// // Setup before running the tests
// beforeAll(async () => {
//   try {
//     mongod = await MongoMemoryServer.create();
//     const mongoUri = mongod.getUri();
//     await mongoose.connect(mongoUri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("In-memory MongoDB connected");
//   } catch (error) {
//     console.error("Error connecting to in-memory MongoDB:", error);
//   }
// });

// // Cleanup after all tests
// afterAll(async () => {
//   if (mongod) {
//     await mongod.stop();
//   }
//   await mongoose.disconnect();
//   console.log("In-memory MongoDB disconnected");
// });

// // Cleanup after each test
// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany();
//   }
// });

// beforeAll(async () => {
//   try {
//     mongod = await MongoMemoryServer.create();
//     const mongoUri = mongod.getUri();
//     await mongoose.connect(mongoUri);
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// });

// afterAll(async () => {
//   if (mongod) {
//     await mongod.stop();
//   }
//   await mongoose.connection.close();
// });

// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany();
//   }
// });
