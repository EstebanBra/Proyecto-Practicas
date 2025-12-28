"use strict";
import Comentario from "../entity/comentario.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createComentarioService(body) { // Crea un nuevo comentario
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const nuevoComentario = comentarioRepository.create(body); // Crear inst de comentario , body tiene los datos 
    return await comentarioRepository.save(nuevoComentario); // Guardar en la BD
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
      throw new Error("Comentario no encontrado");
    }
    comentario = { ...comentario, ...body };
    return await comentarioRepository.save(comentario);
  } catch (error) {
    throw new Error("Error al actualizar el comentario");
  }
}

export async function deleteComentarioService(id) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentario = await comentarioRepository.findOneBy({ id });
    if (!comentario) {
      throw new Error("Comentario no encontrado");
    }
    await comentarioRepository.remove(comentario);
    return comentario;
  } catch (error) {
    throw new Error("Error al eliminar el comentario");
  }
}

export async function getComentariosByUsuarioIdService(usuarioId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      where: { usuarioId },
      relations: ["usuario"]
    });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener los comentarios por ID de usuario");
  }
}

export async function getallComentariosService() {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      relations: ["usuario"]
    });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener todos los comentarios");
  }
}