"use strict";
import Joi from "joi";

export const evaluacionBodyValidation = Joi.object({
  id_documento: Joi.number().integer().required().messages({
    "any.required": "El id del documento es obligatorio",
    "number.base": "El id del documento debe ser numérico",
  }),
  nota: Joi.number().min(1).max(7).required().messages({
    "number.base": "La nota debe ser un número",
    "number.min": "La nota mínima es 1.0",
    "number.max": "La nota máxima es 7.0",
    "any.required": "Debe indicar la nota de la evaluación",
  }),
  comentario: Joi.string().allow("", null).max(1000).messages({
    "string.max": "El comentario no puede superar los 1000 caracteres",
  }),
});

export const evaluacionUpdateValidation = Joi.object({
  nota: Joi.number().min(1).max(7).optional().messages({
    "number.base": "La nota debe ser un número",
    "number.min": "La nota mínima es 1.0",
    "number.max": "La nota máxima es 7.0",
  }),
  comentario: Joi.string().allow("", null).max(1000).messages({
    "string.max": "El comentario no puede superar los 1000 caracteres",
  }),
});
