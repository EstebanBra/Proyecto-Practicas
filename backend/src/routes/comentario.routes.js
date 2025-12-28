"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin, isDocente, isDocenteOrEstudiante, isEstudiante } from "../middlewares/authorization.middleware.js";
import { uploadOptionalFiles, handleMulterErrors } from "../middlewares/uploadFiles.middleware.js";

import {
  createComentario,
  deleteComentario,
  getAllComentarios,
  getComentarioById,
  getComentarios,
  getComentariosByUsuarioId,
  updateComentario,
} from "../controllers/comentario.controller.js";

const router = Router();

router
  .post("/", [authenticateJwt, isDocenteOrEstudiante, uploadOptionalFiles, handleMulterErrors], createComentario)
  .get("/", [authenticateJwt, isDocenteOrEstudiante], getComentarios)
  .get("/todos", [authenticateJwt, isDocente], getAllComentarios)
  .get("/usuario/:usuarioId", [authenticateJwt, isDocenteOrEstudiante], getComentariosByUsuarioId)
  .get("/:id", [authenticateJwt, isDocenteOrEstudiante], getComentarioById)
  .put("/:id", [authenticateJwt, isEstudiante, uploadOptionalFiles, handleMulterErrors], updateComentario)
  .delete("/:id", [authenticateJwt, isDocenteOrEstudiante], deleteComentario);

export default router;