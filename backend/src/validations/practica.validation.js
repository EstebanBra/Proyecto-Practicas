"use strict";
import Joi from "joi";

export const practicaBodyValidation = Joi.object({
  id_estudiante: Joi.number().integer().required().messages({
    "any.required": "El id del estudiante es obligatorio",
    "number.base": "El id del estudiante debe ser un número entero",
  }),
  id_docente: Joi.number().integer().required().messages({
    "any.required": "El id del docente es obligatorio",
    "number.base": "El id del docente debe ser un número entero",
  }),
  fecha_inicio: Joi.date().optional().messages({
    "date.base": "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)",
  }),
  fecha_fin: Joi.date().optional().min(Joi.ref("fecha_inicio")).messages({
    "date.base": "La fecha de fin debe tener un formato válido (YYYY-MM-DD)",
    "date.min": "La fecha de fin no puede ser anterior a la fecha de inicio",
  }),
  estado: Joi.string()
    .valid("activa", "en_progreso", "finalizada", "cancelada")
    .default("activa")
    .messages({
      "any.only":
        "El estado debe ser uno de: activa, en_progreso, finalizada o cancelada",
    }),
});

export const practicaQueryValidation = Joi.object({
  id_practica: Joi.number().integer().optional(),
  id_estudiante: Joi.number().integer().optional(),
  id_docente: Joi.number().integer().optional(),
});
