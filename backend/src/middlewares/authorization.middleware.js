import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

async function verifyRole(req, res, next, allowedRoles) {
  try {
    const userRole = req.user.rol;
    
    //'Estudiante' y 'estudiante' valen lo mismo.
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        `Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`
      );
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// 1. Permiso exclusivo para ADMINISTRADORES
export const isAdmin = (req, res, next) => {
    verifyRole(req, res, next, ["administrador"]);
};

// 2. Permiso exclusivo para DOCENTES
export const isDocente = (req, res, next) => {
    verifyRole(req, res, next, ["docente"]);
};

// 3. Permiso exclusivo para ESTUDIANTES
export const isEstudiante = (req, res, next) => {
    verifyRole(req, res, next, ["estudiante"]);
};

// 4. Permiso COMBINADO (Admin o Docente) - Para gestión de ofertas
export const isDocenteOrAdmin = (req, res, next) => {
    verifyRole(req, res, next, ["administrador", "docente"]);
};
