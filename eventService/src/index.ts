import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Event } from "./models/event.js";

import {
  getEventById,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./routes.js";
import {
  GET_EVENT_BY_ID,
  GET_EVENTS,
  PUT_EVENT_BY_ID,
  DELETE_EVENT_BY_ID,
  POST_EVENT,
  ERROR_401,
} from "./const.js";

dotenv.config();
console.log(process.env.DB_USERNAME);
// MongoDB Atlas connection URI
const dbUsername = process.env.DB_USERNAME || "user";
const dbPassword = process.env.DB_PASSWORD || "pass";
const dbClusterName = process.env.DB_CLUSER_NAME || "cluster";
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterName}.lwmknqi.mongodb.net/hw2?retryWrites=true&w=majority`;
const secretKey = process.env.SECRET_KEY || "your_secret_key";
const port = process.env.PORT || 3003;

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const eventAPI = express();


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

//routings
eventAPI.get(GET_EVENTS, getEvents);
eventAPI.get(GET_EVENT_BY_ID, getEventById);
eventAPI.put(PUT_EVENT_BY_ID, updateEvent);
eventAPI.delete(DELETE_EVENT_BY_ID, deleteEvent);
eventAPI.post(POST_EVENT, createEvent);
eventAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});
//listening
eventAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
