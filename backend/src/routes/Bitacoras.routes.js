"use strict";
import { Router } from "express";
import {
    actualizarEstadoBitacora,
    buscarBitacorasPorRut,
    eliminarBitacora,
    obtenerBitacora,
    obtenerBitacorasPorPractica,
    obtenerMiPractica,
    obtenerUltimaSemana,
    registrarBitacora
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

    //  El estudiante consulta su propia práctica
    .get("/mi-practica", 
        verificarRol(["estudiante"]), 
        obtenerMiPractica)

    // Ruta para buscar bitácoras por RUT (solo docentes y administradores)
    .get("/buscar-rut/:rut",
        verificarRol(["docente", "administrador"]),
        buscarBitacorasPorRut)

    // Ruta para actualizar estado de bitácora (solo docentes y administradores)
    .put("/:id/estado",
        verificarRol(["docente", "administrador"]),
        actualizarEstadoBitacora)

    // Ruta para eliminar una bitácora (solo docentes y administradores)
    .delete("/:id",
        verificarRol(["docente", "administrador"]),
        eliminarBitacora)

    // Ruta para obtener una bitácora específica
    .get("/:id", obtenerBitacora)

    // Ruta para obtener todas las bitácoras de una práctica
    .get("/practica/:id_practica", obtenerBitacorasPorPractica)

    // Ruta para obtener la última semana registrada de una práctica
    .get("/ultima-semana/:id_practica", obtenerUltimaSemana);

export default router;
