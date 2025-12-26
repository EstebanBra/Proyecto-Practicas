"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocenteOrAdmin, isEstudiante } from "../middlewares/authorization.middleware.js";
import {
  createOfertaPractica,
  deleteOfertaPractica,
  getOfertaPracticaById,
  getOfertasPractica,
  postularOferta,
  updateOfertaPractica,
} from "../controllers/ofertaPractica.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authenticateJwt);

// Rutas públicas (para cualquier usuario logueado)
router.get("/", getOfertasPractica);
router.get("/:id", getOfertaPracticaById);

// Ruta exclusiva para ESTUDIANTES
router.post("/:id/postular", isEstudiante, postularOferta);

// Rutas de GESTIÓN (Admin O Docente)
router.post("/", isDocenteOrAdmin, createOfertaPractica);
router.put("/:id", isDocenteOrAdmin, updateOfertaPractica);
router.delete("/:id", isDocenteOrAdmin, deleteOfertaPractica);

export default router;