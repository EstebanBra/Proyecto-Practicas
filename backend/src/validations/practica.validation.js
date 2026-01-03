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

/**
 * Validación para crear una práctica externa (ingresada por el estudiante)
 */
export const practicaExternaValidation = Joi.object({
  empresa: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "any.required": "El nombre de la empresa es obligatorio",
      "string.min": "El nombre de la empresa debe tener al menos 2 caracteres",
      "string.max": "El nombre de la empresa no puede exceder 255 caracteres",
    }),
  
  supervisor_nombre: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "any.required": "El nombre del supervisor es obligatorio",
      "string.min": "El nombre del supervisor debe tener al menos 2 caracteres",
      "string.max": "El nombre del supervisor no puede exceder 255 caracteres",
    }),
  
  supervisor_email: Joi.string()
    .email()
    .required()
    .messages({
      "any.required": "El email del supervisor es obligatorio",
      "string.email": "El email del supervisor debe ser un correo válido",
    }),
  
  supervisor_telefono: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .min(8)
    .max(20)
    .required()
    .messages({
      "any.required": "El teléfono del supervisor es obligatorio",
      "string.pattern.base": "El teléfono debe contener solo números y caracteres válidos (+, -, espacios, paréntesis)",
      "string.min": "El teléfono debe tener al menos 8 caracteres",
      "string.max": "El teléfono no puede exceder 20 caracteres",
    }),
  
  fecha_inicio: Joi.date()
    .required()
    .messages({
      "any.required": "La fecha de inicio es obligatoria",
      "date.base": "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)",
    }),
  
  fecha_fin: Joi.date()
    .min(Joi.ref("fecha_inicio"))
    .required()
    .messages({
      "any.required": "La fecha de fin es obligatoria",
      "date.base": "La fecha de fin debe tener un formato válido (YYYY-MM-DD)",
      "date.min": "La fecha de fin debe ser posterior a la fecha de inicio",
    }),
  
  horas_practicas: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Las horas de práctica deben ser un número",
      "number.min": "Las horas de práctica deben ser al menos 1",
    }),
  
  semanas: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "El número de semanas es obligatorio",
      "number.base": "Las semanas deben ser un número entero",
      "number.min": "Debe haber al menos 1 semana de práctica",
    }),
  
  tipo_presencia: Joi.string()
    .valid("presencial", "virtual", "hibrido")
    .default("presencial")
    .messages({
      "any.only": "El tipo de presencia debe ser: presencial, virtual o híbrido",
    }),
  
  documentos: Joi.array()
    .items(Joi.string())
    .optional()
    .messages({
      "array.base": "Los documentos deben ser un arreglo de URLs o rutas",
    }),
});

/**
 * Validación para actualizar una práctica externa
 */
export const practicaUpdateValidation = Joi.object({
  empresa: Joi.string()
    .min(2)
    .max(255)
    .optional()
    .messages({
      "string.min": "El nombre de la empresa debe tener al menos 2 caracteres",
      "string.max": "El nombre de la empresa no puede exceder 255 caracteres",
    }),
  
  supervisor_nombre: Joi.string()
    .min(2)
    .max(255)
    .optional()
    .messages({
      "string.min": "El nombre del supervisor debe tener al menos 2 caracteres",
      "string.max": "El nombre del supervisor no puede exceder 255 caracteres",
    }),
  
  supervisor_email: Joi.string()
    .email()
    .optional()
    .messages({
      "string.email": "El email del supervisor debe ser un correo válido",
    }),
  
  supervisor_telefono: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .min(8)
    .max(20)
    .optional()
    .messages({
      "string.pattern.base": "El teléfono debe contener solo números y caracteres válidos (+, -, espacios, paréntesis)",
      "string.min": "El teléfono debe tener al menos 8 caracteres",
      "string.max": "El teléfono no puede exceder 20 caracteres",
    }),
  
  fecha_inicio: Joi.date()
    .optional()
    .messages({
      "date.base": "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)",
    }),
  
  fecha_fin: Joi.date()
    .min(Joi.ref("fecha_inicio"))
    .optional()
    .messages({
      "date.base": "La fecha de fin debe tener un formato válido (YYYY-MM-DD)",
      "date.min": "La fecha de fin debe ser posterior a la fecha de inicio",
    }),
  
  horas_practicas: Joi.number()
    .integer()
    .min(199)
    .optional()
    .messages({
      "number.base": "Las horas de práctica deben ser un número",
      "number.min": "Las horas de práctica deben ser al menos 199 horas",
    }),
  
  semanas: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Las semanas deben ser un número entero",
      "number.min": "Debe haber al menos 1 semana de práctica",
    }),
  
  tipo_presencia: Joi.string()
    .valid("presencial", "virtual", "hibrido")
    .optional()
    .messages({
      "any.only": "El tipo de presencia debe ser: presencial, virtual o híbrido",
    }),
});
