import express from "express";
import multer from "multer";
import practicaController from "../controllers/practica.controller.js";
import { authenticateToken } from "../middlewares/authentication.middleware.js";
import { isEncargadoPracticas, isStudent } from "../middlewares/authentication.middleware.js";
import { practicaBodyValidation } from "../validations/practica.validation.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

//middleware de validación - validar solo campos de texto, no archivos
const validarPracticaForm = (req, res, next) => {
    // Crear objeto sin los campos de archivo
    const bodyToValidate = { ...req.body };
    delete bodyToValidate.documentos;
    
    const { error } = practicaBodyValidation.validate(bodyToValidate);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ 
                status: "Client error",
                message: "El archivo excede el tamaño máximo permitido (10MB)" 
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ 
                status: "Client error",
                message: "Se excedió el número máximo de archivos permitidos (5)" 
            });
        }
        return res.status(400).json({ 
            status: "Client error",
            message: `Error al subir archivo: ${err.message}` 
        });
    }
    if (err) {
        return res.status(400).json({ 
            status: "Client error",
            message: err.message || "Error al procesar archivos" 
        });
    }
    next();
};

//rutas para estudiante
router.post("/crear", 
    authenticateToken, 
    isStudent,
    upload.array("documentos", 5),
    handleMulterError,
    validarPracticaForm,
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
    validarPracticaForm, 
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