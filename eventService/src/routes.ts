import { Event, eventSchemaValidator,
  reserveTicketValidator,buyTicketValidator } from "./models/event.js";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import {
  ADMIN_PERMISSIONS,
  ERROR_401,
  MANAGER_PERMISSIONS,
  VALID_CATEGORYES,
  WORKER_PERMISSIONS,
} from "./const.js";

//get the ENV variables
dotenv.config();

//this idk why!
const secure = process.env.NODE_ENV === "production";


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

  const eventId = req.params.id; // Extract event ID from URL

  let event;
  try {
    //Check if Id is in valid format
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findOne({
        _id: new mongoose.Types.ObjectId(eventId),
      });
    } else {
      // debugLog(eventId, "is not a valid DB Id");
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
  // debugLog("createEvent")
  // if (!await validateUser(req, res, MANAGER_PERMISSIONS)) {
  //   return;
  // }
  console.log("Createing Event");
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
  // debugLog("updateEvent")
  // if (!await validateUser(req, res, MANAGER_PERMISSIONS)) {
  //   return;
  // }

  const eventId = req.params.id; // Extract event ID from URL

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    // debugLog(eventId, "is not a valid DB Id")
    res.status(404).end("Event not found");
    return;
  }

  const filter = { _id: new mongoose.Types.ObjectId(eventId) };
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
  res.status(200).end(JSON.stringify({ _id: newEvent?._id || eventId })); //newEvent is null if body contains no new (schema) fields
};
// delete event by ID
export const deleteEvent = async (req: Request, res: Response) => {
  // debugLog("deleteEvent")
  // if (!await validateUser(req, res, ADMIN_PERMISSIONS)) {
  //   return;
  // }
  // res.setHeader("Content-Type", "application/json");

  const eventId = req.params.id; // Extract event ID from URL
  // debugLog(req.url?.split("/"));

  try {
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      await Event.findByIdAndDelete(eventId);
    } else {
      //According to Piazza, deleting non-existent item is valid
      // debugLog(eventId, "is not a valid DB Id")
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
  const { error } = reserveTicketValidator.validate(req.body);
  if (error) {
    // If validation fails, send a 400 (Bad Request) response with the validation error
    res.status(400).end("Invalid body in create event");
    // debugLog(error)
    return;
  }
  let {eventId, ticketName}=req.body
  console.log(eventId)
  console.log(ticketName)
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the event by its ID and acquire a pessimistic lock
    const event = await Event.findById(eventId).session(session).select('tickets').exec();
    if (!event) {
      console.error("Event not found");
      res.status(500).end("Event not found");
      return;
    }

    // Find the ticket with the provided name
    const ticket = event.tickets.find(t => t.name === ticketName);
    if (!ticket) {
      console.error("Ticket not found");
      res.status(500).end("Ticket not found");

      return;
    }

    // Check if the available quantity of the ticket is sufficient
    const numReservedOfThisTicketType = ticket.ReservedTickets.length;

    if (ticket.quantity - numReservedOfThisTicketType <= 0) {
      console.error("Insufficient quantity available for reservation");
      res.status(500).end("Insufficient quantity available for reservation");

      return;
    }

    // Generate a new reserved ticket
    const reservedTicket = {
      ticketId: new mongoose.Types.ObjectId(), // Generate a new ObjectId for the ticket
      expiry: new Date(Date.now() + 60*1000*5), // Set expiry time to 48 hours from now
    };

    // Add the reserved ticket to the ticket's ReservedTickets array
    ticket.ReservedTickets.push(reservedTicket);

    // Save the updated event
    await event.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log("Ticket reserved successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error reserving ticket:", error);
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting event:", error);
    return;
  }
  res.status(200).end("sucessffuly reserver");
};


export const buyTicket = async (req: Request, res: Response) => {
  const { error } = buyTicketValidator.validate(req.body);
  if (error) {
    // If validation fails, send a 400 (Bad Request) response with the validation error
    res.status(400).end("Invalid body in create event");
    // debugLog(error)
    return;
  }
let {eventId, ticketName, reservedTicketId} = req.body;
let authorID=req.headers['x-user'];
console.log(authorID);
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the event by its ID and acquire a pessimistic lock
    const event = await Event.findById(eventId).session(session).select('tickets').exec();
    if (!event) {
      throw new Error("Event not found");
    }

    // Find the ticket by its name
    const ticketContainingReserved = event.tickets.find(ticket => ticket.name === ticketName);
    if (!ticketContainingReserved) {
      throw new Error("Ticket containing reserved ticket not found");
    }

    // Find the reserved ticket index
    const reservedTicketIndex = ticketContainingReserved.ReservedTickets.findIndex(rt => rt.ticketId.equals(reservedTicketId));
    if (reservedTicketIndex === -1) {
      throw new Error("Reserved ticket not found");
    }

    // Remove the reserved ticket
    ticketContainingReserved.ReservedTickets.splice(reservedTicketIndex, 1);

    // Increment the available quantity of the ticket
    ticketContainingReserved.quantity--;

    // Save the updated event
    await event.save({ session });

    await session.commitTransaction();
    session.endSession();
    
    console.log("Ticket bought successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).end("Internal Server Error");
    console.error("Error in deleting event:", error);
    return;
  }
  res.status(200).end("sucessffuly Bougth");
  //send message broker to make Order entity
};