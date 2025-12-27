import axios from './root.service.js';

export async function crearEvaluacion(evaluacionData) {
    try {
        const { data } = await axios.post('/evaluaciones/', evaluacionData);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al crear evaluación" };
    }
}

export async function crearAutoevaluacion(autoevaluacionData) {
    try {
        const { data } = await axios.post('/evaluaciones/autoevaluacion', autoevaluacionData);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al crear autoevaluación" };
    }
}

export async function getEvaluacionesByDocumento(id_documento) {
    try {
        const { data } = await axios.get(`/evaluaciones/documento/${id_documento}`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener evaluaciones" };
    }
}

export async function getEvaluacionesByDocente() {
    try {
        const { data } = await axios.get('/evaluaciones/docente');
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener evaluaciones del docente" };
    }
}

export async function getAutoevaluacionesByEstudiante() {
    try {
        const { data } = await axios.get('/evaluaciones/estudiante');
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener autoevaluaciones" };
    }
}

export async function updateEvaluacion(id_evaluacion, updateData) {
    try {
        const { data } = await axios.patch(`/evaluaciones/${id_evaluacion}`, updateData);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar evaluación" };
    }
}

export async function getAutoevaluacionesByDocumento(id_documento) {
    try {
        const { data } = await axios.get(`/evaluaciones/documento/${id_documento}`);

        if (data.data && Array.isArray(data.data)) {
            const autoevaluaciones = data.data.filter(e =>
                e.tipo_evaluacion === "autoevaluacion" || e.rol_usuario === "estudiante"
            );
            return autoevaluaciones;
        }

        return data.data || [];
    } catch (error) {
        return error.response?.data || { error: "Error al obtener autoevaluaciones" };
    }
}

export async function getEvaluacionesDocenteByDocumento(id_documento) {
    try {
        const { data } = await axios.get(`/evaluaciones/documento/${id_documento}`);

        if (data.data && Array.isArray(data.data)) {
            const evaluacionesDocente = data.data.filter(e =>
                e.tipo_evaluacion === "evaluacion_docente" || e.rol_usuario === "docente"
            );
            return evaluacionesDocente;
        }

        return data.data || [];
    } catch (error) {
        return error.response?.data || { error: "Error al obtener evaluaciones del docente" };
    }
}