"use strict";
import passport from "passport";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export const authenticateToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return handleErrorServer(
        res,
        500,
        "Error de autenticación en el servidor"
      );
    }

    if (!user) {
      return handleErrorClient(
        res,
        401,
        "No tienes permiso para acceder a este recurso",
        { info: info ? info.message : "No se encontró el usuario" }
      )
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const isStudent = (req, res, next) => {
  if (!req.user) {
    return handleErrorClient(res, 401, "No has iniciado sesión");
  }

  if (req.user.rol !== "estudiante") {
    return handleErrorClient(res, 403, "No tienes permisos de estudiante");
  }

  next();
};

export const isEncargadoPracticas = (req, res, next) => {
  if (!req.user) {
    return handleErrorClient(res, 401, "No has iniciado sesión");
  }

  if (req.user.rol !== "encargado_practicas") {
    return handleErrorClient(res, 403, "No tienes permisos de encargado de prácticas");
  }

  next();
};