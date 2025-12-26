"use strict";
import { ofertaPracticaValidation } from "../validations/ofertaPractica.validation.js";
import {
  createOfertaPracticaService,
  deleteOfertaPracticaService,
  getOfertaPracticaByIdService,
  getOfertasPracticaService,
  updateOfertaPracticaService,
} from "../services/ofertaPractica.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import { sendEmail } from "../helpers/email.helper.js";
import OfertaPractica from "../entity/ofertaPractica.entity.js";


export async function createOfertaPractica(req, res) {
  try {
    const { body } = req;
    // 1. Buscamos al usuario en la BD usando el email que viene en el token
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(res, 404, "Usuario no encontrado", "Usuario del token no existe en la base de datos.");
    }

    // 2. Ahora sí tenemos el ID numérico real (ej: 1, 5, 20)
    const idEncargado = userFound.id;

    const { error } = ofertaPracticaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    // Enviamos el idEncargado correcto
    const [nuevaOferta, errorOferta] = await createOfertaPracticaService(body, idEncargado);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error creando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 201, "Oferta de práctica creada exitosamente", nuevaOferta);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getOfertasPractica(req, res) {
  try {
    const [ofertas, errorOfertas] = await getOfertasPracticaService();

    if (errorOfertas) {
      return handleErrorClient(res, 400, "Error obteniendo las ofertas de práctica", errorOfertas);
    }

    ofertas.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Ofertas de práctica encontradas", ofertas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getOfertaPracticaById(req, res) {
  try {
    const { id } = req.params;

    const [oferta, errorOferta] = await getOfertaPracticaByIdService(id);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error obteniendo la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica encontrada", oferta);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateOfertaPractica(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error } = ofertaPracticaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [ofertaActualizada, errorOferta] = await updateOfertaPracticaService(id, body);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error actualizando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica actualizada exitosamente", ofertaActualizada);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteOfertaPractica(req, res) {
  try {
    const { id } = req.params;

    const [resultado, errorOferta] = await deleteOfertaPracticaService(id);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error eliminando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica eliminada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function postularOferta(req, res) {
  try {
    const { id } = req.params;
    const userToken = req.user;

    const ofertaRepo = AppDataSource.getRepository(OfertaPractica);
    const userRepo = AppDataSource.getRepository(User); // Repositorio de usuarios

    // 1. Buscamos al estudiante REAL en la base de datos usando el email del token
    // Esto trae el objeto completo (con ID, password encriptada, etc.)
    const estudianteReal = await userRepo.findOne({
        where: { email: userToken.email }
    });

    if (!estudianteReal) {
        return handleErrorClient(res, 404, "Estudiante no encontrado en la base de datos.");
    }

    // 2. Buscamos la oferta y sus postulantes
    const oferta = await ofertaRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["encargado", "postulantes"], 
    });

    if (!oferta) {
      return handleErrorClient(res, 404, "Oferta no encontrada");
    }

    // 3. Verificamos si YA postuló usando el ID del estudiante real
    const yaPostulo = oferta.postulantes.some(p => p.id === estudianteReal.id);

    if (yaPostulo) {
      return handleErrorClient(res, 400, "Ya has postulado a esta oferta anteriormente.");
    }

    // 4. Verificar cupos
    if (oferta.cupos <= 0) {
      return handleErrorClient(res, 400, "Lo sentimos, ya no quedan cupos disponibles.");
    }

    // 5. Enviar correo (usando datos del usuario real o del token, da igual aquí)
    const emailProfesor = oferta.encargado.email;
    const asunto = `Nueva Postulación: ${oferta.titulo}`;
    const mensajeHtml = `
      <h1>¡Tienes un nuevo postulante!</h1>
      <p>El estudiante <strong>${estudianteReal.nombreCompleto}</strong> ha postulado.</p>
      <ul>
        <li><strong>Email:</strong> ${estudianteReal.email}</li>
        <li><strong>RUT:</strong> ${estudianteReal.rut}</li>
      </ul>
    `;
    
    // Enviamos el correo (sin bloquear si falla)
    await sendEmail(emailProfesor, asunto, mensajeHtml);

    // Guardamos al estudiante
    oferta.postulantes.push(estudianteReal); // Usamos el objeto completo de la DB
    oferta.cupos = oferta.cupos - 1;
    
    await ofertaRepo.save(oferta);

    handleSuccess(res, 200, "Postulación enviada exitosamente.");

  } catch (error) {
    console.error(error); // Para ver detalles en consola si falla algo más
    handleErrorServer(res, 500, error.message);
  }
}