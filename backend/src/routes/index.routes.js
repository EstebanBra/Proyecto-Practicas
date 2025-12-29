"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import comentarioRoutes from "./comentario.routes.js";
import ofertaPracticaRoutes from "./ofertaPractica.routes.js";
import bitacoradocumentoRoutes from "./bitacoradocumento.routes.js";
import Bitacorasroutes from "./Bitacoras.routes.js";
import practicaRoutes from "./practica.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/comentario", comentarioRoutes)
    .use("/ofertaPractica", ofertaPracticaRoutes)
    .use("/bitacoradocumento", bitacoradocumentoRoutes)
    .use("/bitacora", Bitacorasroutes)
    .use("/practica", practicaRoutes);

export default router;