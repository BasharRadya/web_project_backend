import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  CREATE_COMMENT_PATH,
  GET_COMMENT_BY_EVENT_ID,
  GET_COMMENT_BY_USER_ID,
  ERROR_401,
} from "../const.js";
dotenv.config();

const commentServiceHost = process.env.commentService || "http://localhost:3000";

export const commentService = express.Router();
//routings
commentService.use(
  CREATE_COMMENT_PATH,
  createProxyMiddleware({
    target: commentServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/comment": "",
    },
    onProxyReq: (proxyReq, req, res) => {
      if(req['user']) {
        proxyReq.setHeader('X-User', req['user']);
      } 
    }
  })
);
commentService.use(
  GET_COMMENT_BY_EVENT_ID,
  createProxyMiddleware({
    target: commentServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/comment": "",
    },
  })
);
commentService.use(
  GET_COMMENT_BY_USER_ID,
  createProxyMiddleware({
    target: commentServiceHost,
    changeOrigin: true,
    pathRewrite: {
      "^/comment": "",
    },
  })
);
