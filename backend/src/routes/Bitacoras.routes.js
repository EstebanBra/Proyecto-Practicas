"use strict";
import { Router } from "express";
import {
    obtenerBitacora,
    obtenerBitacorasPorPractica,
    obtenerUltimaSemana,
    registrarBitacora,
    buscarBitacorasPorRut
} from "../controllers/Bitacoras.controller.js";
import { verificarToken } from "../middlewares/authentication.middleware.js";
import { verificarRol } from "../middlewares/authorization.middleware.js";
import { uploadBitacora } from "../middlewares/upload.middleware.js";
import { validarRegistroBitacora } from "../validations/bitacora.validation.js";

const router = Router();

router
    // Rutas protegidas que requieren autenticación
    .use(verificarToken)

    // Ruta para registrar una nueva bitácora (solo estudiantes)
    .post("/registrar",
        verificarRol(["estudiante"]),
        uploadBitacora.any(),
        validarRegistroBitacora,
        registrarBitacora)

    // Ruta para buscar bitácoras por RUT (solo docentes y administradores)
    .get("/buscar-rut/:rut",
        verificarRol(["docente", "administrador"]),
        buscarBitacorasPorRut)

    // Ruta para obtener una bitácora específica
    .get("/:id", obtenerBitacora)

    // Ruta para obtener todas las bitácoras de una práctica
    .get("/practica/:id_practica", obtenerBitacorasPorPractica)

    // Ruta para obtener la última semana registrada de una práctica
    .get("/ultima-semana/:id_practica", obtenerUltimaSemana);

export default router;
