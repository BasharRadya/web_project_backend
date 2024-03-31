import { Reservation, reservationValidator,reservationValidatorRoute } from "./models/reservation.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

//get the ENV variables
dotenv.config();

//this idk why!
const secure = process.env.NODE_ENV === "production";

//create reservation func
export const createReservation = async (item) => {
  console.log(item)
  const { error } = reservationValidator.validate(item);
  if (error) {
    console.log("Invalid request body format");
    return;
  }
  const { authorID,eventID, ticketName,amount } = item;
  console.log(authorID);
  const newReservation = new Reservation({
    authorID: authorID,
    eventID: eventID, 
    ticketName: ticketName,
    amount: amount,
    expiry: new Date(Date.now() + 60*1000*5), // set expiry in 5 minutes from now
  });
  try {
    await newReservation.save();
  } catch (error) {
    console.error("Error in validating user:", error);
    return;
  }
  console.log("Reservation created");
}
//create reservation route
export async function createReservationRoute(req: Request, res: Response) {
  // **** validate req.body
  console.log("createReservationRoute");
  const { error } = reservationValidator.validate(req.body);
  if (error) {
    return res.status(400).end("Invalid request body format");
    return;
  }
  const { eventID, ticketName,amount } = req.body;
  let authorID=req.headers['x-user'];
  if(!authorID){
    // authorID="6601e2fef9f7ef9b52edc4c9"
  }
  console.log(authorID);
  const newReservation = new Reservation({
    authorID: authorID,
    eventID: eventID,
    ticketName: ticketName,
    amount: amount,
    expiry: new Date(Date.now() + 60*1000*5), // set expiry in 5 minutes from now
  });
  try {
    await newReservation.save();
  } catch (error) {
    res.statusCode = 500;
    res.end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(201).end("Reservation created");
}
//get reservations
export async function getReservationByEventAndType(req: Request, res: Response) {

  // let skip: any = req.query.skip;
  // let limit: any = req.query.limit;

  // if (isNaN(skip)) {
  //   skip = 0;
  // }
  // if (isNaN(limit) || limit > 50) {
  //   limit = 50;
  // }
  // debugLog("skip", skip);
  // debugLog("limit", limit);

  let id = req.params.id;
  let type = req.params.string;
  let tmp = { eventID: id, ticketName: type};
  let reservations: any = null;
  try {
    reservations = await Reservation.find(tmp)
    // .skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(reservations));
}
// delete event by ID
export const removeReservationByUserID = async (req: Request, res: Response) => {
  console.log("Remove Reservation");
  // let permission=req.headers['x-permission'];
  // if (!  validatePermissions(MANAGER_PERMISSIONS, permission)) {
  //   res.status(403).end("Access denied!not proper perrmissions");
  //   return;
  // }
  const authorID = req.params.id; // Extract event ID from URL
  let tmp={authorID:authorID}
  try {
    if (mongoose.Types.ObjectId.isValid(authorID)) {
      await Reservation.deleteOne(tmp);
    } else {
      //According to Piazza, deleting non-existent item is valid
      // debugLog(eventID, "is not a valid DB Id")
      res.status(200).end("is not a valid DB Id");
      return;
    }
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting reservation:", error);
    return;
  }
  res.status(200).end("success delete");
};
