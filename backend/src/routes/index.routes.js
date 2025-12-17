"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import comentarioRoutes from "./comentario.routes.js";
import practicaRoutes from "./practica.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/comentario", comentarioRoutes)
    .use("/practicas", practicaRoutes);

export default router;