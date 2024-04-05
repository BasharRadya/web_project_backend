import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  User,
  changePermissionValidator,
  getPermissionsValidator,
  userDetailsValidator,
} from "../../models/user.js";
import {
  ADMIN_PERMISSIONS,
  USER_PERMISSIONS,
  ERROR_401,
} from "../../const.js";
import dotenv from "dotenv";

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
  res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 24 });
  res.status(200).end("Logged in succesffuly");
};

export async function logoutRoute(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: secure,
  });

  res.status(200).send("You have been successfully logged out.");
}

export const verifyToken = (req: Request, res: Response): string => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).end("No valid session token found.");
    return ERROR_401;
  }

  try {
    let user = jwt.verify(token, secretKey) as JwtPayload;
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

export const getPermission = async (req: Request, res: Response) => {
  if (!(await validateUser(req, res, USER_PERMISSIONS))) {
    return;
  }

  const { error } = getPermissionsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body");
  }

  const { username } = req.body;

  let userData: any = null;
  try {
    userData = await User.findOne({ username: username });
  } catch (error) {
    console.error("Error in accessing DB:", error);
    return res.status(500).end("Moongoose Error");
  }

  if (!userData) {
    return res.status(404).end("Requested user not found");;
  }

  res.status(200).end(JSON.stringify({ permission: userData.permission }));
}

