import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { debugLog } from "./debug.js";

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

      debugLog("User Permission: ", permission, "Required Permission: ", requiredPermission, "Valid: ", hasPermission);
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