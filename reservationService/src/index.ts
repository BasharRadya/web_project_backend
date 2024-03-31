import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// import { Reservation } from "./models/reservation.js";

import {
  createReservationRoute,
  removeReservationByUserID,
  getReservationByEventAndType,
} from "./routes.js";

import {
  CREATE_RESERVATION_PATH,
  GET_RESRVATION_BY_IDEVENT_TICKETNAME,
  REMOVE_RESERVATION_BY_USER_ID,
} from "./const.js";

import {consumeMessages} from "./consumer.js";

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

const reservationAPI = express();

//middile wares

//parse json
reservationAPI.use(express.json());
// Check if there was an error while parsing JSON
reservationAPI.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send("Invalid JSON format");
  }
  next();
});
//parse cookies
reservationAPI.use(cookieParser());

//routings
reservationAPI.post(CREATE_RESERVATION_PATH, createReservationRoute);
reservationAPI.get(GET_RESRVATION_BY_IDEVENT_TICKETNAME, getReservationByEventAndType);
reservationAPI.delete(REMOVE_RESERVATION_BY_USER_ID, removeReservationByUserID);
reservationAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});
//listening
reservationAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});

// start consuming messages
consumeMessages();