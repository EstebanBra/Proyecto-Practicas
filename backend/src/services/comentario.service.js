"use strict";  
import Comentario from "../entity/comentario.entity.js";    
import { AppDataSource } from "../config/configDb.js";

export async function createComentarioService(body) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const nuevoComentario = comentarioRepository.create(body);
    await comentarioRepository.save(nuevoComentario);
    return nuevoComentario;
  } catch (error) {
    throw new Error("Error al crear el comentario");
  }
}

export async function getComentariosService() {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find();
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener los comentarios");
  } 
}

export async function getComentarioByIdService(id) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentario = await comentarioRepository.findOneBy({ id });    
    return comentario;
  } catch (error) {
    throw new Error("Error al obtener el comentario por ID");
  }
}

export async function updateComentarioService(id, body) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    let comentario = await comentarioRepository.findOneBy({ id });
    if (!comentario) {
      return [null, "Comentario no encontrado"];
    }
    comentario = { ...comentario, ...body };
    await comentarioRepository.save(comentario);
    return [comentario, null];
  } catch (error) {
    return [null, "Error al actualizar el comentario"];
  }
}

export async function deleteComentarioService(id) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentario = await comentarioRepository.findOneBy({ id });
    if (!comentario) {
      return [null, "Comentario no encontrado"];
    }
    await comentarioRepository.remove(comentario);
    return [comentario, null];
  } catch (error) {
    return [null, "Error al eliminar el comentario"];
  }
}

export async function getComentariosByUsuarioIdService(usuarioId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.findBy({ usuarioId });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener los comentarios por ID de usuario");
  }
}

export async function getallComentariosService(usuarioId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.findManyBy({ usuarioId });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener todos los comentarios");
  }
}