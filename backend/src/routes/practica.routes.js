import express from "express";
import practicaController from "../controllers/practica.controller.js";
import { authenticateToken } from "../middlewares/authentication.middleware.js";
import { isEncargadoPracticas, isStudent } from "../middlewares/authentication.middleware.js";
import { practicaBodyValidation } from "../validations/practica.validation.js";

const router = express.Router();

// Middleware de validación
const validarPractica = (req, res, next) => {
    const { error } = practicaBodyValidation.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Rutas para estudiante
router.post("/crear", 
    authenticateToken, 
    isStudent, 
    validarPractica, 
    practicaController.crearPractica
);

router.get("/mis-practicas", 
    authenticateToken, 
    isStudent, 
    practicaController.obtenerPracticasEstudiante
);

router.put("/actualizar/:id", 
    authenticateToken, 
    isStudent, 
    validarPractica, 
    practicaController.actualizarPractica
);

// Rutas para el encargado de práctica
router.get("/todas", 
    authenticateToken, 
    isEncargadoPracticas, 
    practicaController.obtenerTodasPracticas
);

router.put("/estado/:id", 
    authenticateToken, 
    isEncargadoPracticas, 
    practicaController.actualizarEstadoPractica
);

// Rutas compartidas
router.get("/:id", 
    authenticateToken, 
    practicaController.obtenerPracticaPorId
);

export default router;