import Practica from "../entity/practica.entity.js";
import { AppDataSource } from "../config/configDb.js";

const practicaService = {
    async validarRequisitosPractica(datosPractica) {
        if (!datosPractica.empresa) {
            throw new Error("La empresa debe estar asignada en la práctica");
        }

        if (!datosPractica.supervisor_nombre || !datosPractica.supervisor_email || !datosPractica.supervisor_telefono) {
            throw new Error("Los datos del supervisor son obligatorios (nombre, email y teléfono)");
        }

        if (!datosPractica.fecha_inicio || !datosPractica.fecha_fin) {
            throw new Error("El periodo de la práctica debe estar definido correctamente");
        }

        // Validar que fecha_fin sea posterior a fecha_inicio
        const fechaInicio = new Date(datosPractica.fecha_inicio);
        const fechaFin = new Date(datosPractica.fecha_fin);
        
        if (fechaFin <= fechaInicio) {
            throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        // Validar que el periodo no sea excesivamente largo (máximo 2 años)
        const diffTime = Math.abs(fechaFin - fechaInicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const maxDays = 730; // 2 años
        
        if (diffDays > maxDays) {
            throw new Error("El periodo de la práctica no puede exceder 2 años");
        }

        // Validar que el periodo no sea en el pasado (mínimo fecha de hoy)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaInicio < hoy) {
            throw new Error("La fecha de inicio no puede ser anterior a hoy");
        }

        if (!datosPractica.horas_practicas || !datosPractica.semanas) {
            throw new Error("Las horas y semanas de práctica son obligatorias");
        }

        // Validar que horas_practicas y semanas sean números positivos
        if (datosPractica.horas_practicas <= 0 || datosPractica.semanas <= 0) {
            throw new Error("Las horas y semanas de práctica deben ser números positivos");
        }

        // Validar coherencia entre semanas y periodo
        const semanasCalculadas = Math.ceil(diffDays / 7);
        if (Math.abs(datosPractica.semanas - semanasCalculadas) > 2) {
            // Permitir diferencia de hasta 2 semanas por flexibilidad
            console.warn(`Advertencia: Las semanas indicadas (${datosPractica.semanas}) no coinciden con el periodo calculado (${semanasCalculadas})`);
        }

        if (!datosPractica.tipo_practica || !["publicada", "propia"].includes(datosPractica.tipo_practica)) {
            throw new Error("El tipo de práctica debe ser \"publicada\" o \"propia\"");
        }

        // Validar que existan documentos
        if (!datosPractica.documentos || !Array.isArray(datosPractica.documentos) || datosPractica.documentos.length === 0) {
            throw new Error("Debe proporcionar al menos un documento");
        }
    },
    async crearPractica(datosPractica) {
        await this.validarRequisitosPractica(datosPractica);
        const practicaRepository = AppDataSource.getRepository(Practica);
        const nuevaPractica = practicaRepository.create({
            ...datosPractica,
            fecha_creacion: new Date(),
            estado: "Revision_Pendiente"
        });
        return await practicaRepository.save(nuevaPractica);
    },

    async obtenerTodasPracticas() {
        const practicaRepository = AppDataSource.getRepository(Practica);
        return await practicaRepository.find({
            relations: ["estudiante", "docente"]
        });
    },

    async obtenerPracticasEstudiante(idEstudiante) {
        const practicaRepository = AppDataSource.getRepository(Practica);
        return await practicaRepository.find({
            where: { id_estudiante: idEstudiante },
            relations: ["docente"]
        });
    },

    async obtenerPracticaPorId(id) {
        const practicaRepository = AppDataSource.getRepository(Practica);
        return await practicaRepository.findOne({
            where: { id_practica: id },
            relations: ["estudiante", "docente"]
        });
    },

    async actualizarEstadoPractica(id, estado, observaciones) {
        const practicaRepository = AppDataSource.getRepository(Practica);
        const practica = await practicaRepository.findOne({
            where: { id_practica: id }
        });

        if (!practica) {
            return null;
        }

        practica.estado = estado;
        practica.observaciones = observaciones;
        practica.fecha_actualizacion = new Date();

        return await practicaRepository.save(practica);
    },

    async actualizarPractica(id, datosActualizacion) {
        const practicaRepository = AppDataSource.getRepository(Practica);
        const practica = await practicaRepository.findOne({
            where: { id_practica: id }
        });

        if (!practica) {
            return null;
        }

        // Solo permitir actualizar si la práctica está en revisión pendiente
        if (practica.estado !== "Revision_Pendiente") {
            throw new Error("Solo se pueden actualizar prácticas con estado 'Revision_Pendiente'");
        }

        // Validar requisitos si se están actualizando campos críticos
        const camposCriticos = ["empresa", "fecha_inicio", "fecha_fin", "supervisor_nombre", "supervisor_email", "supervisor_telefono"];
        const hayCamposCriticos = camposCriticos.some(campo => datosActualizacion[campo] !== undefined);
        
        if (hayCamposCriticos) {
            const datosCompletos = { ...practica, ...datosActualizacion };
            await this.validarRequisitosPractica(datosCompletos);
        }

        // Actualizar campos permitidos (excluir campos protegidos)
        const camposProtegidos = ["id_practica", "id_estudiante", "estado", "fecha_creacion"];
        camposProtegidos.forEach(campo => delete datosActualizacion[campo]);

        Object.assign(practica, {
            ...datosActualizacion,
            fecha_actualizacion: new Date()
        });
        
        return await practicaRepository.save(practica);
    }
};

export default practicaService;