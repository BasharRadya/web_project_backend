import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Order } from "./models/order.js";

import {
  createOrderRoute,
  getOrderByUserID,
  getOrderByEventID,
} from "./routes.js";

import {
  CREATE_ORDER_PATH,
  GET_ORDER_BY_USER_ID,
  GET_ORDER_BY_EVENT_ID,
} from "./const.js";

dotenv.config();
console.log(process.env.DB_USERNAME);
// MongoDB Atlas connection URI
const dbUsername = process.env.DB_USERNAME || "user";
const dbPassword = process.env.DB_PASSWORD || "pass";
const dbClusterName = process.env.DB_CLUSER_NAME || "cluster";
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterName}.lwmknqi.mongodb.net/hw2?retryWrites=true&w=majority`;
const secretKey = process.env.SECRET_KEY || "your_secret_key";
const port = process.env.PORT || 3000;

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const orderAPI = express();

//middile wares

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

//routings
orderAPI.post(CREATE_ORDER_PATH, createOrderRoute);
orderAPI.get(GET_ORDER_BY_USER_ID, getOrderByUserID);
orderAPI.get(GET_ORDER_BY_EVENT_ID, getOrderByEventID);
orderAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});
//listening
orderAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
