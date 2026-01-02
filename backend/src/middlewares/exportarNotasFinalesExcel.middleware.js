"use strict";

import ExcelJS from "exceljs";
import { obtenerTodasNotasFinalesService } from "../services/notaFinal.service.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function exportarNotasFinalesExcel(req, res) {
  try {
    const rolUsuario = req.user.rol;

    if (rolUsuario !== "administrador" && rolUsuario !== "docente") {
      return handleErrorClient(
        res,
        403,
        "Solo los administradores pueden exportar las notas",
      );
    }

    const [notas, error] = await obtenerTodasNotasFinalesService();

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    const notasMasRecientes = new Map();

    notas.forEach((nota) => {
      const estudiante =
        typeof nota.estudiante === "string"
          ? JSON.parse(nota.estudiante)
          : nota.estudiante || {};

      const idEst = estudiante.id || nota.id_estudiante;

      if (!idEst) return;

      if (!notasMasRecientes.has(idEst)) {
        notasMasRecientes.set(idEst, nota);
        return;
      }

      const notaGuardada = notasMasRecientes.get(idEst);

      const fechaNueva = new Date(nota.created_at || 0);
      const fechaGuardada = new Date(notaGuardada.created_at || 0);

      // Reemplazar si la nueva es más reciente
      if (fechaNueva > fechaGuardada) {
        notasMasRecientes.set(idEst, nota);
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Notas Finales");

    worksheet.columns = [
      { header: "Estudiante", key: "estudiante", width: 30 },
      { header: "Nota Final", key: "nota_final", width: 12 },
      { header: "Estado", key: "estado", width: 12 },
    ];

    [...notasMasRecientes.values()].forEach((nota) => {
      const estudiante =
        typeof nota.estudiante === "string"
          ? JSON.parse(nota.estudiante)
          : nota.estudiante || {};

      const nombreEstudiante =
        estudiante.nombre_completo ||
        estudiante.nombre ||
        estudiante.email ||
        "";

      const aprobado =
        nota.aprobado ?? (Number(nota.nota_final) >= 4);

      worksheet.addRow({
        estudiante: nombreEstudiante,
        nota_final: nota.nota_final ?? "",
        estado: aprobado ? "Aprobado" : "Reprobado",
      });
    });

    // Estilo encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"notas-finales.xlsx\"",
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error al exportar Excel:", error);
    return handleErrorServer(res, 500, error.message);
  }
}
