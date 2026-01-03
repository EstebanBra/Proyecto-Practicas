"use strict";
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bitacoradocumentoRoutes from "./bitacoradocumento.routes.js";
import Bitacorasroutes from "./Bitacoras.routes.js";
import comentarioRoutes from "./comentario.routes.js";
import documentoRoutes from "./documento.routes.js";
import evaluacionFinalRoutes from "./evaluacionFinal.routes.js";
import ofertaPracticaRoutes from "./ofertaPractica.routes.js";
import practicaRoutes from "./practica.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/comentario", comentarioRoutes)
    .use("/ofertaPractica", ofertaPracticaRoutes)
    .use("/bitacoradocumento", bitacoradocumentoRoutes)
    .use("/bitacora", Bitacorasroutes)
    .use("/practica", practicaRoutes)
    .use("/documentos", documentoRoutes)
    .use("/evaluaciones", evaluacionFinalRoutes);

export default router;