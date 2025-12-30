"use strict";
import { AppDataSource } from "../config/configDb.js";
import { In, Not, IsNull } from "typeorm";

export async function calcularNotaFinalService(idEstudiante) {
  try {
    const notaFinalRepo = AppDataSource.getRepository("NotaFinal");
    const practicaRepo = AppDataSource.getRepository("Practica");
    const bitacoraRepo = AppDataSource.getRepository("Bitacora");
    const documentoRepo = AppDataSource.getRepository("Documento");
    const evaluacionRepo = AppDataSource.getRepository("EvaluacionFinal");

    // 1. Validar que el estudiante tenga práctica finalizada
    const practica = await practicaRepo.findOne({
      where: {
        id_estudiante: idEstudiante,
        estado: "finalizada",
      },
      relations: ["estudiante", "docente"],
    });

    if (!practica) {
      return [null, "No tienes una práctica finalizada para calcular la nota"];
    }

    console.log("Práctica encontrada:", practica.id_practica);

    // 2. Verificar si ya existe una nota final para esta práctica
    const notaFinalExistente = await notaFinalRepo.findOne({
      where: { id_practica: practica.id_practica },
    });

    if (notaFinalExistente) {
      // Opción 1: Actualizar la nota existente (comentar si no se desea)
      // await notaFinalRepo.remove(notaFinalExistente);
      // Opción 2: Devolver error
      return [
        null,
        "Ya existe una nota final calculada para esta práctica. Contacta al administrador para recalcular.",
      ];
    }

    // 3. Validar bitácoras aprobadas con notas
    const bitacoras = await bitacoraRepo.find({
      where: {
        id_practica: practica.id_practica,
        estado_revision: "aprobado",
        nota: Not(IsNull()),
      },
      order: { semana: "ASC" },
    });

    console.log("Bitácoras aprobadas con nota:", bitacoras.length);

    if (bitacoras.length === 0) {
      return [null, "No hay bitácoras aprobadas con notas para esta práctica"];
    }

    // 4. Calcular promedio de bitácoras
    const sumaNotasBitacoras = bitacoras.reduce(
      (sum, b) => sum + parseFloat(b.nota),
      0,
    );
    const promedioBitacoras = sumaNotasBitacoras / bitacoras.length;
    console.log("Promedio bitácoras:", promedioBitacoras.toFixed(1));

    // 5. Validar documentos de informe y autoevaluación con evaluaciones
    const documentos = await documentoRepo.find({
      where: {
        id_practica: practica.id_practica,
        tipo: In(["informe", "autoevaluacion"]),
        estado_revision: "revisado",
      },
    });

    console.log("Documentos revisados:", documentos.length);

    if (documentos.length < 2) {
      return [null, "Faltan documentos revisados (informe y autoevaluación)"];
    }

    // 6. Buscar evaluaciones para cada documento
    let notaInforme = 0;
    let notaAutoevaluacion = 0;
    let encontroInforme = false;
    let encontroAutoevaluacion = false;

    for (const documento of documentos) {
      const evaluacion = await evaluacionRepo.findOne({
        where: {
          id_documento: documento.id_documento,
        },
      });

      if (evaluacion) {
        if (documento.tipo === "informe") {
          notaInforme = evaluacion.nota;
          encontroInforme = true;
          console.log("Nota informe encontrada:", notaInforme);
        } else if (documento.tipo === "autoevaluacion") {
          notaAutoevaluacion = evaluacion.nota;
          encontroAutoevaluacion = true;
          console.log("Nota autoevaluación encontrada:", notaAutoevaluacion);
        }
      }
    }

    // 7. Validar que ambas evaluaciones existan
    if (!encontroInforme) {
      return [null, "Falta evaluación del informe final"];
    }

    if (!encontroAutoevaluacion) {
      return [null, "Falta evaluación de la autoevaluación"];
    }

    // 8. Calcular nota final según fórmula
    const notaFinalCalculada = calcularFormulaNotaFinal(
      promedioBitacoras,
      notaInforme,
      notaAutoevaluacion,
    );

    console.log("Nota final calculada:", notaFinalCalculada);

    // 9. Crear registro de nota final
    const nuevaNotaFinal = notaFinalRepo.create({
      id_practica: practica.id_practica,
      id_estudiante: idEstudiante,
      id_docente: practica.id_docente,
      nota_final: notaFinalCalculada,
      estado: "calculada",
      promedio_bitacoras: promedioBitacoras.toFixed(1),
      nota_informe: notaInforme,
      nota_autoevaluacion: notaAutoevaluacion,
      detalle_bitacoras: bitacoras.map((b) => `Semana ${b.semana}: ${b.nota}`),
      fecha_calculo: new Date(),
    });

    await notaFinalRepo.save(nuevaNotaFinal);

    console.log("Nota final guardada exitosamente. ID:", nuevaNotaFinal.id);

    return [nuevaNotaFinal, null];
  } catch (error) {
    console.error("Error en calcularNotaFinalService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

export async function obtenerNotaFinalEstudianteService(idEstudiante) {
  try {
    const notaFinalRepo = AppDataSource.getRepository("NotaFinal");

    const notaFinal = await notaFinalRepo.findOne({
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
      promedio_bitacoras: notaFinal.promedio_bitacoras,
      nota_informe: notaFinal.nota_informe,
      nota_autoevaluacion: notaFinal.nota_autoevaluacion,
      fecha_calculo: notaFinal.fecha_calculo,
      detalle_bitacoras: notaFinal.detalle_bitacoras,
      practica: {
        id: notaFinal.practica?.id_practica,
        empresa: notaFinal.practica?.empresa,
        estado: notaFinal.practica?.estado,
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

export async function obtenerNotasFinalesDocenteService(idDocente) {
  try {
    const notaFinalRepo = AppDataSource.getRepository("NotaFinal");

    console.log("Buscando notas para docente ID:", idDocente);

    const notasFinales = await notaFinalRepo.find({
      where: { id_docente: idDocente },
      relations: ["practica", "practica.estudiante"],
      order: { fecha_calculo: "DESC" },
    });

    console.log("Notas encontradas:", notasFinales.length);

    if (!notasFinales || notasFinales.length === 0) {
      return [[], null]; // Devolver array vacío
    }

    // Formatear datos para mostrar
    const resultado = notasFinales.map((nota) => {
      // Verificar si practica y estudiante existen
      if (!nota.practica || !nota.practica.estudiante) {
        console.warn("Nota sin práctica o estudiante:", nota.id);
        return {
          id: nota.id,
          estudiante: null,
          nota_final: nota.nota_final,
          estado: nota.estado,
          promedio_bitacoras: nota.promedio_bitacoras,
          nota_informe: nota.nota_informe,
          nota_autoevaluacion: nota.nota_autoevaluacion,
          fecha_calculo: nota.fecha_calculo,
          practica_id: nota.id_practica,
          detalle_bitacoras: nota.detalle_bitacoras,
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
        promedio_bitacoras: nota.promedio_bitacoras,
        nota_informe: nota.nota_informe,
        nota_autoevaluacion: nota.nota_autoevaluacion,
        fecha_calculo: nota.fecha_calculo,
        practica_id: nota.id_practica,
        detalle_bitacoras: nota.detalle_bitacoras,
        practica_empresa: nota.practica.empresa || "No especificada",
      };
    });

    return [resultado, null];
  } catch (error) {
    console.error("Error en obtenerNotasFinalesDocenteService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

export async function obtenerTodasNotasFinalesService() {
  try {
    const notaFinalRepo = AppDataSource.getRepository("NotaFinal");

    console.log("Obteniendo todas las notas finales...");

    const notasFinales = await notaFinalRepo.find({
      relations: ["practica", "practica.estudiante", "practica.docente"],
      order: { fecha_calculo: "DESC" },
    });

    console.log("Total notas encontradas:", notasFinales.length);

    if (!notasFinales || notasFinales.length === 0) {
      return [[], null];
    }

    const resultado = notasFinales.map((nota) => {
      // Verificar si practica y estudiante existen
      if (!nota.practica || !nota.practica.estudiante) {
        console.warn("Nota sin práctica o estudiante:", nota.id);
        return {
          id: nota.id,
          estudiante: null,
          docente: null,
          nota_final: nota.nota_final,
          estado: nota.estado,
          promedio_bitacoras: nota.promedio_bitacoras,
          nota_informe: nota.nota_informe,
          nota_autoevaluacion: nota.nota_autoevaluacion,
          fecha_calculo: nota.fecha_calculo,
          practica_id: nota.id_practica,
          detalle_bitacoras: nota.detalle_bitacoras,
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
        promedio_bitacoras: nota.promedio_bitacoras,
        nota_informe: nota.nota_informe,
        nota_autoevaluacion: nota.nota_autoevaluacion,
        fecha_calculo: nota.fecha_calculo,
        practica_id: nota.id_practica,
        detalle_bitacoras: nota.detalle_bitacoras,
        practica_empresa: nota.practica.empresa || "No especificada",
        practica_estado: nota.practica.estado,
      };
    });

    return [resultado, null];
  } catch (error) {
    console.error("Error en obtenerTodasNotasFinalesService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

// Función auxiliar mejorada para calcular la nota final
function calcularFormulaNotaFinal(
  promedioBitacoras,
  notaInforme,
  notaAutoevaluacion,
) {
  // Fórmula: 50% bitácoras + 30% informe + 20% autoevaluación
  const nota =
    promedioBitacoras * 0.5 + notaInforme * 0.3 + notaAutoevaluacion * 0.2;

  // Redondear a 1 decimal
  const notaRedondeada = Math.round(nota * 10) / 10;

  // Asegurar que esté entre 1.0 y 7.0
  if (notaRedondeada < 1.0) return 1.0;
  if (notaRedondeada > 7.0) return 7.0;

  return notaRedondeada;
}

// NUEVA FUNCIÓN: Validar prerequisitos para calcular nota
export async function validarPrerequisitosNotaService(idEstudiante) {
  try {
    const practicaRepo = AppDataSource.getRepository("Practica");
    const bitacoraRepo = AppDataSource.getRepository("Bitacora");
    const documentoRepo = AppDataSource.getRepository("Documento");
    const evaluacionRepo = AppDataSource.getRepository("EvaluacionFinal");

    // 1. Verificar práctica finalizada
    const practica = await practicaRepo.findOne({
      where: { id_estudiante: idEstudiante, estado: "finalizada" },
    });

    if (!practica) {
      return [null, "No tienes una práctica finalizada"];
    }

    // 2. Verificar bitácoras aprobadas con nota
    const bitacorasCount = await bitacoraRepo.count({
      where: {
        id_practica: practica.id_practica,
        estado_revision: "aprobado",
        nota: Not(IsNull()),
      },
    });

    if (bitacorasCount === 0) {
      return [null, "No hay bitácoras aprobadas con nota"];
    }

    // 3. Verificar documentos con evaluaciones
    const documentos = await documentoRepo.find({
      where: {
        id_practica: practica.id_practica,
        tipo: In(["informe", "autoevaluacion"]),
      },
    });

    const informe = documentos.find((d) => d.tipo === "informe");
    const autoevaluacion = documentos.find((d) => d.tipo === "autoevaluacion");

    if (!informe || !autoevaluacion) {
      return [null, "Faltan documentos (informe o autoevaluación)"];
    }

    // 4. Verificar evaluaciones
    const evaluacionInforme = await evaluacionRepo.findOne({
      where: { id_documento: informe.id_documento },
    });

    const evaluacionAutoevaluacion = await evaluacionRepo.findOne({
      where: { id_documento: autoevaluacion.id_documento },
    });

    if (!evaluacionInforme || !evaluacionAutoevaluacion) {
      return [null, "Faltan evaluaciones de los documentos"];
    }

    return [
      {
        puede_calcular: true,
        practica_id: practica.id_practica,
        bitacoras_aprobadas: bitacorasCount,
        informe_evaluado: !!evaluacionInforme,
        autoevaluacion_evaluada: !!evaluacionAutoevaluacion,
      },
      null,
    ];
  } catch (error) {
    console.error("Error en validarPrerequisitosNotaService:", error);
    return [null, "Error al validar prerequisitos"];
  }
}
