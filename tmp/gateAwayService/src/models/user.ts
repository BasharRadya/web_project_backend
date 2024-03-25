import * as mongoose from "mongoose";
import Joi from "joi";
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    permission: { type: String, required: true },
  },
  {
    collection: "UserAuthData_p",
  }
);
export const User = mongoose.model("UserAuthData_p", userSchema);

export const userDetailsValidator = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
}).unknown(true);

export const changePermissionValidator = Joi.object({
  username: Joi.string().required(),
  permission: Joi.string().required(),
}).unknown(true);
