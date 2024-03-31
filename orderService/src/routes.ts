import { Order, orderDetailsValidator ,orderDetailsValidatorRoute} from "./models/order.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

//get the ENV variables
dotenv.config();

//this idk why!
const secure = process.env.NODE_ENV === "production";

//create order func
export const createOrder = async (item) => {
  console.log(item)
  const { error } = orderDetailsValidator.validate(item);
  if (error) {
    console.log("Invalid request body format");
    return;
  }
  const { authorID,eventID, ticketName } = item;
  console.log(authorID);
  const newOrder = new Order({
    authorID: authorID,
    eventID: eventID, 
    ticketName: ticketName,
  });
  try {
    await newOrder.save();
  } catch (error) {
    console.error("Error in validating user:", error);
    return;
  }
  console.log("Order created");
}
//create order route
export async function createOrderRoute(req: Request, res: Response) {
  // **** validate req.body
  console.log("createOrderRoute");
  const { error } = orderDetailsValidatorRoute.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body format");
    return;
  }
  const { eventID, ticketName } = req.body;
  let authorID=req.headers['x-user'];
  console.log(authorID);
  const newOrder = new Order({
    authorID: authorID,
    eventID: eventID,
    ticketName: ticketName,
  });
  try {
    await newOrder.save();
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(201).end("Order created");
}
//get all orders of a user gived userID
export async function getOrderByUserID(req: Request, res: Response) {
  // debugLog("getEventsByCategory")
  // if (!await validateUser(req, res, WORKER_PERMISSIONS)) {
  //   return;
  // }
  // res.setHeader("Content-Type", "application/json");

  let skip: any = req.query.skip;
  let limit: any = req.query.limit;
  if (isNaN(skip)) {
    skip = 0;
  }
  if (isNaN(limit) || limit > 50) {
    limit = 50;
  }
  // debugLog("skip", skip);
  // debugLog("limit", limit);

  let id = req.params.id;
  let tmp = { authorID: id };
  let orders: any = null;
  try {
    orders = await Order.find(tmp).skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(orders));
}
//get all orders by EventID
export async function getOrderByEventID(req: Request, res: Response) {
  // debugLog("getEventsByCategory")
  // if (!await validateUser(req, res, WORKER_PERMISSIONS)) {
  //   return;
  // }
  // res.setHeader("Content-Type", "application/json");

  let skip: any = req.query.skip;
  let limit: any = req.query.limit;
  if (isNaN(skip)) {
    skip = 0;
  }
  if (isNaN(limit) || limit > 50) {
    limit = 50;
  }
  // debugLog("skip", skip);
  // debugLog("limit", limit);

  let id = req.params.id;
  let tmp = { eventID: id };
  let orders: any = null;
  try {
    orders = await Order.find(tmp).skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(orders));
}
