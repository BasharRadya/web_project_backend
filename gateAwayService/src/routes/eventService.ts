import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  GET_EVENT_BY_ID,
  GET_EVENTS,
  PUT_EVENT_BY_ID,
  DELETE_EVENT_BY_ID,
  POST_EVENT,
  RESERVE_TICKET_EVENT,
  BUY_TICKET_EVENT,
  ERROR_401,
} from "../const.js";
dotenv.config();

const eventServiceHost = process.env.eventService 
|| "http://localhost:3004";
export const eventService = express.Router();

//routings
eventService.use(
  GET_EVENTS,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  POST_EVENT,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  GET_EVENT_BY_ID,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  "here",
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  PUT_EVENT_BY_ID,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  RESERVE_TICKET_EVENT,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);
eventService.use(
  BUY_TICKET_EVENT,
  createProxyMiddleware({
    target: eventServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/event": "",
    },onProxyReq: (proxyReq, req, res) => {
      if(req['user'] || req['permission']) {
        proxyReq.setHeader('X-permission', req['permission']);
      } 
    },
  })
);