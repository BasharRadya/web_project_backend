import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import {
  getEventById,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  buyTicket,
  reserveTicket,
  refundOrderID,
} from "./routes.js";
import {
  GET_EVENT_BY_ID,
  GET_EVENTS,
  PUT_EVENT_BY_ID,
  DELETE_EVENT_BY_ID,
  POST_EVENT,
  RESERVE_TICKET_EVENT,
  BUY_TICKET_EVENT,
  ERROR_401,
  MANAGER_PERMISSIONS,
  USER_PERMISSIONS,
  REFUND_ORDERID,
} from "./const.js";
import { Producer } from "./producer.js";
import { checkPermissionsMiddleware } from "./auth.js";


dotenv.config();
// MongoDB Atlas connection URI
const dbUsername = process.env.DB_USERNAME || "user";
const dbPassword = process.env.DB_PASSWORD || "pass";
const dbClusterName = process.env.DB_CLUSER_NAME || "cluster";
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterName}.lwmknqi.mongodb.net/hw2?retryWrites=true&w=majority`;
const port = process.env.PORT;

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);



const eventAPI = express();

const requestLoggerMiddleware = (req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
  console.log(log);
  next();
};

eventAPI.use(requestLoggerMiddleware);


//parse json
eventAPI.use(express.json());
// Check if there was an error while parsing JSON
eventAPI.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send("Invalid JSON format");
  }
  next();
});
//parse cookies
eventAPI.use(cookieParser());

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
  sameSite: "none",
};

eventAPI.use(cors(corsOptions));

//routings
eventAPI.get(GET_EVENTS, await checkPermissionsMiddleware(USER_PERMISSIONS), getEvents);
eventAPI.get(GET_EVENT_BY_ID, await checkPermissionsMiddleware(USER_PERMISSIONS), getEventById);
eventAPI.put(PUT_EVENT_BY_ID, await checkPermissionsMiddleware(MANAGER_PERMISSIONS), updateEvent);
eventAPI.delete(DELETE_EVENT_BY_ID, await checkPermissionsMiddleware(MANAGER_PERMISSIONS), deleteEvent);
eventAPI.post(POST_EVENT, await checkPermissionsMiddleware(MANAGER_PERMISSIONS), createEvent);
eventAPI.post(BUY_TICKET_EVENT, await checkPermissionsMiddleware(USER_PERMISSIONS), buyTicket);
eventAPI.post(RESERVE_TICKET_EVENT, await checkPermissionsMiddleware(USER_PERMISSIONS), reserveTicket);
eventAPI.put(REFUND_ORDERID, await checkPermissionsMiddleware(USER_PERMISSIONS), refundOrderID);

eventAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

eventAPI.use((req, res, next) => {
  res.status(404).end("Not found");
});

//listening
eventAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});



