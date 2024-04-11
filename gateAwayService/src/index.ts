import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import { verifyTokenMiddleware } from "./routes/auth.js";
import { check_admin_in_db, userService } from "./routes/userService.js";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const commentServiceUrl = process.env.COMMENT_SERVICE_URL;
const eventServiceUrl = process.env.EVENT_SERVICE_URL;
const orderServiceUrl = process.env.ORDER_SERVICE_URL;
const reservationServiceUrl = process.env.RESERVATION_SERVICE_URL;
const port = process.env.PORT;

const gateway = express();

const requestLoggerMiddleware = (req, _res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`;
  console.log(log);
  next();
};
gateway.use(requestLoggerMiddleware);

check_admin_in_db();

gateway.use(express.urlencoded({ extended: true }));
gateway.use(cookieParser());

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  sameSite: "none",
};

gateway.use(cors(corsOptions));

const connect = async (serviceName: string, serviceHost: string) => {
  gateway.use(`/${serviceName}*`, verifyTokenMiddleware, createProxyMiddleware({
    target: serviceHost,
    changeOrigin: true,
    pathRewrite: {
      [`^/${serviceName}`]: '',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req['user']) {
        proxyReq.setHeader('X-User', req['user']);
      }

    }
  }));
};

gateway.use("/user", userService);
connect('order', orderServiceUrl);
connect('comment', commentServiceUrl);
connect('event', eventServiceUrl);
connect('reservation', reservationServiceUrl);

gateway.get("/", (_req, res) => res.end("Hello from CS nerd AbO bDiR"));

gateway.use((req, res, next) => {
  res.status(404).end("Not found");
});

gateway.listen(port, () => {
  console.log(`gateAway Server running! port ${port}`);
});
