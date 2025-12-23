import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    const rolUser = userFound.rol;

    if (rolUser !== "administrador") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de administrador para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

export async function isDocente(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    const rolUser = userFound.rol;

    if (rolUser !== "docente") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de docente para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

export async function isEstudiante(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos",
      );
    }

    const rolUser = userFound.rol;

    if (rolUser !== "estudiante") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de estudiante para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

export async function isDocenteOrEstudiante(req, res, next) {
  try {
    // Verifica que el middleware de autenticación haya establecido req.user
    if (!req.user) {
      return handleErrorClient(res, 401, "Usuario no autenticado.");
    }

    const { id, rol } = req.user;

    // Verifica que el payload del token contenga la información necesaria.
    if (!id || !rol) {
      return handleErrorClient(
        res,
        400,
        "Token inválido: no contiene la información de usuario requerida (id, rol)."
      );
    }

    if (rol !== "docente" && rol !== "estudiante") {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado",
        `Tu rol '${rol}' no tiene permiso para realizar esta acción.`
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}