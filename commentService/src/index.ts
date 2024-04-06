import express from "express";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Comment } from "./models/comment.js";
import * as bcrypt from "bcrypt";

import {
  createCommentRoute,
  getCommentByUserID,
  getCommentByEventID,
} from "./routes.js";

import {
  CREATE_COMMENT_PATH,
  GET_COMMENT_BY_EVENT_ID,
  GET_COMMENT_BY_USER_ID,
} from "./const.js";

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
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const commentAPI = express();

//middile wares

//parse json
commentAPI.use(express.json());
// Check if there was an error while parsing JSON
commentAPI.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send("Invalid JSON format");
  }
  next();
});
//parse cookies
commentAPI.use(cookieParser());

//routings
commentAPI.post(CREATE_COMMENT_PATH, createCommentRoute);
commentAPI.get(GET_COMMENT_BY_USER_ID, getCommentByUserID);
commentAPI.get(GET_COMMENT_BY_EVENT_ID, getCommentByEventID);
commentAPI.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

commentAPI.use((req, res, next) => {
  res.status(404).end("Not found");
});

//listening
commentAPI.listen(port, () => {
  console.log(`Server running! port ${port}`);
});
