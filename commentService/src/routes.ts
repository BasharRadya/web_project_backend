import { Comment, commentDetailsValidator } from "./models/comment.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

//get the ENV variables
dotenv.config();

//this idk why!
const secure = process.env.NODE_ENV === "production";

export async function createCommentRoute(req: Request, res: Response) {
  // **** validate req.body
  console.log(req.body);

  const { error } = commentDetailsValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body format");
    return;
  }
  const { eventID, comment } = req.body;
  let authorID=req.headers['x-user'];
  console.log(authorID);
  const newComment = new Comment({
    authorID: authorID,
    eventID: eventID,
    comment: comment,
  });
  try {
    await newComment.save();
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(201).end("Comment created");
}
//get all orders of a user gived userID
export async function getCommentByUserID(req: Request, res: Response) {
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
  let comment: any = null;
  try {
    comment = await Comment.find(tmp).skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(comment));
}
//get all orders by EventID
export async function getCommentByEventID(req: Request, res: Response) {
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
  let comment: any = null;
  try {
    comment = await Comment.find(tmp).skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(comment));
}
