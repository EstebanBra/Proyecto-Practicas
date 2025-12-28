"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import comentarioRoutes from "./comentario.routes.js";
import bitacoradocumentoRoutes from "./bitacoradocumento.routes.js";
import Bitacorasroutes from "./Bitacoras.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/comentario", comentarioRoutes)
    .use("/bitacoradocumento", bitacoradocumentoRoutes)
    .use("/bitacora", Bitacorasroutes);

export default router;