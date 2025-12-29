"use strict";
import { ofertaPracticaValidation } from "../validations/ofertaPractica.validation.js";
import {
  createOfertaPracticaService,
  deleteOfertaPracticaService,
  getOfertaPracticaByIdService,
  getOfertasPracticaService,
  updateOfertaPracticaService,
  createPostulacionService,
  getPostulacionesByEstudianteService,
  getPostulantesByOfertaService,
  updateEstadoPostulacionService,
  getPostulacionByOfertaEstudianteService,
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
import Practica from "../entity/practica.entity.js";
import Postulacion from "../entity/postulacion.entity.js";

export async function createOfertaPractica(req, res) {
  try {
    const { body } = req;
    // Buscamos al usuario en la BD usando el email que viene en el token
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(res, 404, "Usuario no encontrado", "Usuario del token no existe en la base de datos.");
    }

    // Ahora sí tenemos el ID numérico real (ej: 1, 5, 20)
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
    const userRepo = AppDataSource.getRepository(User);

    // Buscamos al estudiante REAL en la base de datos usando el email del token
    const estudianteReal = await userRepo.findOne({
        where: { email: userToken.email }
    });

    if (!estudianteReal) {
        return handleErrorClient(res, 404, "Estudiante no encontrado en la base de datos.");
    }

    // Buscamos la oferta
    const oferta = await ofertaRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["encargado"], 
    });

    if (!oferta) {
      return handleErrorClient(res, 404, "Oferta no encontrada");
    }

    // Verificar cupos
    if (oferta.cupos <= 0) {
      return handleErrorClient(res, 400, "Lo sentimos, ya no quedan cupos disponibles.");
    }

    // Crear la postulación con estado "pendiente"
    const [nuevaPostulacion, errorPostulacion] = await createPostulacionService(
      parseInt(id), 
      estudianteReal.id
    );

    if (errorPostulacion) {
      return handleErrorClient(res, 400, errorPostulacion);
    }

    // Enviar correo al profesor
    const emailProfesor = oferta.encargado.email;
    const asunto = `Nueva Postulación: ${oferta.titulo}`;
    const mensajeHtml = `
      <h1>¡Tienes un nuevo postulante!</h1>
      <p>El estudiante <strong>${estudianteReal.nombreCompleto}</strong> ha postulado.</p>
      <ul>
        <li><strong>Email:</strong> ${estudianteReal.email}</li>
        <li><strong>RUT:</strong> ${estudianteReal.rut}</li>
      </ul>
      <p>Ingresa al sistema para aceptar o rechazar la postulación.</p>
    `;
    
    // Enviamos el correo (sin bloquear si falla)
    await sendEmail(emailProfesor, asunto, mensajeHtml);

    // Reducir cupos
    oferta.cupos = oferta.cupos - 1;
    await ofertaRepo.save(oferta);

    handleSuccess(res, 200, "Postulación enviada exitosamente.", nuevaPostulacion);

  } catch (error) {
    console.error(error);
    handleErrorServer(res, 500, error.message);
  }
}

// --- Ver Mis Postulaciones (Estudiante) ---
export async function getMisPostulaciones(req, res) {
  try {
    const emailEstudiante = req.user.email; 
    const userRepo = AppDataSource.getRepository(User);
    
    const estudiante = await userRepo.findOneBy({ email: emailEstudiante });

    if (!estudiante) {
        return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    // Usamos el servicio de postulaciones
    const [postulaciones, error] = await getPostulacionesByEstudianteService(estudiante.id);

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    // Transformamos los datos para el frontend
    const misPostulaciones = postulaciones.map(p => ({
      id: p.id,
      estado: p.estado,
      fecha_postulacion: p.fecha_postulacion,
      fecha_respuesta: p.fecha_respuesta,
      oferta: p.oferta
    }));

    handleSuccess(res, 200, "Historial recuperado", misPostulaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// --- Ver Postulantes de una Oferta (Docente) ---
export async function getPostulantesPorOferta(req, res) {
  try {
    const { id } = req.params;

    const [postulaciones, error] = await getPostulantesByOfertaService(parseInt(id));

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    // Transformamos los datos para incluir el estado de la postulación
    const postulantesConEstado = postulaciones.map(p => ({
      idPostulacion: p.id,
      id: p.estudiante.id,
      nombreCompleto: p.estudiante.nombreCompleto,
      rut: p.estudiante.rut,
      email: p.estudiante.email,
      estado: p.estado,
      fecha_postulacion: p.fecha_postulacion,
      fecha_respuesta: p.fecha_respuesta
    }));

    handleSuccess(res, 200, "Lista de postulantes", postulantesConEstado);
    
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// --- Aceptar Estudiante y Crear Práctica ---
export async function aceptarPostulante(req, res) {
  try {
    const { idOferta, idEstudiante, idPostulacion } = req.body; 

    const ofertaRepo = AppDataSource.getRepository(OfertaPractica);
    const userRepo = AppDataSource.getRepository(User);
    const practicaRepo = AppDataSource.getRepository("Practica"); 

    // Validaciones básicas
    const oferta = await ofertaRepo.findOne({ 
        where: { id: parseInt(idOferta) },
        relations: ["encargado"] 
    });
    
    if (!oferta) return handleErrorClient(res, 404, "Oferta no encontrada");
    if (!oferta.encargado) return handleErrorClient(res, 400, "La oferta no tiene un docente encargado asignado");

    const estudianteEncontrado = await userRepo.findOne({ where: { id: parseInt(idEstudiante) } });
    if (!estudianteEncontrado) return handleErrorClient(res, 404, "Estudiante no encontrado");

    // Verificar duplicados de práctica en curso (activa o en_progreso)
    const practicaExistente = await practicaRepo
        .createQueryBuilder("practica")
        .where("practica.id_estudiante = :idEstudiante", { idEstudiante: estudianteEncontrado.id })
        .andWhere("practica.estado IN (:...estados)", { estados: ["activa", "en_progreso"] })
        .getOne();

    if (practicaExistente) {
        return handleErrorClient(res, 400, "El estudiante ya tiene una práctica en curso.");
    }

    // Actualizar el estado de la postulación a "aceptado"
    const [postulacionActualizada, errorPostulacion] = await updateEstadoPostulacionService(
      parseInt(idPostulacion), 
      "aceptado"
    );

    if (errorPostulacion) {
      return handleErrorClient(res, 400, errorPostulacion);
    }

    // CREAR LA PRÁCTICA
    const nuevaPractica = practicaRepo.create({
        estudiante: estudianteEncontrado,
        docente: oferta.encargado,
        fecha_inicio: new Date(),
        estado: "en_progreso",
        horas_practicas: 0,
        tipo_presencia: oferta.modalidad === "online" ? "virtual" : "presencial"
    });

    await practicaRepo.save(nuevaPractica);

    // Enviar email de notificación al estudiante
    const asunto = `¡Felicitaciones! Has sido aceptado en: ${oferta.titulo}`;
    const mensajeHtml = `
      <h1>¡Buenas noticias!</h1>
      <p>Has sido <strong>aceptado</strong> en la oferta de práctica: <strong>${oferta.titulo}</strong></p>
      <p>Ahora puedes comenzar tu práctica y subir tus bitácoras.</p>
      <p>¡Mucho éxito!</p>
    `;
    await sendEmail(estudianteEncontrado.email, asunto, mensajeHtml);
    
    handleSuccess(res, 201, "Estudiante aceptado. Práctica iniciada correctamente.", { 
      practica: nuevaPractica, 
      postulacion: postulacionActualizada 
    });

  } catch (error) {
    console.error("Error al aceptar postulante:", error);
    handleErrorServer(res, 500, error.message);
  }
}

// --- Rechazar Postulante ---
export async function rechazarPostulante(req, res) {
  try {
    const { idOferta, idEstudiante, idPostulacion } = req.body;

    const ofertaRepo = AppDataSource.getRepository(OfertaPractica);
    const userRepo = AppDataSource.getRepository(User);

    // Validaciones básicas
    const oferta = await ofertaRepo.findOne({ 
        where: { id: parseInt(idOferta) }
    });
    
    if (!oferta) return handleErrorClient(res, 404, "Oferta no encontrada");

    const estudianteEncontrado = await userRepo.findOne({ where: { id: parseInt(idEstudiante) } });
    if (!estudianteEncontrado) return handleErrorClient(res, 404, "Estudiante no encontrado");

    // Actualizar el estado de la postulación a "rechazado"
    const [postulacionActualizada, errorPostulacion] = await updateEstadoPostulacionService(
      parseInt(idPostulacion), 
      "rechazado"
    );

    if (errorPostulacion) {
      return handleErrorClient(res, 400, errorPostulacion);
    }

    // Devolver el cupo
    oferta.cupos = oferta.cupos + 1;
    await ofertaRepo.save(oferta);

    // Enviar email de notificación al estudiante
    const asunto = `Resultado de postulación: ${oferta.titulo}`;
    const mensajeHtml = `
      <h1>Resultado de tu postulación</h1>
      <p>Lamentamos informarte que tu postulación a la oferta <strong>${oferta.titulo}</strong> no ha sido aceptada en esta ocasión.</p>
      <p>Te animamos a seguir postulando a otras ofertas de práctica disponibles.</p>
      <p>¡Mucho ánimo!</p>
    `;
    await sendEmail(estudianteEncontrado.email, asunto, mensajeHtml);

    handleSuccess(res, 200, "Postulación rechazada correctamente.", postulacionActualizada);

  } catch (error) {
    console.error("Error al rechazar postulante:", error);
    handleErrorServer(res, 500, error.message);
  }
}