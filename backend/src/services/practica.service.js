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

        if (!datosPractica.horas_practicas || !datosPractica.semanas) {
            throw new Error("Las horas y semanas de práctica son obligatorias");
        }

        if (!datosPractica.tipo_practica || !["publicada", "propia"].includes(datosPractica.tipo_practica)) {
            throw new Error("El tipo de práctica debe ser \"publicada\" o \"propia\"");
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
        const practicaRepository = getRepository(Practica);
        return await practicaRepository.find({
            where: { id_estudiante: idEstudiante },
            relations: ["docente"]
        });
    },

    async obtenerPracticaPorId(id) {
        const practicaRepository = getRepository(Practica);
        return await practicaRepository.findOne({
            where: { id_practica: id },
            relations: ["estudiante", "docente"]
        });
    },

    async actualizarEstadoPractica(id, estado, observaciones) {
        const practicaRepository = getRepository(Practica);
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
        const practicaRepository = getRepository(Practica);
        const practica = await practicaRepository.findOne({
            where: { id_practica: id }
        });

        if (!practica) {
            return null;
        }

        // Solo permitir actualizar si la práctica está en revisión pendiente
        if (practica.estado === "Revision_Pendiente") {
            Object.assign(practica, {
                ...datosActualizacion,
                fecha_actualizacion: new Date()
            });
            return await practicaRepository.save(practica);
        }
        return null;
    }
};

export default practicaService;