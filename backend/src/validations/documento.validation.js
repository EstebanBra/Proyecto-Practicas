"use strict";
import Joi from "joi";

export const documentoEstadoValidation = Joi.object({
  estado_revision: Joi.string()
    .valid("pendiente", "revisado")
    .required()
    .messages({
      "any.required": "Debe indicar el nuevo estado del documento",
      "any.only": "El estado debe ser 'pendiente' o 'revisado'",
    }),
});

export const documentoSubidaValidation = Joi.object({
  id_practica: Joi.number().integer().positive().required().messages({
    "any.required": "El id de la práctica es obligatorio",
    "number.base": "El id de la práctica debe ser numérico",
    "number.positive": "El id de la práctica debe ser positivo",
  }),
  tipo: Joi.string()
    .valid("informe", "autoevaluacion")
    .required()
    .messages({
      "any.required": "Debe indicar el tipo de documento",
      "any.only": "El tipo debe ser 'informe' o 'autoevaluacion'",
    }),
});
