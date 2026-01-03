"use strict";
import { Router } from "express";
import {
    actualizarEstadoDocumento,
    descargarDocumento,
    obtenerDocumentosPractica,
    registrarDocumento,
    subirArchivo
} from "../controllers/bitacoradocumento.controller.js";
import { verificarToken } from "../middlewares/authentication.middleware.js";
import { verificarRol } from "../middlewares/authorization.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router
    // Middleware de autenticación para todas las rutas
    .use(verificarToken)

    // Subir archivo (estudiantes)
    .post("/subir",
        verificarRol(["estudiante"]),
        uploadDocument.any(),
        subirArchivo)

    // Registrar documento en base de datos (estudiantes)
    .post("/registrar",
        verificarRol(["estudiante"]),
        registrarDocumento)

    // Descargar documento (profesores, coordinadores y estudiantes)
    .get("/descargar/:id_documento",
        verificarRol(["estudiante", "profesor", "coordinador", "docente", "administrador"]),
        descargarDocumento)

    // Obtener documentos de una práctica
    .get("/practica/:id_practica",
        obtenerDocumentosPractica)

    // Actualizar estado de documento (profesores y coordinadores)
    .put("/:id_documento/estado",
        verificarRol(["profesor", "coordinador"]),
        actualizarEstadoDocumento);

export default router;
