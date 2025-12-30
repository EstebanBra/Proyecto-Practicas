"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  calcularNotaFinalService,
  obtenerNotaFinalEstudianteService,
  obtenerNotasFinalesDocenteService,
  obtenerTodasNotasFinalesService,
  validarPrerequisitosNotaService,
} from "../services/notaFinal.service.js";

export async function calcularNotaFinal(req, res) {
  try {
    const idEstudiante = req.user.id;
    const rolUsuario = req.user.rol;

    if (rolUsuario !== "estudiante") {
      return handleErrorClient(
        res,
        403,
        "Solo los estudiantes pueden calcular su nota final",
      );
    }

    // Primero validar prerequisitos
    const [validacion, errorValidacion] =
      await validarPrerequisitosNotaService(idEstudiante);

    if (errorValidacion) {
      return handleErrorClient(res, 400, errorValidacion);
    }

    console.log("Validación exitosa, calculando nota...");

    const [resultado, error] = await calcularNotaFinalService(idEstudiante);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(
      res,
      200,
      "Nota final calculada exitosamente",
      resultado,
    );
  } catch (error) {
    console.error("Error en calcularNotaFinal:", error);
    return handleErrorServer(res, 500, error.message);
  }
}

/**
 * Validar prerequisitos para calcular nota (estudiante)
 */
export async function validarPrerequisitosNota(req, res) {
  try {
    const idEstudiante = req.user.id;
    const rolUsuario = req.user.rol;

    if (rolUsuario !== "estudiante") {
      return handleErrorClient(
        res,
        403,
        "Solo los estudiantes pueden validar prerequisitos",
      );
    }

    const [validacion, error] =
      await validarPrerequisitosNotaService(idEstudiante);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(
      res,
      200,
      "Validación de prerequisitos completada",
      validacion,
    );
  } catch (error) {
    console.error("Error en validarPrerequisitosNota:", error);
    return handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener mi nota final (estudiante)
 */
export async function obtenerMiNotaFinal(req, res) {
  try {
    const idEstudiante = req.user.id;
    const rolUsuario = req.user.rol;

    if (rolUsuario !== "estudiante") {
      return handleErrorClient(
        res,
        403,
        "Solo los estudiantes pueden ver su nota final",
      );
    }

    const [notaFinal, error] =
      await obtenerNotaFinalEstudianteService(idEstudiante);

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    return handleSuccess(
      res,
      200,
      "Nota final obtenida exitosamente",
      notaFinal,
    );
  } catch (error) {
    console.error("Error en obtenerMiNotaFinal:", error);
    return handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener notas finales de estudiantes (docente y admin)
 */
export async function obtenerNotasFinalesEstudiantes(req, res) {
  try {
    const idUsuario = req.user.id;
    const rolUsuario = req.user.rol;

    // Solo docente o admin pueden ver notas de estudiantes
    if (rolUsuario !== "docente" && rolUsuario !== "administrador") {
      return handleErrorClient(
        res,
        403,
        "No tienes permiso para ver estas notas",
      );
    }

    let resultado;
    let mensaje;

    if (rolUsuario === "docente") {
      // Docente ve solo sus estudiantes asignados
      const [notas, error] = await obtenerNotasFinalesDocenteService(idUsuario);

      if (error) {
        return handleErrorClient(res, 400, error);
      }

      resultado = notas;
      mensaje = "Notas de estudiantes asignados obtenidas exitosamente";
    } else {
      // Admin ve todas las notas
      const [notas, error] = await obtenerTodasNotasFinalesService();

      if (error) {
        return handleErrorClient(res, 400, error);
      }

      resultado = notas;
      mensaje = "Todas las notas finales obtenidas exitosamente";
    }

    return handleSuccess(res, 200, mensaje, resultado);
  } catch (error) {
    console.error("Error en obtenerNotasFinalesEstudiantes:", error);
    return handleErrorServer(res, 500, error.message);
  }
}

/**
 * Obtener todas las notas finales (solo admin)
 */
export async function obtenerTodasNotasFinales(req, res) {
  try {
    const rolUsuario = req.user.rol;

    // Solo admin puede ver todas las notas
    if (rolUsuario !== "administrador") {
      return handleErrorClient(
        res,
        403,
        "Solo los administradores pueden ver todas las notas",
      );
    }

    const [notas, error] = await obtenerTodasNotasFinalesService();

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(
      res,
      200,
      "Todas las notas finales obtenidas exitosamente",
      notas,
    );
  } catch (error) {
    console.error("Error en obtenerTodasNotasFinales:", error);
    return handleErrorServer(res, 500, error.message);
  }
}
