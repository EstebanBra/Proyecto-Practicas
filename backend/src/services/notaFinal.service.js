"use strict";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";
import NotaFinal from "../entity/notaFinal.entity.js";
import Practica from "../entity/practica.entity.js";
import Documento from "../entity/documento.entity.js";

export async function calcularNotaFinalService(idPractica) {
  try {
    const notaFinalRepository = AppDataSource.getRepository(NotaFinal);
    const practicaRepository = AppDataSource.getRepository(Practica);
    const documentoRepository = AppDataSource.getRepository(Documento);

    const practica = await practicaRepository.findOne({
      where: {
        id_practica: idPractica,
        estado: In(["en_progreso", "finalizada"]),
      },
      relations: ["estudiante", "docente"],
    });

    if (!practica) {
      return [
        null,
        "No existe una práctica válida para calcular la nota. La práctica debe estar en progreso o finalizada",
      ];
    }

    const notaFinalExistente = await notaFinalRepository.findOne({
      where: { id_practica: practica.id_practica },
    });

    const documentos = await documentoRepository.find({
      where: {
        id_practica: practica.id_practica,
        tipo: In(["informe", "autoevaluacion"]),
        estado_revision: "revisado",
      },
    });

    const informe = documentos.find((d) => d.tipo === "informe");
    const autoevaluacion = documentos.find((d) => d.tipo === "autoevaluacion");

    if (!informe || !autoevaluacion) {
      return [null, "Faltan documentos revisados"];
    }

    if (informe.nota_revision == null || autoevaluacion.nota_revision == null) {
      return [null, "Faltan notas en los documentos"];
    }

    const notaFinal =
      informe.nota_revision * 0.7 + autoevaluacion.nota_revision * 0.3;

    const nuevaNotaFinal = notaFinalRepository.create({
      id_practica: practica.id_practica,
      id_estudiante: practica.id_estudiante,
      id_docente: practica.id_docente,

      nota_final: Number(notaFinal.toFixed(1)),
      nota_informe: informe.nota_revision,
      nota_autoevaluacion: autoevaluacion.nota_revision,

      promedio_bitacoras: 0,
      detalle_bitacoras: [],

      estado: "calculada",
      fecha_calculo: new Date(),
    });


    await notaFinalRepository.save(nuevaNotaFinal);

    practica.nota_practica = nuevaNotaFinal.nota_final;
    if (practica.estado === "en_progreso") {
      practica.estado = "finalizada";
    }
    await practicaRepository.save(practica);

    return [nuevaNotaFinal, null];
  } catch (error) {
    console.error("calcularNotaFinalService:", error);
    return [null, error.message];
  }

}

export async function obtenerNotaFinalEstudianteService(idEstudiante) {
  try {
    const notaFinalRepository = AppDataSource.getRepository(NotaFinal);

    const notaFinal = await notaFinalRepository.findOne({
      where: { id_estudiante: idEstudiante },
      relations: ["practica", "practica.estudiante", "practica.docente"],
      order: { fecha_calculo: "DESC" },
    });

    if (!notaFinal) {
      return [null, "No se encontró una nota final para tu práctica"];
    }

    // Formatear respuesta
    const resultado = {
      id: notaFinal.id,
      nota_final: notaFinal.nota_final,
      estado: notaFinal.estado,
      promedio_bitacoras: notaFinal.promedio_bitacoras || 0,
      nota_informe: notaFinal.nota_informe,
      nota_autoevaluacion: notaFinal.nota_autoevaluacion,
      fecha_calculo: notaFinal.fecha_calculo,
      detalle_bitacoras: notaFinal.detalle_bitacoras || [],
      practica: {
        id: notaFinal.practica?.id_practica,
        empresa: notaFinal.practica?.empresa,
        estado: notaFinal.practica?.estado,
        nota_practica: notaFinal.practica?.nota_practica,
      },
      estudiante: notaFinal.practica?.estudiante
          ? {
            nombre:
                notaFinal.practica.estudiante.nombreCompleto ||
                `${notaFinal.practica.estudiante.nombre || ""} ${notaFinal.practica.estudiante.apellido || ""}`.trim(),
            rut: notaFinal.practica.estudiante.rut,
            email: notaFinal.practica.estudiante.email,
          }
          : null,
      docente: notaFinal.practica?.docente
          ? {
            nombre:
                notaFinal.practica.docente.nombreCompleto ||
                `${notaFinal.practica.docente.nombre || ""} ${notaFinal.practica.docente.apellido || ""}`.trim(),
            email: notaFinal.practica.docente.email,
          }
          : null,
    };

    return [resultado, null];
  } catch (error) {
    console.error("Error en obtenerNotaFinalEstudianteService:", error);
    return [null, "Error interno del servidor al obtener la nota"];
  }
}

export async function obtenerNotasFinalesDocenteService(idDocente, filtros = {}) {
  try {
    const notaFinalRepository = AppDataSource.getRepository(NotaFinal);

    const queryBuilder = notaFinalRepository
        .createQueryBuilder("notaFinal")
        .leftJoinAndSelect("notaFinal.practica", "practica")
        .leftJoinAndSelect("practica.estudiante", "estudiante")
        .where("notaFinal.id_docente = :idDocente", { idDocente });

    if (filtros.estado) {
      queryBuilder.andWhere("notaFinal.estado = :estado", { estado: filtros.estado });
    }

    if (filtros.id_practica) {
      queryBuilder.andWhere("notaFinal.id_practica = :id_practica", { id_practica: filtros.id_practica });
    }

    if (filtros.id_estudiante) {
      queryBuilder.andWhere("notaFinal.id_estudiante = :id_estudiante", { id_estudiante: filtros.id_estudiante });
    }

    if (filtros.nota_minima) {
      queryBuilder.andWhere("notaFinal.nota_final >= :nota_minima", { nota_minima: filtros.nota_minima });
    }

    if (filtros.nota_maxima) {
      queryBuilder.andWhere("notaFinal.nota_final <= :nota_maxima", { nota_maxima: filtros.nota_maxima });
    }

    if (filtros.fecha_desde) {
      queryBuilder.andWhere("notaFinal.fecha_calculo >= :fecha_desde", { fecha_desde: filtros.fecha_desde });
    }

    if (filtros.fecha_hasta) {
      queryBuilder.andWhere("notaFinal.fecha_calculo <= :fecha_hasta", { fecha_hasta: filtros.fecha_hasta });
    }

    queryBuilder.orderBy("notaFinal.fecha_calculo", "DESC");

    const notasFinales = await queryBuilder.getMany();

    if (!notasFinales || notasFinales.length === 0) {
      return [[], null];
    }

    // Formatear respuesta
    const resultado = notasFinales.map((nota) => {
      if (!nota.practica || !nota.practica.estudiante) {
        return {
          id: nota.id,
          estudiante: null,
          nota_final: nota.nota_final,
          estado: nota.estado,
          promedio_bitacoras: nota.promedio_bitacoras || 0,
          nota_informe: nota.nota_informe,
          nota_autoevaluacion: nota.nota_autoevaluacion,
          fecha_calculo: nota.fecha_calculo,
          practica_id: nota.id_practica,
          detalle_bitacoras: nota.detalle_bitacoras || [],
        };
      }

      return {
        id: nota.id,
        estudiante: {
          id: nota.practica.estudiante.id,
          nombre:
              nota.practica.estudiante.nombreCompleto ||
              `${nota.practica.estudiante.nombre || ""} ${nota.practica.estudiante.apellido || ""}`.trim(),
          rut: nota.practica.estudiante.rut,
          email: nota.practica.estudiante.email,
        },
        nota_final: nota.nota_final,
        estado: nota.estado,
        promedio_bitacoras: nota.promedio_bitacoras || 0,
        nota_informe: nota.nota_informe,
        nota_autoevaluacion: nota.nota_autoevaluacion,
        fecha_calculo: nota.fecha_calculo,
        practica_id: nota.id_practica,
        detalle_bitacoras: nota.detalle_bitacoras || [],
        practica_empresa: nota.practica.empresa || "No especificada",
        practica_nota: nota.practica.nota_practica,
      };
    });

    return [resultado, null];
  } catch (error) {
    console.error("Error en obtenerNotasFinalesDocenteService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

export async function obtenerTodasNotasFinalesService(filtros = {}) {
  try {
    const notaFinalRepository = AppDataSource.getRepository(NotaFinal);

    const queryBuilder = notaFinalRepository
        .createQueryBuilder("notaFinal")
        .leftJoinAndSelect("notaFinal.practica", "practica")
        .leftJoinAndSelect("practica.estudiante", "estudiante")
        .leftJoinAndSelect("practica.docente", "docente");

    // Aplicar filtros si existen
    if (filtros.estado) {
      queryBuilder.andWhere("notaFinal.estado = :estado", { estado: filtros.estado });
    }

    if (filtros.id_docente) {
      queryBuilder.andWhere("notaFinal.id_docente = :id_docente", { id_docente: filtros.id_docente });
    }

    if (filtros.id_estudiante) {
      queryBuilder.andWhere("notaFinal.id_estudiante = :id_estudiante", { id_estudiante: filtros.id_estudiante });
    }

    if (filtros.id_practica) {
      queryBuilder.andWhere("notaFinal.id_practica = :id_practica", { id_practica: filtros.id_practica });
    }

    if (filtros.nota_minima) {
      queryBuilder.andWhere("notaFinal.nota_final >= :nota_minima", { nota_minima: filtros.nota_minima });
    }

    if (filtros.nota_maxima) {
      queryBuilder.andWhere("notaFinal.nota_final <= :nota_maxima", { nota_maxima: filtros.nota_maxima });
    }

    if (filtros.estado_practica) {
      queryBuilder.andWhere("practica.estado = :estado_practica", { estado_practica: filtros.estado_practica });
    }

    queryBuilder.orderBy("notaFinal.fecha_calculo", "DESC");

    const notasFinales = await queryBuilder.getMany();

    if (!notasFinales || notasFinales.length === 0) {
      return [[], null];
    }

    // Formatear respuesta
    const resultado = notasFinales.map((nota) => {
      if (!nota.practica || !nota.practica.estudiante) {
        return {
          id: nota.id,
          estudiante: null,
          docente: null,
          nota_final: nota.nota_final,
          estado: nota.estado,
          promedio_bitacoras: nota.promedio_bitacoras || 0,
          nota_informe: nota.nota_informe,
          nota_autoevaluacion: nota.nota_autoevaluacion,
          fecha_calculo: nota.fecha_calculo,
          practica_id: nota.id_practica,
          detalle_bitacoras: nota.detalle_bitacoras || [],
        };
      }

      return {
        id: nota.id,
        estudiante: {
          id: nota.practica.estudiante.id,
          nombre:
              nota.practica.estudiante.nombreCompleto ||
              `${nota.practica.estudiante.nombre || ""} ${nota.practica.estudiante.apellido || ""}`.trim(),
          rut: nota.practica.estudiante.rut,
          email: nota.practica.estudiante.email,
        },
        docente: nota.practica.docente
            ? {
              id: nota.practica.docente.id,
              nombre:
                  nota.practica.docente.nombreCompleto ||
                  `${nota.practica.docente.nombre || ""} ${nota.practica.docente.apellido || ""}`.trim(),
              email: nota.practica.docente.email,
            }
            : null,
        nota_final: nota.nota_final,
        estado: nota.estado,
        promedio_bitacoras: nota.promedio_bitacoras || 0,
        nota_informe: nota.nota_informe,
        nota_autoevaluacion: nota.nota_autoevaluacion,
        fecha_calculo: nota.fecha_calculo,
        practica_id: nota.id_practica,
        detalle_bitacoras: nota.detalle_bitacoras || [],
        practica_empresa: nota.practica.empresa || "No especificada",
        practica_estado: nota.practica.estado,
        practica_nota: nota.practica.nota_practica,
      };
    });

    return [resultado, null];
  } catch (error) {
    console.error("Error en obtenerTodasNotasFinalesService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

export async function obtenerNotaFinalByIdService(id) {
  try {
    const notaFinalRepository = AppDataSource.getRepository(NotaFinal);

    const notaFinal = await notaFinalRepository.findOne({
      where: { id },
      relations: ["practica", "practica.estudiante", "practica.docente"],
    });

    if (!notaFinal) {
      return [null, "Nota final no encontrada"];
    }

    return [notaFinal, null];
  } catch (error) {
    console.error("Error en obtenerNotaFinalByIdService:", error);
    return [null, "Error al obtener la nota final"];
  }
}

export async function validarPrerequisitosNotaService(idEstudiante) {
  try {
    const practicaRepository = AppDataSource.getRepository(Practica);
    const documentoRepository = AppDataSource.getRepository(Documento);

    // Buscar práctica activa del estudiante
    const practica = await practicaRepository.findOne({
      where: {
        id_estudiante: idEstudiante,
        estado: In(["en_progreso"]),
      },
    });

    if (!practica) {
      return [null, "No tienes una práctica activa"];
    }

    // Verificar documentos requeridos
    const documentos = await documentoRepository.find({
      where: {
        id_practica: practica.id_practica,
        tipo: In(["informe", "autoevaluacion"]),
        estado_revision: "revisado",
      },
    });

    const informe = documentos.find((d) => d.tipo === "informe");
    const autoevaluacion = documentos.find((d) => d.tipo === "autoevaluacion");

    if (!informe || !autoevaluacion) {
      return [null, "Faltan documentos revisados (informe o autoevaluación)"];
    }

    if (!informe.nota_revision || !autoevaluacion.nota_revision) {
      return [null, "Faltan evaluaciones de los documentos"];
    }

    return [
      {
        puede_calcular: true,
        practica_id: practica.id_practica,
        informe_evaluado: !!informe.nota_revision,
        autoevaluacion_evaluada: !!autoevaluacion.nota_revision,
        nota_informe: informe.nota_revision,
        nota_autoevaluacion: autoevaluacion.nota_revision,
      },
      null,
    ];
  } catch (error) {
    console.error("Error en validarPrerequisitosNotaService:", error);
    return [null, "Error al validar prerequisitos"];
  }
}
