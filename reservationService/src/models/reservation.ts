import mongoose from "mongoose";
import Joi from "joi";

// Define reservations schema
const reservationSchema = new mongoose.Schema({
  username:String,
  eventID: String,
  ticketName: String,
  amount: Number,
  expiry: {
    type: Date,
    expires: 0, // This sets the TTL index
  },
},{
  collection: "reservations_p",
});
export const Reservation = mongoose.model("reservation", reservationSchema);

export const reservationValidator = Joi.object({
  username: Joi.string().required(),
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  amount: Joi.number().integer().min(1).required(),
}).unknown(true);

export const reservationValidatorRoute = Joi.object({
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  amount: Joi.number().integer().min(1).required(),
}).unknown(true);