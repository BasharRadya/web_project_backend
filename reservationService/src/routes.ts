import { Reservation, reservationValidator,reservationValidatorRoute } from "./models/reservation.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

//get the ENV variables
dotenv.config();

//this idk why!
const secure = process.env.NODE_ENV === "production";

//delete reservation func
export const deleteReservation = async (id) => {
  console.log(id)
  const { error } = reservationValidator.validate(id);
  if (error) {
    console.log("Invalid request body format");
    return;
  }
  try {
      await Reservation.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error in deleting reservation:", error);
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
  let username=req.headers['x-user'];
  if(!username){
    console.log("no username")
  }
  console.log(username);
  const newReservation = new Reservation({
    username: username,
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
  res.status(201).end(newReservation._id);
}
//get reservations
export async function getReservationByEventAndType(req: Request, res: Response) {
  console.log("getReservationByEventAndType");
  let id = req.params.id;
  let type = req.params.string;
  let tmp = { eventID: id, ticketName: type};
  let reservations: any = null;
  try {
    console.log("here")
    reservations = await Reservation.find(tmp)
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(reservations));
}
// delete resevation by entity ID
export const removeReservationByUserID = async (req: Request, res: Response) => {
  console.log("Remove Reservation");
  const id = req.params.id; // Extract event ID from URL
  try {
      await Reservation.findByIdAndDelete(id);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting reservation:", error);
    return;
  }
  res.status(200).end("success delete");
};

//get reservation by entity id
export async function getReservationByUserID(req: Request, res: Response) {

  let id = req.params.id;
  let reservations: any = null;
  try {
    reservations = await Reservation.findById(id)
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in validating user:", error);
    return;
  }
  res.status(200).end(JSON.stringify(reservations));
}