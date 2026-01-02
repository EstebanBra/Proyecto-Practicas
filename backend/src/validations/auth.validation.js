"use strict";
import Joi from "joi";

export const authValidation = Joi.object({
  email: Joi.string()
    .min(5)
    .max(100)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "Debe ser un correo electrónico válido.",
      "string.min": "El correo electrónico debe tener al menos 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 100 caracteres.",
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 100 caracteres.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "any.required": "El nombre completo es obligatorio.",
      "string.base": "El nombre completo debe ser de tipo texto.",
      "string.min": "El nombre completo debe tener al menos 5 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 100 caracteres.",
    }),

  rut: Joi.string()
    .min(7)
    .max(20)
    .required()
    .messages({
      "string.empty": "El RUT no puede estar vacío.",
      "string.base": "El RUT debe ser de tipo texto.",
      "string.min": "El RUT debe tener como mínimo 7 caracteres.",
      "string.max": "El RUT debe tener como máximo 20 caracteres.",
    }),

  email: Joi.string()
    .min(5)
    .max(100)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "Debe ser un correo electrónico válido.",
      "string.min": "El correo electrónico debe tener al menos 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 100 caracteres.",
    }),
  rol: Joi.string()
    .valid("estudiante", "docente")
    .required()
    .messages({
      "string.empty": "El rol es obligatorio.",
      "any.only": "El rol debe ser estudiante o docente."
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 100 caracteres.",
    }),
})
  .unknown(false)
  .messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});