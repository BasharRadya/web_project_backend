import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
    CREATE_RESERVATION_PATH,
    REMOVE_RESERVATION_BY_USER_ID,
    GET_RESRVATION_BY_IDEVENT_TICKETNAME,
  ERROR_401,
} from "../const.js";
dotenv.config();

const reservationServiceHost = process.env.reservationService 
|| "http://localhost:3013";
export const reservationService = express.Router();
reservationService.use((req, res, next) => {
  console.log("Incoming request URL:", req.url);
  next();
});

//routings

reservationService.use(
  CREATE_RESERVATION_PATH,
  createProxyMiddleware({
    target: reservationServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/reservation": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      if(req['user']) {
        proxyReq.setHeader('X-User', req['user']);
      } 
    }
  })
);
reservationService.use(
  GET_RESRVATION_BY_IDEVENT_TICKETNAME,
  createProxyMiddleware({
    target: reservationServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/reservation": "",
    },
  })
);
reservationService.use(
    REMOVE_RESERVATION_BY_USER_ID,
  createProxyMiddleware({
    target: reservationServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/reservation": "",
    },
  })
);
