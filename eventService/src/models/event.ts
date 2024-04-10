  import * as mongoose from "mongoose";
import Joi from "joi";
const eventSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    description: String,
    organizer: String,
    start_date: String,
    end_date: String,
    location: String,
    image: String,
    tickets: [
      {
        name: String,
        quantity: Number,
        originalQuantity: Number,
        price: Number,
    }
  ],
  },
  {
    collection: "events_p",
  }
);
export const Event = mongoose.model("events_p", eventSchema);

export const eventSchemaValidator = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().required(),
  organizer: Joi.string().required(),
  start_date: Joi.string().required(),
  end_date: Joi.string().required(),
  location: Joi.string().required(),
  image: Joi.string().optional(),
  tickets: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(0).required(),
        price: Joi.number().min(0).required(),
      }).unknown(true)
    )
    .required(),
}).unknown(true);

export const buyTicketValidator = Joi.object({
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  cc: Joi.string().required(),
  holder: Joi.string().required(),
  cvv: Joi.string().required(),
  exp: Joi.string().required(),
}).unknown(true);
export const reservationValidatorRoute = Joi.object({
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  amount: Joi.number().integer().min(1).required(),
}).unknown(true);