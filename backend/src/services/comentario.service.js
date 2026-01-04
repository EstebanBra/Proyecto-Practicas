"use strict";
import Comentario from "../entity/comentario.entity.js";
import { AppDataSource } from "../config/configDb.js";
import ExcelJS from "exceljs";

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
    const comentario = await comentarioRepository.findOne({
      where: { id },
      relations: ["usuario", "docente"]
    });
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
      relations: ["usuario", "docente"]
    });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener los comentarios por ID de usuario");
  }
}

export async function getComentariosByDocenteIdService(docenteId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      where: { docenteId },
      relations: ["usuario", "docente"]
    });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener los comentarios por docente");
  }
}

export async function getallComentariosService() {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      relations: ["usuario", "docente"]
    });
    return comentarios;
  } catch (error) {
    throw new Error("Error al obtener todos los comentarios");
  }
}

export async function generateComentariosExcelService(usuarioId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      where: { usuarioId },
      relations: ["usuario", "docente"]
    });

    if (comentarios.length === 0) {
      throw new Error("No hay comentarios para este estudiante");
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Comentarios");

    // Agregar encabezados
    worksheet.columns = [
      { header: "ID Comentario", key: "id", width: 15 },
      { header: "Fecha Creación", key: "fechaCreacion", width: 20 },
      { header: "Comentario", key: "mensaje", width: 40 },
      { header: "Tipo Problema", key: "tipoProblema", width: 15 },
      { header: "Urgencia", key: "nivelUrgencia", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Respuesta del Docente", key: "respuesta", width: 40 }
    ];

    // Formatear encabezados
    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" }
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" }
    };
    worksheet.getRow(1).alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true
    };

    // Agregar datos
    comentarios.forEach((comentario) => {
      worksheet.addRow({
        id: comentario.id,
        fechaCreacion: comentario.fechaCreacion,
        mensaje: comentario.mensaje,
        tipoProblema: comentario.tipoProblema,
        nivelUrgencia: comentario.nivelUrgencia,
        estado: comentario.estado,
        respuesta: comentario.respuesta || ""
      });
    });

    // Ajustar altura de filas
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.height = 30;
      row.alignment = { wrapText: true, vertical: "top" };
    });

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(`Error al generar el Excel: ${error.message}`);
  }
}

export async function processComentariosExcelService(usuarioId, filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error("No se encontró hoja de cálculo en el archivo");
    }

    const comentarioRepository = AppDataSource.getRepository(Comentario);
    
    // Obtener todos los comentarios del estudiante que ya están en la BD
    const comentariosExistentes = await comentarioRepository.find({
      where: { usuarioId: parseInt(usuarioId) }
    });
    
    const resultados = [];
    const idsEnExcel = new Set();

    // Procesar filas (ignorar encabezado)
    worksheet.eachRow((row, index) => {
      if (index === 1) return; // Saltar encabezado

      const comentarioId = row.getCell("A").value; // ID Comentario
      const respuesta = row.getCell("G").value; // Respuesta del Docente

      if (comentarioId) {
        idsEnExcel.add(parseInt(comentarioId));
        
        if (respuesta && respuesta.toString().trim()) {
          resultados.push({
            id: parseInt(comentarioId),
            respuesta: respuesta.toString().trim()
          });
        }
      }
    });

    // Validación: detectar comentarios borrados (que existen en BD pero no en Excel)
    const comentariosBorrados = comentariosExistentes.filter(c => !idsEnExcel.has(c.id));
    
    if (comentariosBorrados.length > 0) {
      throw new Error(`No se puede procesar el Excel:
        Faltan ${comentariosBorrados.length} comentario(s) en el archivo. No está permitido eliminar comentarios.`);
    }

    // Validación: detectar comentarios con respuesta vaciada (tenían respuesta y ahora está vacía)
    const comentariosVaciados = comentariosExistentes.filter(c => {
      const tieneRespuesta = c.respuesta && c.respuesta.trim();
      const estaEnExcel = idsEnExcel.has(c.id);
      const tieneRespuestaEnExcel = resultados.some(r => r.id === c.id);
      
      return tieneRespuesta && estaEnExcel && !tieneRespuestaEnExcel;
    });
    
    if (comentariosVaciados.length > 0) {
      throw new Error(`No se puede procesar el Excel: 
        ${comentariosVaciados.length} 
        comentario(s) tienen la respuesta vacía. No está permitido borrar respuestas existentes.`);
    }

    if (resultados.length === 0) {
      throw new Error("No se encontraron comentarios con respuestas en el Excel");
    }

    // Actualizar comentarios en la base de datos
    const actualizados = [];
    const noActualizados = [];
    
    for (const item of resultados) {
      const comentario = await comentarioRepository.findOneBy({ id: item.id });
      
      if (!comentario) {
        noActualizados.push({ id: item.id, motivo: "Comentario no encontrado" });
        continue;
      }
      
      if (comentario.usuarioId !== parseInt(usuarioId)) {
        noActualizados.push({ id: item.id, motivo: "No pertenece al estudiante seleccionado" });
        continue;
      }
      
      // Solo actualizar si la respuesta es diferente o es la primera vez que se responde vía Excel
      const respuestaAnterior = comentario.respuesta || "";
      const respuestaNueva = item.respuesta;
      
      // Verificar si hay un cambio real
      const hayChange = respuestaAnterior !== respuestaNueva;
      
      if (hayChange) {
        comentario.respuesta = respuestaNueva;
        comentario.estado = "Respondido";
        comentario.respondidoViaExcel = true;
        await comentarioRepository.save(comentario);
        actualizados.push(comentario);
      } else {
        noActualizados.push({ id: item.id, motivo: "Sin cambios" });
      }
    }

    return {
      totalProcesados: resultados.length,
      totalActualizados: actualizados.length,
      totalSinCambios: noActualizados.filter(n => n.motivo === "Sin cambios").length,
      comentarios: actualizados
    };
  } catch (error) {
    console.error("Error en processComentariosExcelService:", error);
    throw new Error(`Error al procesar el Excel: ${error.message}`);
  }
}

export async function generateComentariosExcelConRespuestasService(usuarioId) {
  try {
    const comentarioRepository = AppDataSource.getRepository(Comentario);
    const comentarios = await comentarioRepository.find({
      where: { usuarioId },
      relations: ["usuario", "docente"]
    });

    // Filtrar solo comentarios respondidos VÍA EXCEL
    const comentariosConRespuesta = comentarios.filter(c => 
      c.respuesta && c.respuesta.trim() && c.respondidoViaExcel === true
    );

    if (comentariosConRespuesta.length === 0) {
      throw new Error("No hay comentarios respondidos vía Excel");
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Respuestas");

    // Agregar encabezados
    worksheet.columns = [
      { header: "ID Comentario", key: "id", width: 15 },
      { header: "Fecha Creación", key: "fechaCreacion", width: 20 },
      { header: "Tu Comentario", key: "mensaje", width: 40 },
      { header: "Tipo Problema", key: "tipoProblema", width: 15 },
      { header: "Urgencia", key: "nivelUrgencia", width: 15 },
      { header: "Respuesta del Docente", key: "respuesta", width: 40 }
    ];

    // Formatear encabezados
    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" }
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388E3C" }
    };
    worksheet.getRow(1).alignment = {
      horizontal: "center",
      vertical: "center",
      wrapText: true
    };

    // Agregar datos
    comentariosConRespuesta.forEach((comentario) => {
      worksheet.addRow({
        id: comentario.id,
        fechaCreacion: comentario.fechaCreacion,
        mensaje: comentario.mensaje,
        tipoProblema: comentario.tipoProblema,
        nivelUrgencia: comentario.nivelUrgencia,
        respuesta: comentario.respuesta
      });
    });

    // Ajustar altura de filas
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.height = 30;
      row.alignment = { wrapText: true, vertical: "top" };
    });

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(`Error al generar el Excel con respuestas: ${error.message}`);
  }
}