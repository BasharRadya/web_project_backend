import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  CREATE_ORDER_PATH,
  GET_ORDER_BY_EVENT_ID,
  GET_ORDER_BY_USER_ID,
  ERROR_401,
} from "../const.js";
dotenv.config();

const orderServiceHost = process.env.orderService 
|| "http://localhost:3000";
export const orderService = express.Router();
orderService.use((req, res, next) => {
  console.log("Incoming request URL:", req.url);
  next();
});

//routings

orderService.use(
  CREATE_ORDER_PATH,
  createProxyMiddleware({
    target: orderServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/order": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      if(req['user']) {
        proxyReq.setHeader('X-User', req['user']);
      } 
    }
  })
);
orderService.use(
  GET_ORDER_BY_EVENT_ID,
  createProxyMiddleware({
    target: orderServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/order": "",
    },
  })
);
orderService.use(
  GET_ORDER_BY_USER_ID,
  createProxyMiddleware({
    target: orderServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/order": "",
    },
  })
);
