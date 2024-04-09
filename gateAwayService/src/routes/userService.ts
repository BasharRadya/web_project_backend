import express from "express";
import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { User } from "../models/user.js";
import * as bcrypt from "bcrypt";
import {checkPermissionsMiddleware} from './auth.js'

import {
  loginRoute,
  logoutRoute,
  signupRoute,
  changePermissionRoute,
  getPermissionRoute,
  verifyTokenMiddleware
} from "./auth.js";

import {
  LOGIN_PATH,
  LOGOUT_PATH,
  SIGNUP_PATH,
  PUT_PERMISSION,
  USER_PERMISSIONS,
  WORKER_PERMISSIONS,
  MANAGER_PERMISSIONS,
  ADMIN_PERMISSIONS,
  GET_PERMISSION,
} from "../const.js";

dotenv.config();
console.log(process.env.DB_USERNAME);
// MongoDB Atlas connection URI
const dbUsername = process.env.DB_USERNAME || "user";
const dbPassword = process.env.DB_PASSWORD || "pass";
const dbClusterName = process.env.DB_CLUSER_NAME || "cluster";
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbClusterName}.lwmknqi.mongodb.net/hw2?retryWrites=true&w=majority`;
const secretKey = process.env.SECRET_KEY || "your_secret_key";

console.log("dbUri", dbUri);
// Connect to MongoDB Atlas
await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

export const check_admin_in_db = async () => {
  const admin = await User.findOne({ username: "admin" });
  if (!admin) {
    //   debugLog("Admin not found. Creating admin account");
    const adminPass = process.env.DEFAULT_ADMIN_PASS || "pass";
    const cryptedPass = await bcrypt.hash(adminPass, 10);
    console.log("adminPass", ADMIN_PERMISSIONS);
    const newAdmin = new User({
      username: adminPass,
      password: cryptedPass,
      permission: ADMIN_PERMISSIONS,
    });
    await newAdmin.save();
  }
};
export const userService = express.Router();
//routings
userService.use(express.json());
// Check if there was an error while parsing JSON
userService.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      return res.status(400).send("Invalid JSON format");
    }
    next();
  }
);
userService.post(LOGIN_PATH, loginRoute);
userService.post(LOGOUT_PATH, logoutRoute);
userService.post(SIGNUP_PATH, signupRoute);
userService.put(PUT_PERMISSION, verifyTokenMiddleware, await checkPermissionsMiddleware(ADMIN_PERMISSIONS), changePermissionRoute);
userService.get(GET_PERMISSION, getPermissionRoute);