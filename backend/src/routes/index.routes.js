"use strict";
import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import documentoRoutes from "./documentos_finales.routes.js";
import evaluacionRoutes from "./evaluaciones_finales.routes.js";
import practicaRoutes from "./practica.routes.js";
const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/documentos", documentoRoutes)
  .use("/evaluaciones", evaluacionRoutes)
  .use("/practicas", practicaRoutes);

export default router;
