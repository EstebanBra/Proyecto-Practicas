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
    const { id_practica } = req.body;
    const rolUsuario = req.user.rol;

    if (rolUsuario !== "docente" && rolUsuario !== "administrador") {
      return handleErrorClient(
        res,
        403,
        "Solo docentes o administradores pueden calcular notas finales",
      );
    }

    if (!id_practica) {
      return handleErrorClient(res, 400, "Se requiere el ID de la práctica");
    }

    const [resultado, error] = await calcularNotaFinalService(id_practica);

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

export async function obtenerNotasFinalesEstudiantes(req, res) {
  try {
    const idUsuario = req.user.id;
    const rolUsuario = req.user.rol;

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
      const [notas, error] = await obtenerNotasFinalesDocenteService(idUsuario);

      if (error) {
        return handleErrorClient(res, 400, error);
      }

      resultado = notas;
      mensaje = "Notas de estudiantes asignados obtenidas exitosamente";
    } else {
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

export async function obtenerTodasNotasFinales(req, res) {
  try {
    const rolUsuario = req.user.rol;

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

export async function obtenerNotaFinalById(req, res) {
  try {
    const { id } = req.params;
    const rolUsuario = req.user.rol;
    const idUsuario = req.user.id;

    const [notaFinal, error] = await obtenerNotaFinalByIdService(parseInt(id));

    if (error) {
      return handleErrorClient(res, 404, error);
    }

    if (rolUsuario === "estudiante") {
      if (notaFinal.id_estudiante !== idUsuario) {
        return handleErrorClient(
          res,
          403,
          "No tienes permiso para ver esta nota",
        );
      }
    }

    if (rolUsuario === "docente") {
      const [notasDocente, errorDocente] =
        await obtenerNotasFinalesDocenteService(idUsuario);

      if (errorDocente) {
        return handleErrorClient(res, 400, errorDocente);
      }

      const notaPertenece = notasDocente.some(
        (nota) => nota.id === parseInt(id),
      );

      if (!notaPertenece) {
        return handleErrorClient(
          res,
          403,
          "No tienes permiso para ver esta nota",
        );
      }
    }

    return handleSuccess(
      res,
      200,
      "Nota final obtenida exitosamente",
      notaFinal,
    );
  } catch (error) {
    console.error("Error en obtenerNotaFinalById:", error);
    return handleErrorServer(res, 500, error.message);
  }
}
