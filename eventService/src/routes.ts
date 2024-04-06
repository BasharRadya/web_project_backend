import { Event, eventSchemaValidator, reservationValidatorRoute, buyTicketValidator } from "./models/event.js";
import e, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios";
import {
  ADMIN_PERMISSIONS,
  ERROR_401,
  MANAGER_PERMISSIONS,
  VALID_CATEGORYES,
  WORKER_PERMISSIONS,
} from "./const.js";
import { Producer } from "./producer.js";
//get the ENV variables
dotenv.config();

//not sure about this one
axios.defaults.withCredentials = true;

//this idk why!
const secure = process.env.NODE_ENV === "production";
const reservationServiceURL = process.env.RESERVATION_SERVICE_URL || "http://localhost:3013";
const orderServiceURL = process.env.ORDER_SERVICE_URL || "http://localhost:3012";

// Get all events
export const getEvents = async (req: Request, res: Response) => {
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
  // debugLog("category", category1);
  let events;

  try {
    events = await Event.find().skip(skip).limit(limit);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error fetching events by category:", error);
    return;
  }

  // debugLog("Loaded", events.length, "events with the category", category1)
  res.status(200).end(JSON.stringify(events));
};
//get a speicific event by ID
export const getEventById = async (req: Request, res: Response) => {
  // debugLog("getEventById")

  // add user permisisons to header of the request and check
  // if (!(await validateUser(req, res, WORKER_PERMISSIONS))) {
  //   return;
  // }

  const eventID = req.params.id; // Extract event ID from URL

  let event;
  try {
    //Check if Id is in valid format
    if (mongoose.Types.ObjectId.isValid(eventID)) {
      event = await Event.findOne({
        _id: new mongoose.Types.ObjectId(eventID),
      });
    } else {
      // debugLog(eventID, "is not a valid DB Id");
      res.status(404).end("Event not found");
      return;
    }
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error fetching event:", error);
    return;
  }

  if (event) {
    res.status(200).end(JSON.stringify(event));
  } else {
    res.status(404).end("Event not found");
  }
};
// create new event
export const createEvent = async (req: Request, res: Response) => {
  // Validate request body against the defined schema
  const { error } = eventSchemaValidator.validate(req.body);
  if (error) {
    // If validation fails, send a 400 (Bad Request) response with the validation error
    res.status(400).end("Invalid body in create event");
    // debugLog(error)
    return;
  }
  let newEvent;
  let savedEvent;
  try {
    newEvent = new Event(req.body);
    // debugLog(newEvent);
    savedEvent = await newEvent.save();
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in creating event:", error);
    return;
  }
  // Respond with the newly created event
  res.status(201).end(JSON.stringify({ _id: savedEvent._id }));
};

// update event
export const updateEvent = async (req: Request, res: Response) => {
  const eventID = req.params.id; // Extract event ID from URL

  if (!mongoose.Types.ObjectId.isValid(eventID)) {
    // debugLog(eventID, "is not a valid DB Id")
    res.status(404).end("Event not found");
    return;
  }

  const filter = { _id: new mongoose.Types.ObjectId(eventID) };
  const update = { $set: req.body };
  const options = { returnOriginal: false };
  let newEvent;
  try {
    newEvent = await Event.findOneAndUpdate(filter, update, options);
    // debugLog(newEvent);
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in updating event:", error);
    return;
  }
  // Respond with the newly updated event
  res.status(200).end(JSON.stringify({ _id: newEvent?._id || eventID })); //newEvent is null if body contains no new (schema) fields
};

// delete event by ID
export const deleteEvent = async (req: Request, res: Response) => {
  
  const eventID = req.params.id; // Extract event ID from URL
  // debugLog(req.url?.split("/"));

  try {
    if (mongoose.Types.ObjectId.isValid(eventID)) {
      await Event.findByIdAndDelete(eventID);
    } else {
      //According to Piazza, deleting non-existent item is valid
      // debugLog(eventID, "is not a valid DB Id")
      res.status(200).end("is not a valid DB Id");
      return;
    }
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting event:", error);
    return;
  }
  res.status(200).end();
};


export const reserveTicket = async (req: Request, res: Response) => {
  const { error } = reservationValidatorRoute.validate(req.body);
  if (error) {
    // If validation fails, send a 400 (Bad Request) response with the validation error
    res.status(400).end("Invalid body in create event");
    // debugLog(error)
    return;
  }
  let { eventID, ticketName, amount } = req.body
  console.log(eventID)
  console.log(ticketName)
  console.log(amount)
  // get reservations
  try {
    const response = await axios.get(`${reservationServiceURL}/getreservation/${eventID}/${ticketName}`);
    const ticket = response.data;
    console.log(ticket)
    if (!ticket) {
      console.error("Ticket not found");
      res.status(500).end("Ticket not found");
      return;
    }
    // Check if the available quantity of the ticket is sufficient
    const numReservedOfThisTicketType = ticket.length;
    console.log(numReservedOfThisTicketType)
    if (ticket.quantity - numReservedOfThisTicketType <= 0) {
      console.error("Insufficient quantity available for reservation");
      res.status(500).end("Insufficient quantity available for reservation");
      return;
    }
    //send message broker to make Order entity
    let authorID = req.headers['x-user'];
    console.log(authorID);
    if (!authorID) {
      console.log("no authorID")
      authorID = "6601e2fef9f7ef9b52edc4c9"
    }
    Producer.prototype.sendEvent(JSON.stringify({
      authorID, eventID,
      ticketName, amount
    }));
    console.log("Ticket reserved successfully");
  } catch (error) {
    console.error("Error reserving ticket:", error);
    res.status(500).end("Internal Server Error");
    return;
  }
  res.status(200).end("sucessffuly reservered");
};

export const buyTicket = async (req: Request, res: Response) => {
  console.log("buyTicket")
  const { error } = buyTicketValidator.validate(req.body);
  if (error) {
    // If validation fails, send a 400 (Bad Request) response with the validation error
    res.status(400).end("Invalid body in create event");
    // debugLog(error)
    return;
  }

  let { eventID, ticketName } = req.body;

  let authorID = req.headers['x-user'];
  if (!authorID) {
    console.log("no authorID")
    authorID = "6601e2fef9f7ef9b52edc4c9"
  }
  console.log(authorID);
  let order_id: string = null;
  try {
    // Find the event by its ID and acquire a pessimistic lock
    console.log("before")
    const event = await Event.findById(eventID)
    console.log("after")
    if (!event) {
      throw new Error("Event not found");
    }
    // Find the ticket by its name
    const ticketContainingReserved = event.tickets.find(ticket => ticket.name === ticketName);
    if (!ticketContainingReserved) {
      throw new Error("Ticket containing reserved ticket not found");
    }
    const response = await axios.delete(`${reservationServiceURL}/removebyid/${authorID}`);
    console.log('Response data:', response.data);
    // Increment the available quantity of the ticket
    ticketContainingReserved.quantity--;
    //send to order API
    const data = {
      authorID: authorID,
      eventID: eventID,
      ticketName: ticketName
    };
    console.log(`${orderServiceURL}/create`);
    const response2 = await axios.post(`${orderServiceURL}/create`, data);
    console.log('Response2 data:', response2.data);
    if (response2.status != 201) {
      throw new Error("Error in creating order");
    }
    order_id = response2.data;
    // Save the updated event
    await event.save();
    console.log("Ticket bought successfully");
  } catch (error) {
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting here:", error);
    return;
  }
  res.status(200).end(order_id);
};

const validatePermissions = (requiredPermission: string, permission: any) => {
  const permissionHierarchy = { A: 1, M: 2, W: 3, U: 4 };

  const userPermission = permission;
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