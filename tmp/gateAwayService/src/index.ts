import express from "express";
import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { User } from "./models/user.js";
import * as bcrypt from "bcrypt";
// import { v4 as uuidv4 } from "uuid";

// import {
//     loginRoute,
//     logoutRoute,
//     signupRoute,
//     usernameRoute,
// } from './routes.js';

import {
  LOGIN_PATH,
  LOGOUT_PATH,
  SIGNUP_PATH,
  USER_PERMISSIONS,
  WORKER_PERMISSIONS,
  MANAGER_PERMISSIONS,
  ADMIN_PERMISSIONS,
} from "./const.js";

import { verifyToken } from "./routes/user_src/routes.js";
import { check_admin_in_db, userService } from "./routes/userService.js";

dotenv.config();

const port = process.env.PORT || 3000;

const gateaway = express();

//check if admin in db
check_admin_in_db();

//middile wares
//parse json
gateaway.use(express.json());
// Check if there was an error while parsing JSON
gateaway.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send("Invalid JSON format");
  }
  next();
});
//parse cookies
gateaway.use(cookieParser());

//declare routes
// user serivce
gateaway.use("/user", verifyToken, userService);
//more services

//Root route for HTML of CS nerd AbO bDiR
gateaway.get("/", (req: Request, res: Response) =>
  res.end("Hello from CS nerd AbO bDiR")
);

//start listening
gateaway.listen(port, () => {
  console.log(`gateAway Server running! port ${port}`);
});
