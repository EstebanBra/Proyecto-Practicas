"use strict";

import {
  crearAutoevaluacionService,
  crearEvaluacionService,
  getAutoevaluacionByEstudianteService,
  getEvaluacionByDocumentoService,
  getEvaluacionesByDocenteService,
  updateEvaluacionService,
} from "../services/evaluaciones_finales.service.js";

import {
  autoevaluacionBodyValidation,
  evaluacionUpdateValidation,
} from "../validations/evaluaciones_finales.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function crearEvaluacion(req, res) {
  try {
    const id_usuario = req.user.id;
    const rol_usuario = req.user.rol;

    if (!id_usuario)
      return handleErrorClient(
        res,
        400,
        "No se pudo obtener el ID del usuario autenticado",
      );

    const { error } = evaluacionBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const evaluacionData = {
      id_documento: req.body.id_documento,
      nota: req.body.nota,
      comentario: req.body.comentario,
      id_usuario,
      rol_usuario,
    };

    const [evaluacion, errorEval] =
      await crearEvaluacionService(evaluacionData);
    if (errorEval) return handleErrorClient(res, 500, errorEval);

    handleSuccess(res, 201, "Evaluación registrada correctamente", evaluacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function crearAutoevaluacion(req, res) {
  try {
    const id_usuario = req.user.id;
    const rol_usuario = req.user.rol;

    if (!id_usuario)
      return handleErrorClient(
        res,
        400,
        "No se pudo obtener el ID del estudiante autenticado",
      );

    const { error } = autoevaluacionBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, error.message);

    const evaluacionData = {
      id_documento: req.body.id_documento,
      nota: req.body.nota,
      comentario: req.body.comentario,
      id_usuario,
      rol_usuario,
    };

    const [autoevaluacion, errorAuto] =
      await crearAutoevaluacionService(evaluacionData);
    if (errorAuto) return handleErrorClient(res, 500, errorAuto);

    handleSuccess(
      res,
      201,
      "Autoevaluación registrada correctamente",
      autoevaluacion,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEvaluacionByDocumento(req, res) {
  try {
    const { id_documento } = req.params;

    const [evaluaciones, errorEval] =
      await getEvaluacionByDocumentoService(id_documento);

    if (errorEval) return handleErrorClient(res, 404, errorEval);

    handleSuccess(res, 200, "Evaluaciones encontradas", evaluaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEvaluacion(req, res) {
  try {
    const { id } = req.params;
    const { error } = evaluacionUpdateValidation.validate(req.body);

    if (error) return handleErrorClient(res, 400, error.message);

    const [evaluacion, errorEval] = await updateEvaluacionService(id, req.body);
    if (errorEval) return handleErrorClient(res, 404, errorEval);

    handleSuccess(res, 200, "Evaluación actualizada correctamente", evaluacion);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getEvaluacionesByDocente(req, res) {
  try {
    const id_usuario = req.user.id;
    if (!id_usuario)
      return handleErrorClient(
        res,
        400,
        "No se pudo obtener el ID del docente autenticado",
      );

    const [evaluaciones, errorEval] =
      await getEvaluacionesByDocenteService(id_usuario);

    if (errorEval) {
      return handleErrorClient(res, 404, errorEval);
    }

    if (!evaluaciones || evaluaciones.length === 0) {
      return res.status(204).send(); // O 404 con mensaje
    }

    handleSuccess(
      res,
      200,
      "Evaluaciones del docente encontradas",
      evaluaciones,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAutoevaluacionByEstudiante(req, res) {
  try {
    const id_usuario = req.user.id;
    if (!id_usuario)
      return handleErrorClient(
        res,
        400,
        "No se pudo obtener el ID del estudiante autenticado",
      );

    const [autoevaluacion, errorAuto] =
      await getAutoevaluacionByEstudianteService(id_usuario);

    if (errorAuto) {
      return handleErrorClient(res, 404, errorAuto);
    }

    if (!autoevaluacion || autoevaluacion.length === 0) {
      return res.status(204).send(); // O 404 con mensaje
    }

    handleSuccess(
      res,
      200,
      "Autoevaluaciones del estudiante encontradas",
      autoevaluacion,
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}