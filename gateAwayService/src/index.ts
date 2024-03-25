import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./routes/user_src/routes.js";
import { check_admin_in_db, userService } from "./routes/userService.js";
import { eventService } from "./routes/eventService.js";
import { orderService } from "./routes/orderService.js";
import { commentService } from "./routes/commentService.js";

dotenv.config();
const port = process.env.PORT || 3001;
const gateaway = express();
//check if admin in db
check_admin_in_db();

gateaway.use(express.urlencoded({ extended: true }));
//parse cookies
gateaway.use(cookieParser());

//declare routes
// user serivce
gateaway.use("/user", userService);
//order service
gateaway.use("/order", verifyToken, orderService);
//comment service
gateaway.use("/comment", verifyToken, commentService);
//event service
gateaway.use("/event", verifyToken, eventService);


//Root route for HTML of CS nerd AbO bDiR
gateaway.get("/", (req, res) => res.end("Hello from CS nerd AbO bDiR"));
//start listening
gateaway.listen(port, () => {
  console.log(`gateAway Server running! port ${port}`);
});
