"use strict";
import joi from "joi";

export const comentarioBodyValidation = joi.object({
    mensaje: joi.string().max(500).required().min(5).messages({
        "string.empty": "El mensaje no puede estar vacío.",
        "string.base": "El mensaje debe ser de tipo string.",
        "string.min": "El mensaje debe tener al menos 5 caracteres.",
        "string.max": "El mensaje no puede exceder los 500 caracteres.",
    }),
    usuarioId: joi.number().required().messages({
        "number.base": "El ID de usuario debe ser un número.",
        "number.empty": "El ID de usuario no puede estar vacío.",
    }),
    estado: joi.string().valid("Abierto", "Respondido", "Pendiente").default("Pendiente").messages({
        "string.base": "El estado debe ser de tipo string.",
        "any.only": "El estado debe ser 'Abierto' , 'Respondido' o 'Pendiente'.",
    }),
    nivelUrgencia: joi.string().valid("normal", "alta").default("normal").messages({
        "string.base": "El nivel de urgencia debe ser de tipo string.",
        "any.only": "El nivel de urgencia debe ser 'normal' o 'alta'.",
    }),
    tipoProblema: joi.string().min(4).max(50).valid("Personal", "General", "De Empresa").default("General").messages({
        "string.base": "El tipo de problema debe ser de tipo string.",
        "string.min": "El tipo de problema debe tener al menos 4 caracteres.",
        "string.empty": "El tipo de problema no puede estar vacío.",
        "string.max": "El tipo de problema no puede exceder los 50 caracteres.",
        "string.pattern.base": "El tipo de problema debe ser 'Personal', 'General' o 'De Empresa'.",
    })
});

export const comentarioIdValidation = joi.object({
    id: joi.number().required().messages({
        "number.base": "El ID debe ser un número.",
        "number.empty": "El ID no puede estar vacío.",
        "number.required": "El ID es obligatorio.",
        "number.positive": "El ID debe ser un número positivo."
    }),
});

export const ComentarioqueryValidation = joi.object({   
    usuarioId: joi.number().integer().optional(),
    estado: joi.string().valid("Abierto", "Respondido", "Pendiente").optional(),
    nivelUrgencia: joi.string().valid("normal", "alta").optional(),
    tipoProblema: joi.string().min(4).max(50).valid("Personal", "General", "De Empresa").optional(),
    mensaje: joi.string().max(500).optional()
});
