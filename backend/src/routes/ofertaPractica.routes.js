"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createOfertaPractica,
  deleteOfertaPractica,
  getOfertaPracticaById,
  getOfertasPractica,
  updateOfertaPractica,
} from "../controllers/ofertaPractica.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas públicas (para estudiantes)
router.get("/", getOfertasPractica);
router.get("/:id", getOfertaPracticaById);

// Rutas protegidas (solo para administradores/encargados)
router
  .use(isAdmin)
  .post("/", createOfertaPractica)
  .put("/:id", updateOfertaPractica)
  .delete("/:id", deleteOfertaPractica);

export default router;