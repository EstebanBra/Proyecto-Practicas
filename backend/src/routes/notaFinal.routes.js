"use strict";
import { Router } from "express";
import {
  calcularNotaFinal,
  obtenerMiNotaFinal,
  obtenerNotaFinalById,
  obtenerNotasFinalesEstudiantes,
  obtenerTodasNotasFinales,
  validarPrerequisitosNota,
} from "../controllers/notaFinal.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  isDocenteOrAdmin,
  isEstudiante
} from "../middlewares/authorization.middleware.js";
import { exportarNotasFinalesExcel } from "../middlewares/exportarNotasFinalesExcel.middleware.js";


const router = Router();

router.use(authenticateJwt);

router.post("/calcular", isDocenteOrAdmin, calcularNotaFinal);

router.get("/validar-prerequisitos", isEstudiante, validarPrerequisitosNota);

router.get("/mi-nota", isEstudiante, obtenerMiNotaFinal);

router.get("/estudiantes", isDocenteOrAdmin, obtenerNotasFinalesEstudiantes);

router.get("/todas", isDocenteOrAdmin, obtenerTodasNotasFinales);

router.get("/:id", obtenerNotaFinalById);

router.get(
  "/notas-finales/exportar", isDocenteOrAdmin,
  exportarNotasFinalesExcel,
);

export default router;
