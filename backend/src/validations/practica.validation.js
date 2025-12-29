"use strict";
import Joi from "joi";

export const practicaCreateValidation = Joi.object({
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().min(Joi.ref("fecha_inicio")).required(),

  horas_practicas: Joi.number().integer().min(1).required(),
  semanas: Joi.number().integer().min(1).required(),

  tipo_presencia: Joi.string()
    .valid("presencial", "virtual", "hibrido")
    .insensitive()
    .default("presencial"),

  empresa: Joi.string().min(3).max(255).required(),

  supervisor_nombre: Joi.string().min(3).max(255).required(),
  supervisor_email: Joi.string().email().required(),
  supervisor_telefono: Joi.string()
    .pattern(/^\+?[\d\s-]{8,20}$/)
    .required(),

  documentos: Joi.array()
    .items(
      Joi.object({
        nombre: Joi.string().required(),
        url: Joi.string().required(),
        tipo: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),

  observaciones: Joi.string().allow("").max(1000).optional(),

  id_estudiante: Joi.forbidden(),
  id_docente: Joi.forbidden(),
  tipo_practica: Joi.forbidden(),
  estado: Joi.forbidden(),
});

export const practicaUpdateValidation = Joi.object({
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().min(Joi.ref("fecha_inicio")).optional(),

  horas_practicas: Joi.number().integer().min(1).optional(),
  semanas: Joi.number().integer().min(1).optional(),

  tipo_presencia: Joi.string()
    .valid("presencial", "virtual", "hibrido")
    .insensitive()
    .optional(),

  empresa: Joi.string().min(3).max(255).optional(),

  supervisor_nombre: Joi.string().min(3).max(255).optional(),
  supervisor_email: Joi.string().email().optional(),
  supervisor_telefono: Joi.string()
    .pattern(/^\+?[\d\s-]{8,20}$/)
    .optional(),

  documentos: Joi.array()
    .items(
      Joi.object({
        nombre: Joi.string().required(),
        url: Joi.string().required(),
        tipo: Joi.string().required(),
      }),
    )
    .optional(),

  observaciones: Joi.string().allow("").max(1000).optional(),

  id_estudiante: Joi.forbidden(),
  id_docente: Joi.forbidden(),
  tipo_practica: Joi.forbidden(),
  estado: Joi.forbidden(),
});

export const practicaEstadoValidation = Joi.object({
  estado: Joi.string()
    .valid("Aprobada", "Rechazada", "En_Curso", "Finalizada")
    .required(),

  observaciones: Joi.string().allow("").max(1000).optional(),
});
