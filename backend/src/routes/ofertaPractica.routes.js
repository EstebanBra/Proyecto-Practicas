"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocenteOrAdmin, isEstudiante } from "../middlewares/authorization.middleware.js";
import {
  aceptarPostulante,
  rechazarPostulante,
  createOfertaPractica,
  deleteOfertaPractica,
  getMisPostulaciones,
  getOfertaPracticaById,
  getOfertasPractica,
  getPostulantesPorOferta,
  postularOferta,
  updateOfertaPractica,
} from "../controllers/ofertaPractica.controller.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authenticateJwt);

// Ruta para que el estudiante vea sus postulaciones
router.get("/mis-postulaciones", isEstudiante, getMisPostulaciones);

// Ruta para que el docente vea quién postuló a su oferta específica
router.get("/:id/postulantes", isDocenteOrAdmin, getPostulantesPorOferta);

// Rutas públicas (para cualquier usuario logueado)
router.get("/", getOfertasPractica);
router.get("/:id", getOfertaPracticaById);

// Ruta exclusiva para ESTUDIANTES
router.post("/:id/postular", isEstudiante, postularOferta);

// Rutas de GESTIÓN (Admin O Docente)
router.post("/", isDocenteOrAdmin, createOfertaPractica);
router.put("/:id", isDocenteOrAdmin, updateOfertaPractica);
router.delete("/:id", isDocenteOrAdmin, deleteOfertaPractica);
router.post("/aceptar-postulante", isDocenteOrAdmin, aceptarPostulante);
router.post("/rechazar-postulante", isDocenteOrAdmin, rechazarPostulante);

export default router;