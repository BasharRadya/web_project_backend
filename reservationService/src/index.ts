import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// import { Reservation } from "./models/reservation.js";
import cors from "cors";
import { checkPermissionsMiddleware } from "./auth.js";

import {
  createReservationRoute,
  removeReservationByUserID,
  getReservationByEventAndType,
} from "./routes.js";

import {
  CREATE_RESERVATION_PATH,
  GET_RESRVATION_BY_IDEVENT_TICKETNAME,
  REMOVE_RESERVATION_BY_USER_ID,
  WORKER_PERMISSIONS,
  USER_PERMISSIONS,
  ADMIN_PERMISSIONS,
  MANAGER_PERMISSIONS,
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
const port = process.env.PORT;

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const reservationAPI = express();

//middile wares
const requestLoggerMiddleware = (req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
  console.log(log);
  next();
};

reservationAPI.use(requestLoggerMiddleware);

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

reservationAPI.use(cors(corsOptions));



//routings
reservationAPI.post(CREATE_RESERVATION_PATH,await checkPermissionsMiddleware(USER_PERMISSIONS), createReservationRoute);
reservationAPI.get(GET_RESRVATION_BY_IDEVENT_TICKETNAME,await checkPermissionsMiddleware(USER_PERMISSIONS), getReservationByEventAndType);
reservationAPI.delete(REMOVE_RESERVATION_BY_USER_ID,await checkPermissionsMiddleware(USER_PERMISSIONS), removeReservationByUserID);
reservationAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

reservationAPI.use((req, res, next) => {
  res.status(404).end("Not found");
});

//listening
reservationAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});

// start consuming messages
consumeMessages();