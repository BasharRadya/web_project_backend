import * as mongoose from "mongoose";
import Joi from "joi";

const commentSchema = new mongoose.Schema(
  {
    authorID: { type: String, required: true },
    eventID: { type: String, required: true },
    comment: { type: String, required: true },
    time_stmp: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: "comments_p",
  }
);

export const Comment = mongoose.model("comments_p", commentSchema);

export const commentDetailsValidator = Joi.object({
  eventID: Joi.string().required(),
  comment: Joi.string().required(),
}).unknown(true);
