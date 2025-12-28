"use strict";
import { body } from "express-validator";

export const validarRegistroBitacora = [
    body("id_practica")
        .notEmpty()
        .withMessage("El ID de la práctica es requerido")
        .isInt()
        .withMessage("El ID de la práctica debe ser un número entero"),

    body("semana")
        .notEmpty()
        .withMessage("La semana es requerida")
        .isInt({ min: 1, max: 52 })
        .withMessage("La semana debe ser un número entre 1 y 52"),

    body("horas_trabajadas")
        .notEmpty()
        .withMessage("Las horas trabajadas son requeridas")
        .isFloat({ min: 1, max: 40 })
        .withMessage("Las horas trabajadas deben estar entre 1 y 40")
        .custom(value => {
            const horas = parseFloat(value);
            if (horas % 0.5 !== 0) {
                throw new Error("Las horas deben registrarse en intervalos de media hora");
            }
            return true;
        }),

    body("descripcion_actividades")
        .notEmpty()
        .withMessage("La descripción de actividades es requerida")
        .isString()
        .withMessage("La descripción debe ser texto")
        .isLength({ min: 100, max: 2000 })
        .withMessage("La descripción debe tener entre 100 y 2000 caracteres")
        .trim()
        .custom(value => {
            if (value.replace(/\s+/g, "").length < 50) {
                throw new Error("La descripción debe contener contenido significativo");
            }
            return true;
        }),

    body("resultados_aprendizajes")
        .notEmpty()
        .withMessage("Los resultados de aprendizaje son requeridos")
        .isString()
        .withMessage("Los resultados deben ser texto")
        .isLength({ min: 50, max: 1000 })
        .withMessage("Los resultados deben tener entre 50 y 1000 caracteres")
        .trim()
        .custom(value => {
            if (value.replace(/\s+/g, "").length < 25) {
                throw new Error("Los resultados deben contener contenido significativo");
            }
            return true;
        })
];
