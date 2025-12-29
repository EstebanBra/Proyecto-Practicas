"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isDocenteOrAdmin, isEstudiante } from "../middlewares/authorization.middleware.js";
import {
    crearPracticaExterna,
    obtenerMiPractica,
    obtenerMisPracticas,
    obtenerPracticaPorId,
    actualizarPractica,
    finalizarPractica,
    obtenerTodasPracticas,
    asignarDocente,
    calificarPractica
} from "../controllers/practica.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// ===== RUTAS PARA ESTUDIANTES =====

// Crear práctica externa (solo estudiantes)
router.post("/externa", isEstudiante, crearPracticaExterna);

// Obtener mi práctica actual
router.get("/mi-practica", isEstudiante, obtenerMiPractica);

// Obtener todas mis prácticas
router.get("/mis-practicas", isEstudiante, obtenerMisPracticas);

// Actualizar mi práctica
router.put("/:id", isEstudiante, actualizarPractica);

// Finalizar mi práctica
router.patch("/:id/finalizar", isEstudiante, finalizarPractica);


// ===== RUTAS PARA DOCENTES/ADMIN =====

// Obtener todas las prácticas (docentes y admin)
router.get("/todas", isDocenteOrAdmin, obtenerTodasPracticas);

// Asignar docente a práctica
router.patch("/:id/asignar-docente", isDocenteOrAdmin, asignarDocente);

// Calificar práctica
router.patch("/:id/calificar", isDocenteOrAdmin, calificarPractica);


// ===== RUTAS PÚBLICAS (usuarios autenticados) =====

// Obtener práctica por ID (cualquier usuario logueado)
router.get("/:id", obtenerPracticaPorId);

export default router;
