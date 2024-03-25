import * as mongoose from "mongoose";
import Joi from "joi";
const orderSchema = new mongoose.Schema(
  {
    authorID: { type: String, required: true },
    eventID: { type: String, required: true },
    EventTicketType: { type: String, required: true },
    time_stmp: { type: Date, default: Date.now },
  },
  {
    collection: "orders_p",
  }
);
export const Order = mongoose.model("orders_p", orderSchema);

export const orderDetailsValidator = Joi.object({
  authorID: Joi.string().required(),
  eventID: Joi.string().required(),
  EventTicketType: Joi.string().required(),
}).unknown(true);
