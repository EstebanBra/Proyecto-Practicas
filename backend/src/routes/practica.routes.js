"use strict";
"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

import {
  actualizarEstadoPracticaController,
  actualizarPracticaController,
  crearPracticaController,
  obtenerPracticaPorIdController,
  obtenerPracticasEstudianteController,
  obtenerTodasPracticasController,
} from "../controllers/practica.controller.js";
import {
  isDocente,
  isEstudiante,
} from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);

router.post("/crear", isEstudiante, crearPracticaController);

router.get("/mis-practicas", obtenerPracticasEstudianteController,);

router.put("/actualizar/:id", isEstudiante, actualizarPracticaController);

router.get("/todas", isDocente, obtenerTodasPracticasController);

router.put("/estado/:id", isDocente, actualizarEstadoPracticaController);

router.get("/:id", obtenerPracticaPorIdController);

export default router;
