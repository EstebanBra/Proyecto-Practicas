"use strict";
import { AppDataSource } from "../config/configDb.js";
import OfertaPractica from "../entity/ofertaPractica.entity.js";
import Postulacion from "../entity/postulacion.entity.js";

export async function createOfertaPracticaService(oferta, idEncargado) {
  try {
    const ofertaRepository = AppDataSource.getRepository(OfertaPractica);
    
    const nuevaOferta = ofertaRepository.create({
      ...oferta,
      id_encargado: idEncargado
    });
    
    await ofertaRepository.save(nuevaOferta);
    return [nuevaOferta, null];
  } catch (error) {
    console.error("Error al crear la oferta de práctica:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getOfertasPracticaService() {
  try {
    const ofertaRepository = AppDataSource.getRepository(OfertaPractica);
    
    const ofertas = await ofertaRepository.find({
      where: { estado: "activa" },
      relations: ["encargado"],
      order: { fecha_publicacion: "DESC" }
    });

    return [ofertas, null];
  } catch (error) {
    console.error("Error al obtener las ofertas de práctica:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getOfertaPracticaByIdService(id) {
  try {
    const ofertaRepository = AppDataSource.getRepository(OfertaPractica);
    
    const oferta = await ofertaRepository.findOne({
      where: { id },
      relations: ["encargado"]
    });

    if (!oferta) {
      return [null, "Oferta de práctica no encontrada"];
    }

    return [oferta, null];
  } catch (error) {
    console.error("Error al obtener la oferta de práctica:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateOfertaPracticaService(id, cambios) {
  try {
    const ofertaRepository = AppDataSource.getRepository(OfertaPractica);
    
    const oferta = await ofertaRepository.findOne({
      where: { id }
    });

    if (!oferta) {
      return [null, "Oferta de práctica no encontrada"];
    }

    ofertaRepository.merge(oferta, cambios);
    await ofertaRepository.save(oferta);

    return [oferta, null];
  } catch (error) {
    console.error("Error al actualizar la oferta de práctica:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteOfertaPracticaService(id) {
  try {
    const ofertaRepository = AppDataSource.getRepository(OfertaPractica);
    
    const oferta = await ofertaRepository.findOne({
      where: { id }
    });

    if (!oferta) {
      return [null, "Oferta de práctica no encontrada"];
    }

    await ofertaRepository.remove(oferta);
    return [true, null];
  } catch (error) {
    console.error("Error al eliminar la oferta de práctica:", error);
    return [null, "Error interno del servidor"];
  }
}

// --- Servicios para Postulaciones ---

// Crear una postulación (cuando el estudiante postula)
export async function createPostulacionService(idOferta, idEstudiante) {
  try {
    const postulacionRepo = AppDataSource.getRepository(Postulacion);
    
    // Verificar si ya existe una postulación
    const existente = await postulacionRepo.findOne({
      where: { 
        id_estudiante: idEstudiante, 
        id_oferta: idOferta 
      }
    });

    if (existente) {
      return [null, "Ya has postulado a esta oferta anteriormente"];
    }

    const nuevaPostulacion = postulacionRepo.create({
      id_estudiante: idEstudiante,
      id_oferta: idOferta,
      estado: "pendiente"
    });

    await postulacionRepo.save(nuevaPostulacion);
    return [nuevaPostulacion, null];
  } catch (error) {
    console.error("Error al crear la postulación:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener postulaciones de un estudiante
export async function getPostulacionesByEstudianteService(idEstudiante) {
  try {
    const postulacionRepo = AppDataSource.getRepository(Postulacion);
    
    const postulaciones = await postulacionRepo.find({
      where: { id_estudiante: idEstudiante },
      relations: ["oferta", "oferta.encargado"],
      order: { fecha_postulacion: "DESC" }
    });

    return [postulaciones, null];
  } catch (error) {
    console.error("Error al obtener postulaciones:", error);
    return [null, "Error interno del servidor"];
  }
}

// Obtener postulantes de una oferta (con estado)
export async function getPostulantesByOfertaService(idOferta) {
  try {
    const postulacionRepo = AppDataSource.getRepository(Postulacion);
    
    const postulaciones = await postulacionRepo.find({
      where: { id_oferta: idOferta },
      relations: ["estudiante"],
      order: { fecha_postulacion: "ASC" }
    });

    return [postulaciones, null];
  } catch (error) {
    console.error("Error al obtener postulantes:", error);
    return [null, "Error interno del servidor"];
  }
}

// Actualizar estado de postulación (aceptar o rechazar)
export async function updateEstadoPostulacionService(idPostulacion, nuevoEstado) {
  try {
    const postulacionRepo = AppDataSource.getRepository(Postulacion);
    
    const postulacion = await postulacionRepo.findOne({
      where: { id: idPostulacion },
      relations: ["estudiante", "oferta"]
    });

    if (!postulacion) {
      return [null, "Postulación no encontrada"];
    }

    postulacion.estado = nuevoEstado;
    postulacion.fecha_respuesta = new Date();

    await postulacionRepo.save(postulacion);
    return [postulacion, null];
  } catch (error) {
    console.error("Error al actualizar estado de postulación:", error);
    return [null, "Error interno del servidor"];
  }
}

// Buscar postulación por oferta y estudiante
export async function getPostulacionByOfertaEstudianteService(idOferta, idEstudiante) {
  try {
    const postulacionRepo = AppDataSource.getRepository(Postulacion);
    
    const postulacion = await postulacionRepo.findOne({
      where: { 
        id_oferta: idOferta, 
        id_estudiante: idEstudiante 
      },
      relations: ["estudiante", "oferta"]
    });

    return [postulacion, null];
  } catch (error) {
    console.error("Error al buscar postulación:", error);
    return [null, "Error interno del servidor"];
  }
}