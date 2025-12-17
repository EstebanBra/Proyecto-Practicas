"use strict";
import Joi from "joi";

export const ofertaPracticaValidation = Joi.object({
  titulo: Joi.string()
    .min(10)
    .max(255)
    .required()
    .messages({
      "string.empty": "El título no puede estar vacío.",
      "string.min": "El título debe tener al menos 10 caracteres.",
      "string.max": "El título no puede exceder los 255 caracteres.",
      "any.required": "El título es obligatorio.",
    }),
  descripcion_cargo: Joi.string()
    .min(50)
    .required()
    .messages({
      "string.empty": "La descripción del cargo no puede estar vacía.",
      "string.min": "La descripción del cargo debe tener al menos 50 caracteres.",
      "any.required": "La descripción del cargo es obligatoria.",
    }),
  requisitos: Joi.string()
    .min(30)
    .required()
    .messages({
      "string.empty": "Los requisitos no pueden estar vacíos.",
      "string.min": "Los requisitos deben tener al menos 30 caracteres.",
      "any.required": "Los requisitos son obligatorios.",
    }),
  duracion: Joi.number()
    .integer()
    .min(1)
    .max(52)
    .required()
    .messages({
      "number.base": "La duración debe ser un número.",
      "number.integer": "La duración debe ser un número entero de semanas.",
      "number.min": "La duración mínima es de 1 semana.",
      "number.max": "La duración máxima es de 52 semanas.",
      "any.required": "La duración es obligatoria.",
    }),
  modalidad: Joi.string()
    .valid("presencial", "online")
    .required()
    .messages({
      "string.empty": "La modalidad no puede estar vacía.",
      "any.only": "La modalidad debe ser 'presencial' u 'online'.",
      "any.required": "La modalidad es obligatoria.",
    }),
  jornada: Joi.string()
    .min(5)
    .max(50)
    .required()
    .messages({
      "string.empty": "La jornada no puede estar vacía.",
      "string.min": "La jornada debe tener al menos 5 caracteres.",
      "string.max": "La jornada no puede exceder los 50 caracteres.",
      "any.required": "La jornada es obligatoria.",
    }),
  ubicacion: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.empty": "La ubicación no puede estar vacía.",
      "string.min": "La ubicación debe tener al menos 5 caracteres.",
      "string.max": "La ubicación no puede exceder los 255 caracteres.",
      "any.required": "La ubicación es obligatoria.",
    }),
  cupos: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      "number.base": "Los cupos deben ser un número.",
      "number.integer": "Los cupos deben ser un número entero.",
      "number.min": "Debe haber al menos 1 cupo disponible.",
      "number.max": "El máximo de cupos es 100.",
      "any.required": "Los cupos son obligatorios.",
    }),
  fecha_limite: Joi.date()
    .min('now')
    .required()
    .messages({
      "date.base": "La fecha límite debe ser una fecha válida.",
      "date.min": "La fecha límite debe ser posterior a la fecha actual.",
      "any.required": "La fecha límite es obligatoria.",
    }),
});