"use strict";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("No se proporcionó un token de autorización");
  }
  const token = authHeader.split(" ")[1];
  
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error("Error de verificación del token:", err); // Log detallado del error
      return res.status(403).send("Token inválido");
    }
    req.user = user;
    next();
  });
};