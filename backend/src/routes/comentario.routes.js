"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin, isDocente, isDocenteOrEstudiante, isEstudiante } from "../middlewares/authorization.middleware.js";
import { handleMulterErrors, uploadOptionalFiles } from "../middlewares/uploadFiles.middleware.js";

import {
  createComentario,
  deleteComentario,
  downloadArchivoComentario,
  getAllComentarios,
  getComentarioById,
  getComentarios,
  getComentariosByUsuarioId,
  updateComentario,
} from "../controllers/comentario.controller.js";

const router = Router();

router
  .post("/", [authenticateJwt, isEstudiante, uploadOptionalFiles, handleMulterErrors], createComentario)
  .get("/", [authenticateJwt, isDocenteOrEstudiante], getComentarios)
  .get("/todos", [authenticateJwt, isDocente], getAllComentarios)
  .get("/archivo/:id/:archivoIndex", [authenticateJwt, isDocenteOrEstudiante], downloadArchivoComentario)
  .get("/usuario/:usuarioId", [authenticateJwt, isDocenteOrEstudiante], getComentariosByUsuarioId)
  .get("/:id", [authenticateJwt, isDocenteOrEstudiante], getComentarioById)
  .put("/:id", [authenticateJwt, isDocenteOrEstudiante, uploadOptionalFiles, handleMulterErrors], updateComentario)
  .delete("/:id", [authenticateJwt, isDocenteOrEstudiante], deleteComentario);

export default router;