"use strict";
import { AppDataSource } from "../config/configDb.js";
import OfertaPractica from "../entity/ofertaPractica.entity.js";

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