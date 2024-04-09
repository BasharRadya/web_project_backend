import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Order } from "./models/order.js";
import cors from "cors";

import {
  createOrderRoute,
  getOrderByUserID,
  getOrderByEventID,
} from "./routes.js";

import {
  CREATE_ORDER_PATH,
  GET_ORDER_BY_USER_ID,
  GET_ORDER_BY_EVENT_ID,
  WORKER_PERMISSIONS,
  ADMIN_PERMISSIONS,
  MANAGER_PERMISSIONS,
  USER_PERMISSIONS,
} from "./const.js";
import { checkPermissionsMiddleware } from "./auth.js";

// import {consumeMessages} from "./consumer.js";

dotenv.config();
console.log(process.env.DB_USERNAME);
// MongoDB Atlas connection URI
const dbUsername = process.env.DB_USERNAME || "user";
const dbPassword = process.env.DB_PASSWORD || "pass";
const dbClusterName = process.env.DB_CLUSER_NAME || "cluster";
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterName}.lwmknqi.mongodb.net/hw2?retryWrites=true&w=majority`;
const secretKey = process.env.SECRET_KEY || "your_secret_key";
const port = process.env.PORT;

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const orderAPI = express();

//middile wares
const requestLoggerMiddleware = (req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
  console.log(log);
  next();
};

orderAPI.use(requestLoggerMiddleware);

//parse json
orderAPI.use(express.json());
// Check if there was an error while parsing JSON
orderAPI.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send("Invalid JSON format");
  }
  next();
});
//parse cookies
orderAPI.use(cookieParser());


const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
};

orderAPI.use(cors(corsOptions));


//routings
orderAPI.post(CREATE_ORDER_PATH,await checkPermissionsMiddleware(USER_PERMISSIONS), createOrderRoute);
orderAPI.get(GET_ORDER_BY_USER_ID,await checkPermissionsMiddleware(USER_PERMISSIONS), getOrderByUserID);
orderAPI.get(GET_ORDER_BY_EVENT_ID,await checkPermissionsMiddleware(USER_PERMISSIONS), getOrderByEventID);
orderAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

orderAPI.use((req, res, next) => {
  res.status(404).end("Not found");
});

//listening
orderAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});

// // start consuming messages
// consumeMessages();