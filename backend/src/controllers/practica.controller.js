"use strict";

import {
  actualizarEstadoPracticaService,
  actualizarPracticaService,
  crearPracticaService,
  obtenerPracticaPorIdService,
  obtenerPracticasEstudianteService,
  obtenerTodasPracticasService,
} from "../services/practica.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  practicaCreateValidation,
  practicaUpdateValidation,
  practicaEstadoValidation,
} from "../validations/practica.validation.js";

/* =======================
   Helpers
======================= */
function validar(schema, data) {
  const { error, value } = schema.validate(data, { abortEarly: true });
  if (error) {
    return [null, error.details[0].message];
  }
  return [value, null];
}

function normalizarTipoPresencia(tipo) {
  if (!tipo) return "presencial";
  const mapa = {
    presencial: "presencial",
    virtual: "virtual",
    hibrido: "hibrido",
    híbrido: "hibrido",
  };
  return mapa[tipo.toLowerCase()] || "presencial";
}

/* =======================
   Controllers
======================= */

export async function crearPracticaController(req, res) {
  try {
    const [datosValidados, errorValidacion] = validar(
      practicaCreateValidation,
      req.body,
    );
    if (errorValidacion) {
      return handleErrorClient(res, 400, errorValidacion);
    }

    const datosPractica = {
      ...datosValidados,
      tipo_presencia: normalizarTipoPresencia(datosValidados.tipo_presencia),
      id_estudiante: req.user.id,
      tipo_practica: "propia",
      estado: "Revision_Pendiente",
    };

    const [practica, error] = await crearPracticaService(datosPractica);
    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 201, "Solicitud de práctica creada con éxito", practica);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerPracticasEstudianteController(req, res) {
  try {
    const [practicas, error] = await obtenerPracticasEstudianteService(
      req.user.id,
    );
    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(
      res,
      200,
      "Prácticas del estudiante obtenidas con éxito",
      practicas,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerTodasPracticasController(req, res) {
  try {
    const [practicas, error] = await obtenerTodasPracticasService();
    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Prácticas obtenidas con éxito", practicas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerPracticaPorIdController(req, res) {
  try {
    const { id } = req.params;
    const [practica, error] = await obtenerPracticaPorIdService(id);
    if (error) return handleErrorClient(res, 404, error);

    if (
      req.user.rol === "estudiante" &&
      practica.id_estudiante !== req.user.id
    ) {
      return handleErrorClient(
        res,
        403,
        "No tiene permiso para ver esta práctica",
      );
    }

    handleSuccess(res, 200, "Práctica recuperada con éxito", practica);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarPracticaController(req, res) {
  try {
    const [datosValidados, errorValidacion] = validar(
      practicaUpdateValidation,
      req.body,
    );
    if (errorValidacion) {
      return handleErrorClient(res, 400, errorValidacion);
    }

    const { id } = req.params;
    const [practicaExistente, errorExistente] =
      await obtenerPracticaPorIdService(id);

    if (errorExistente) return handleErrorClient(res, 404, errorExistente);

    if (practicaExistente.id_estudiante !== req.user.id) {
      return handleErrorClient(
        res,
        403,
        "No tiene permiso para actualizar esta práctica",
      );
    }

    const datosActualizacion = {
      ...datosValidados,
      tipo_presencia: datosValidados.tipo_presencia
        ? normalizarTipoPresencia(datosValidados.tipo_presencia)
        : undefined,
    };

    const [practica, error] = await actualizarPracticaService(
      id,
      datosActualizacion,
    );
    if (error) return handleErrorClient(res, 400, error);

    handleSuccess(res, 200, "Práctica actualizada con éxito", practica);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarEstadoPracticaController(req, res) {
  try {
    const [datosValidados, errorValidacion] = validar(
      practicaEstadoValidation,
      req.body,
    );
    if (errorValidacion) {
      return handleErrorClient(res, 400, errorValidacion);
    }

    const { id } = req.params;
    const { estado, observaciones } = datosValidados;

    const [practica, error] = await actualizarEstadoPracticaService(
      id,
      estado,
      observaciones,
    );
    if (error) return handleErrorClient(res, 404, error);

    handleSuccess(
      res,
      200,
      "Estado de la práctica actualizado con éxito",
      practica,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
