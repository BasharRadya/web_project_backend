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
  if(!authorID){
    console.log("authorID not found in headers");
    authorID="6601e2fef9f7ef9b52edc4c9"
  }
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
  console.log("Order created");
  res.status(201).end(newOrder._id.toString());
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
//get all orders by Oder ID
export async function getOrderByID(req: Request, res: Response) {


  let id = req.params.id;
  let tmp = { _id: id };
  let orders: any = null;
  try {
    orders = await Order.findById(id)
    if(!orders){
      console.log("Order not found")
      throw new Error("Order not found")
    }
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(orders));
}

//delete order by Oder ID
export async function deleteByID(req: Request, res: Response) {
  let id = req.params.id;
  let tmp = { _id: id };
  let orders: any = null;
  try {
    await Order.deleteOne(tmp)
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(orders));
}