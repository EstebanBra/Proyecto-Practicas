"use strict";
import { AppDataSource } from "../config/configDb.js";

const documentoRepository = AppDataSource.getRepository("BitacorasDocumento");
const practicaRepository = AppDataSource.getRepository("Practica");

// Constantes para reutilizar
const FORMATOS_PERMITIDOS = ["pdf", "docx", "zip", "rar"];
const ESTADOS_REVISION = ["pendiente", "aprobado", "rechazado"];
const CAMPOS_REQUERIDOS = ["id_practica", "nombre_archivo", "ruta_archivo", "formato", "peso_mb"];

// Función auxiliar para determinar tipo de documento
function determinarTipoDocumento(nombreArchivo) {
    const nombreLower = nombreArchivo.toLowerCase();
    if (nombreLower.includes("informe")) return "informe";
    if (nombreLower.includes("autoevaluacion")) return "autoevaluacion";
    if (nombreLower.includes("bitacora")) return "bitacora";
    return "documento"; // Tipo genérico para otros documentos
}

export async function registrarDocumento(data) {
    try {
        // Validar que todos los campos requeridos estén presentes
        const camposFaltantes = CAMPOS_REQUERIDOS.filter(campo => !data[campo]);

        if (camposFaltantes.length > 0) {
            return [null, `Faltan campos requeridos: ${camposFaltantes.join(", ")}`];
        }

        // Validar el formato del documento
        if (!FORMATOS_PERMITIDOS.includes(data.formato.toLowerCase())) {
            return [null, `Formato no permitido. Los formatos permitidos son: ${FORMATOS_PERMITIDOS.join(", ")}`];
        }

        // Verificar si existe la práctica
        const practica = await practicaRepository.findOne({
            where: { id_practica: data.id_practica }
        });

        if (!practica) {
            return [null, "La práctica asociada no existe"];
        }

        // Verificar estado de la práctica
        if (practica.estado !== "en_progreso") {
            return [null, "Solo se pueden registrar documentos cuando la práctica está en progreso"];
        }

        // Verificar si ya existe un documento del mismo tipo
        const tipoDocumento = determinarTipoDocumento(data.nombre_archivo);

        const documentosExistentes = await documentoRepository.find({
            where: { id_practica: Number(data.id_practica) }
        });

        const documentoDelMismoTipo = documentosExistentes.find(doc =>
            determinarTipoDocumento(doc.nombre_archivo) === tipoDocumento
        );

        if (documentoDelMismoTipo) {
            return [null, `Ya existe un documento de tipo ${tipoDocumento} para esta práctica`];
        }

        // Crear y guardar el documento
        const documentoData = {
            ...data,
            estado_revision: "pendiente",
            fecha_subida: new Date()
        };

        const nuevoDocumento = documentoRepository.create(documentoData);
        const documentoGuardado = await documentoRepository.save(nuevoDocumento);
        return [documentoGuardado, null];

    } catch (dbError) {
        console.error("Error específico de base de datos:", dbError);

        // Manejo específico de errores de base de datos
        const errorMessages = {
            "23505": "Ya existe un documento con el mismo nombre",
            "23503": "La práctica asociada no es válida",
            "23502": "Falta un campo requerido en la base de datos"
        };

        const mensaje = errorMessages[dbError.code] || `Error al guardar el documento: ${dbError.message}`;
        return [null, mensaje];
    }
}

export async function obtenerDocumentosPorPractica(id_practica) {
    try {
        return await documentoRepository.find({
            where: { id_practica: parseInt(id_practica) },
            order: { fecha_subida: "DESC" }
        });
    } catch (error) {
        console.error("Error al obtener documentos:", error);
        throw new Error("Error al obtener documentos de la práctica");
    }
}

export async function actualizarEstadoDocumento(id_documento, estado_revision) {
    try {
        // Validar estado de revisión
        if (!ESTADOS_REVISION.includes(estado_revision)) {
            throw new Error(`Estado de revisión inválido. Estados permitidos: ${ESTADOS_REVISION.join(", ")}`);
        }

        await documentoRepository.update(id_documento, { estado_revision });
        return await documentoRepository.findOne({
            where: { id_documento: parseInt(id_documento) }
        });
    } catch (error) {
        console.error("Error al actualizar estado del documento:", error);
        throw new Error(`Error al actualizar el estado del documento: ${error.message}`);
    }
}
