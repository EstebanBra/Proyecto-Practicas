"use strict";
import { Router } from "express";
import {
  calcularNotaFinal,
  obtenerMiNotaFinal,
  obtenerNotasFinalesEstudiantes,
  obtenerTodasNotasFinales,
  validarPrerequisitosNota,
} from "../controllers/notaFinal.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  isDocenteOrAdmin,
  isEstudiante,
} from "../middlewares/authorization.middleware.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authenticateJwt);

// Calcular nota final (estudiante)
router.post("/calcular", isEstudiante, calcularNotaFinal);

// Validar prerequisitos para calcular nota (estudiante)
router.get("/validar-prerequisitos", isEstudiante, validarPrerequisitosNota);

// Ver mi nota final (estudiante)
router.get("/mi-nota", isEstudiante, obtenerMiNotaFinal);

// Ver notas de estudiantes asignados (docente y admin)
router.get("/estudiantes", isDocenteOrAdmin, obtenerNotasFinalesEstudiantes);

// Ver todas las notas (admin)
router.get("/todas", isDocenteOrAdmin, obtenerTodasNotasFinales);

export default router;
