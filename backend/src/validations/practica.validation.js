"use strict";
import Joi from "joi";

export const practicaBodyValidation = Joi.object({
  id_estudiante: Joi.number().integer().allow(null).messages({
    "number.base": "El id del estudiante debe ser un número entero",
  }),
  id_docente: Joi.number().integer().allow(null).messages({
    "number.base": "El id del docente debe ser un número entero",
  }),
  fecha_inicio: Joi.date().required().messages({
    "any.required": "La fecha de inicio es obligatoria",
    "date.base": "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)",
  }),
  fecha_fin: Joi.date().required().min(Joi.ref("fecha_inicio")).messages({
    "any.required": "La fecha de fin es obligatoria",
    "date.base": "La fecha de fin debe tener un formato válido (YYYY-MM-DD)",
    "date.min": "La fecha de fin no puede ser anterior a la fecha de inicio",
  }),
  horas_practicas: Joi.number().integer().required().min(1).messages({
    "any.required": "Las horas de práctica son obligatorias",
    "number.base": "Las horas de práctica deben ser un número entero",
    "number.min": "Las horas de práctica deben ser mayores a 0",
  }),
  semanas: Joi.number().integer().required().min(1).messages({
    "any.required": "Las semanas de práctica son obligatorias",
    "number.base": "Las semanas deben ser un número entero",
    "number.min": "Las semanas deben ser mayores a 0",
  }),
  tipo_presencia: Joi.string()
    .valid("presencial", "virtual", "hibrido")
    .default("presencial")
    .messages({
      "any.only": "El tipo de presencia debe ser: presencial, virtual o híbrido",
    }),
  tipo_practica: Joi.string()
    .valid("publicada", "propia")
    .required()
    .messages({
      "any.required": "El tipo de práctica es obligatorio",
      "any.only": "El tipo de práctica debe ser: publicada o propia",
    }),
  empresa: Joi.string().required().min(3).max(255).messages({
    "any.required": "La empresa es obligatoria",
    "string.min": "El nombre de la empresa debe tener al menos 3 caracteres",
    "string.max": "El nombre de la empresa no puede exceder 255 caracteres",
  }),
  supervisor_nombre: Joi.string().required().min(3).max(255).messages({
    "any.required": "El nombre del supervisor es obligatorio",
    "string.min": "El nombre del supervisor debe tener al menos 3 caracteres",
    "string.max": "El nombre del supervisor no puede exceder 255 caracteres",
  }),
  supervisor_email: Joi.string().required().email().messages({
    "any.required": "El email del supervisor es obligatorio",
    "string.email": "El email del supervisor debe ser válido",
  }),
  supervisor_telefono: Joi.string().required().pattern(/^\+?[\d\s-]{8,20}$/).messages({
    "any.required": "El teléfono del supervisor es obligatorio",
    "string.pattern.base": "El teléfono del supervisor debe ser válido",
  }),
  documentos: Joi.array().items(Joi.object({
    nombre: Joi.string().required(),
    url: Joi.string().required(),
    tipo: Joi.string().required()
  })).min(1).required().messages({
    "any.required": "Los documentos son obligatorios",
    "array.min": "Debe proporcionar al menos un documento",
  }),
  estado: Joi.string()
    .valid("Revision_Pendiente", "Aprobada", "Rechazada", "En_Curso", "Finalizada")
    .default("Revision_Pendiente")
    .messages({
      "any.only": "El estado debe ser uno de: Revision_Pendiente, Aprobada, Rechazada, En_Curso o Finalizada",
    }),
  observaciones: Joi.string().optional().allow("").max(1000).messages({
    "string.max": "Las observaciones no pueden exceder 1000 caracteres",
  }),
});

export const practicaQueryValidation = Joi.object({
  id_practica: Joi.number().integer().optional(),
  id_estudiante: Joi.number().integer().optional(),
  id_docente: Joi.number().integer().optional(),
  estado: Joi.string().valid("Revision_Pendiente", "Aprobada", "Rechazada", "En_Curso", "Finalizada").optional(),
});
