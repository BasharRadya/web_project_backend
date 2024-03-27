import * as mongoose from "mongoose";
import Joi from "joi";
const eventSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    description: String,
    organizer: String,
    start_date: Date,
    end_date: Date,
    location: String,
    image: String,
    tickets: [
      {
        name: String,
        quantity: Number,
        price: Number,
    ReservedTickets: [
      {
        ticketId: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
        },
        expiry: {
          type: Date,
          expires: 0, // This sets the TTL index
        },
      },
    ],
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
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref("start_date")).required(),
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
  reservedTicketId: Joi.string().required(),
}).unknown(true);
export const reserveTicketValidator = Joi.object({
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
}).unknown(true);