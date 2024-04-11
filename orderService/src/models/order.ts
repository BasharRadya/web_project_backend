import * as mongoose from "mongoose";
import Joi from "joi";
const orderSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    eventID: { type: String, required: true },
    ticketName: { type: String, required: true },
    quantity: { type: Number, required: true },
    time_stmp: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: "orders_p",
  }
);
export const Order = mongoose.model("orders_p", orderSchema);

export const orderDetailsValidator = Joi.object({
  username: Joi.string().required(),
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
}).unknown(true);
export const orderDetailsValidatorRoute = Joi.object({
  eventID: Joi.string().required(),
  ticketName: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
}).unknown(true);
