"use strict";

import Joi from "joi";

export const documentoEstadoValidation = Joi.object({
  estado_revision: Joi.string()
    .valid("pendiente", "revisado")
    .required()
    .messages({
      "any.required": "Debe indicar el nuevo estado del documento",
      "any.only": "El estado debe ser 'pendiente', 'revisado'",
    }),
});
