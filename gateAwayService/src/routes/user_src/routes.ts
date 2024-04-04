import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  User,
  userDetailsValidator,
  changePermissionValidator
} from "../../models/user.js";
import {
  ADMIN_PERMISSIONS,
  USER_PERMISSIONS,
  WORKER_PERMISSIONS,
  MANAGER_PERMISSIONS,
  ERROR_401,
} from "../../const.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { nextTick } from "process";

dotenv.config();
const secure = process.env.NODE_ENV === "production";
const secretKey = process.env.SECRET_KEY || "your_secret_key";

export async function signupRoute(req: Request, res: Response) {
  // **** validate req.body
  const { error } = userDetailsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body format");
    return;
  }
  const username_user = req.body.username;
  const password_user = req.body.password;
  //check if allready created
  let allreadyCreated;
  try {
    const tmp ={username:username_user};
     allreadyCreated = await User.findOne(tmp);
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  if (allreadyCreated) {
    return res.status(400).end("User already exists");
    return;
  }

  let permission = "U";
  try {
    const cryptedPass = await bcrypt.hash(password_user,10);
    const newUser = new User({
      username: username_user,
      password: cryptedPass,
      permission: permission,
    });
    try {
      await newUser.save();
    } catch (error) {
      res.statusCode = 500;
      res.end("Internal Server Error");
      console.error("Error in validating user:", error);
      return;
    }

    res.status(201).end("User created");
  } catch (err) {
    console.log(err);
  }
}
export const loginRoute = async (req: Request, res: Response) => {
  // **** validate req.body
  const { error } = userDetailsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body format");
    return;
  }
  const { username, password } = req.body;
  //check if allready created
  let user_data: any = null;
  try {
   user_data = await User.findOne({ username: username });
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  if (!user_data) {
    res.status(401).end("Invalid username or password.");
    return;
  }

  const isValid = await bcrypt.compare(password, user_data.password);
  if (!isValid) {
    res.status(401).end("Invalid username or password.");
    return;
  }
  console.log("user_data",user_data.id)
  const token = jwt.sign({ username: username,
    autherID:user_data.id }, secretKey, {
    expiresIn: "24h",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 24 });
  res.status(200).end("Logged in succesffuly");
};
export async function logoutRoute(req: Request, res: Response) {
  // const secure = process.env.NODE_ENV === 'production';
  res.clearCookie("token", {
    httpOnly: true,
    secure: secure,
  });

  res.status(200).send("You have been successfully logged out.");
}
export  const verifyToken =async (req: Request, res: Response,next:NextFunction) => {
 console.log("verfieing token")
  const token = req.cookies.token;
  // console.log(token)
  if (!token) {
    res.status(401).end("Access denied");
    return;
    }
  try {
    let user = jwt.verify(token, secretKey) as JwtPayload;
    let user_data: any = null;
    user_data = await User.findById(user.autherID);
    // console.log(user);
    (req as any)['user'] = user.autherID;
    (req as any)['permission'] = user_data.permission;
    console.log(req['user']);
    console.log(req['permission']);


  } catch (err) {
    res.status(400).end("Invalid token");
    return;
  }
  next();
};
export const verifyToken2 = async  (req: Request, res: Response) : Promise<string>  =>  {
  console.log("verfieing token")
   const token = req.cookies.token;
  //  console.log("token",token)
   if (!token) {
     res.status(401).send("Access denied");
     return ERROR_401;
   }
   try {
     let user = jwt.verify(token, secretKey) as JwtPayload;
     let user_data: any = null;
     user_data = await User.findById(user.autherID ); 
     console.log(user);
     console.log(user_data);
     (req as any)['user'] = user.autherID;
     (req as any)['permission'] = user_data.permission;
     console.log(req['user']);
     return user.username;
     
   } catch (err) {
     res.status(400).end("Invalid token2");
     return ERROR_401;
   }
 };
export const validateUser = async (
  req: Request,
  res: Response,
  requiredPermission: string
) => {
  //check token and get the username
  const username = await verifyToken2(req, res);
  console.log("username",username)
  if (username === ERROR_401) {
    res.status(401).end("Invalid Token");
    return false;
  }
  //check if user in DB
  let user_data: any = null;
  try {
     user_data = await User.findOne({ username: username });
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  if (!user_data) {
    res.status(401).end("Invalid username or password.");
    return false;
  }
  //check if user has the required permission
  console.log("requiredPermission",requiredPermission)
  console.log("user_data.permission",user_data.permission)
  if (!validatePermissions(requiredPermission, user_data)) {
    res.status(403).end("Access denied!not proper perrmissions");
    return false;
  }
  return true;
};
const validatePermissions = (requiredPermission: string, user: any) => {
  const permissionHierarchy = { A: 1, M: 2, W: 3, U: 4 };

  const userPermission = user.permission;
  const requiredPermissionLevel = permissionHierarchy[requiredPermission];
  const userPermissionLevel = permissionHierarchy[userPermission];

  // debugLog("requiredPermissions:", requiredPermission)
  // debugLog("userPermission:", userPermission)

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
  console.log(req.body)
  const { error } = changePermissionValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .end("Invalid request body format for change permission");
    return;
  }
  const { username, permission } = req.body;
  if (!["U","W", "M"].includes(permission)) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({ message: "Invalid requested permission in body" })
    );
    return;
  }
  try {
    await User.updateOne({ username: username }, { permission: permission });
    

    // //update token to the new permission
    // // test this did not test yet and when finish testing remove the comment
    // let athID=req['user'];
    // const token = jwt.sign({ username: username,
    //   autherID:athID,
    //   permission:permission }, secretKey, {
    //   expiresIn: "24h",
    // });
    // res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 24 });

    res.status(200).end("Permission changed");
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
};
export const getPermission = async (req: Request, res: Response) => {
  if (!(await validateUser(req, res, USER_PERMISSIONS))) {
    console.log("error validate user in getPermission function")
    return;
  }
  let username = req['user'];
  console.log("username",username)
    if(!username) {
      console.log("problem in getPermissions functions")
    }
    let user_data: any = null; 
    try {
    user_data = await User.findOne({ username: username });
     } catch (error) {
       res.statusCode = 500;
       res.end("Internal Server Error");
       console.error("Error in validating user:", error);
       return;
     }
      if (!user_data) {
          console.log("did not find user in getPermission function")
        return;
      }
      res.status(200).end(JSON.stringify({permission:user_data.permission}));
    }

