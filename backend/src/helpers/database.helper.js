"use strict";
import { AppDataSource } from "../config/configDb.js";

// Cache de repositorios para evitar múltiples llamadas
const repositoryCache = new Map();

/**
 * Obtiene un repositorio con cache para evitar duplicación
 * @param {string} entityName - Nombre de la entidad
 * @returns {Repository} - Repositorio de TypeORM
 */
export function getRepository(entityName) {
    if (!repositoryCache.has(entityName)) {
        repositoryCache.set(entityName, AppDataSource.getRepository(entityName));
    }
    return repositoryCache.get(entityName);
}

/**
 * Manejo estándar de errores de base de datos
 * @param {Error} error - Error de base de datos
 * @param {string} operation - Operación que falló
 * @returns {string} - Mensaje de error estandarizado
 */
export function handleDbError(error, operation = "operación") {
    console.error(`Error en ${operation}:`, error);

    const errorMessages = {
        "23505": "Ya existe un registro con los mismos datos",
        "23503": "Referencia no válida a datos relacionados",
        "23502": "Falta un campo requerido",
        "23514": "Los datos no cumplen con las restricciones"
    };

    return errorMessages[error.code] || `Error en la ${operation}: ${error.message}`;
}

/**
 * Wrapper estándar para operaciones de servicio
 * @param {Function} operation - Función a ejecutar
 * @param {string} operationName - Nombre de la operación para logging
 * @returns {Array} - [resultado, error]
 */
export async function serviceWrapper(operation, operationName) {
    try {
        const result = await operation();
        return [result, null];
    } catch (error) {
        const errorMessage = handleDbError(error, operationName);
        return [null, errorMessage];
    }
}
