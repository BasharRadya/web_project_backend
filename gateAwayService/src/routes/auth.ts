import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  User,
  changePermissionValidator,
  userDetailsValidator,
} from "../models/user.js";
import {
  ADMIN_PERMISSIONS,
  USER_PERMISSIONS,
  ERROR_401,
} from "../const.js";
import dotenv from "dotenv";
import axios from "axios";

axios.defaults.withCredentials = true;

dotenv.config();
const secure = process.env.NODE_ENV === "production";
const secretKey = process.env.SECRET_KEY || "your_secret_key";

export async function signupRoute(req: Request, res: Response) {

  const { error } = userDetailsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body");

  }
  const { username, password } = req.body;

  let usernameAlreadyExists: any;
  try {
    usernameAlreadyExists = await User.findOne({ username: username });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    return res.status(500).end("Moongoose Error");
  }

  if (usernameAlreadyExists) {
    return res.status(400).end("User already exists");
  }

  let permission = USER_PERMISSIONS;
  try {
    const cryptedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username,
      password: cryptedPass,
      permission: permission,
    });
    try {
      await newUser.save();
    } catch (error) {
      console.error("Error in accessing DB:", error);
      return res.status(500).end("Moongoose Error");
    }

    res.status(201).end("User created");
  } catch (err) {
    console.error(err);
    return res.status(500).end("Unkonwn error occured!");
  }
}
export const loginRoute = async (req: Request, res: Response) => {

  const { error } = userDetailsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body");
  }
  const { username, password } = req.body;

  let userData: any = null;
  try {
    userData = await User.findOne({ username: username });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    return res.status(500).end("Moongoose Error");
  }

  if (!userData || !(await bcrypt.compare(password, userData.password))) {
    return res.status(401).end("Invalid username or password.");
  }

  const token = jwt.sign({ username: username }, secretKey, {
    expiresIn: "24h",
  });
  res.cookie("token", token, { secure: secure, sameSite: "none", httpOnly: true, maxAge: 24 * 60 * 60 * 24 });
  res.status(200).end("Logged in succesffuly");
};

export async function logoutRoute(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: secure,
  });

  res.status(200).send("You have been successfully logged out.");
}

export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction): string => {
  const token = req.cookies.token;
  console.log(token)
  if (!token) {
    res.status(401).end("No valid session token found.");
    return ERROR_401;
  }

  try {
    let user = jwt.verify(token, secretKey) as JwtPayload;
    req['user'] = user.username;
    console.log("user", user);
    next();
    return user.username;
  } catch (err) {
    res.status(400).end("Invalid token");
    return ERROR_401;
  }
};

export const getUserNameRoute = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).end("No valid session token found.");
  }
  let user = jwt.verify(token, secretKey) as JwtPayload;
  res.status(200).end(JSON.stringify({ username: user.username }));
}

export const verifyToken = (req: Request, res: Response): string => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).end("No valid session token found.");
    return ERROR_401;
  }

  try {
    let user = jwt.verify(token, secretKey) as JwtPayload;
    req['user'] = user.username;
    console.log("user", user);
    return user.username;
  } catch (err) {
    res.status(400).end("Invalid token");
    return ERROR_401;
  }
};

export const validateUser = async (
  req: Request,
  res: Response,
  requiredPermission: string
) => {

  const username = verifyToken(req, res);
  if (username === ERROR_401) {
    res.status(401).end("Invalid Token");
    return false;
  }

  let userData: any = null;
  try {
    userData = await User.findOne({ username: username });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    res.status(500).end("Moongoose Error");
    return false;
  }

  if (!userData) {
    res.status(401).end("Invalid username or password.");
    return false;
  }

  if (!validatePermissions(requiredPermission, userData)) {
    res.status(403).end("Access denied! Insufficient permissions.");
    return false;
  }

  return true;
};

const validatePermissions = (requiredPermission: string, user: any) => {
  const permissionHierarchy = { A: 1, M: 2, W: 3, U: 4 };

  const userPermission = user.permission;
  const requiredPermissionLevel = permissionHierarchy[requiredPermission];
  const userPermissionLevel = permissionHierarchy[userPermission];

  if (
    requiredPermissionLevel === undefined ||
    userPermissionLevel === undefined
  ) {
    return false;
  } else {
    const userPermissionLevel = permissionHierarchy[userPermission];
    return userPermissionLevel <= requiredPermissionLevel;
  }
};

export const changePermissionRoute = async (req: Request, res: Response) => {
  if (!(await validateUser(req, res, ADMIN_PERMISSIONS))) {
    return;
  }

  const { error } = changePermissionValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body");
  }

  const { username, permission } = req.body;
  if (!["W", "M"].includes(permission)) {
    return res.status(400).end("Invalid requested permission in body");
  }

  try {
    await User.updateOne({ username: username }, { permission: permission });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    res.status(500).end("Moongoose Error");
  }

  res.status(200).end("Permission changed");
};

export const getPermissionRoute = async (req: Request, res: Response) => {
  //TODO: assess whether we need to pass token in inter-service communication

  // if (!(await validateUser(req, res, USER_PERMISSIONS))) {
  //   return;
  // }

  const username = req.params.id

  let userData: any = null;
  try {
    userData = await User.findOne({ username: username });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    return res.status(500).end("Moongoose Error");
  }

  if (!userData) {
    return res.status(404).end("Requested user not found");
  }

  res.status(200).end(JSON.stringify({ permission: userData.permission }));
}

const gatewayUrl = process.env.GATEWAY_URL;

export const checkPermissionsMiddleware = async (requiredPermission: string) => {

  // Return a new middleware function configured with the specified permission level
  return async (req: Request, res: Response, next: NextFunction) => {
    const username = req.headers['x-user'];
    if (!username) {
      return res.status(400).send("Missing username in header");
    }

    try {
      const response = await axios.get(`${gatewayUrl}/user/permission/${username}`);
      const { permission } = response.data;
      if (!permission) {
        return res.status(404).end("User not found");
      }
      const hasPermission: boolean = verifyPermissionLevel(requiredPermission, permission);

      console.log("User Permission: ", permission, "Required Permission: ", requiredPermission, "Valid: ", hasPermission);
      if (!hasPermission) {
        return res.status(403).end("Insufficient permissions");
      } else {
        next();
      }

    } catch (err) {
      return res.status(502).end("Error in communicating with the gateway");
    }
  };
};

const verifyPermissionLevel = (requiredPermission: string, userPermission: string) => {
  const permissionHierarchy = { A: 1, M: 2, W: 3, U: 4 };

  const requiredPermissionLevel = permissionHierarchy[requiredPermission];
  const userPermissionLevel = permissionHierarchy[userPermission];

  if (
    requiredPermissionLevel === undefined ||
    userPermissionLevel === undefined
  ) {
    return false;
  } else {
    const userPermissionLevel = permissionHierarchy[userPermission];
    return userPermissionLevel <= requiredPermissionLevel;
  }
};

export const successRoute = (_req: Request, res: Response) => {
  res.status(200).end("Success");
};