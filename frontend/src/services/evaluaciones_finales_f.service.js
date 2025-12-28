import axios from './root.service.js';

export async function crearEvaluacion(evaluacionData) {
    try {
        const { data } = await axios.post('/evaluaciones/', evaluacionData);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al crear evaluación" };
    }
}

export async function getEvaluacionByDocumento(id_documento) {
    try {
        const { data } = await axios.get(`/evaluaciones/documento/${id_documento}`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener evaluación" };
    }
}

export async function getEvaluacionesByDocente() {
    try {
        const { data } = await axios.get('/evaluaciones/docente');
        return data.data || [];
    } catch (error) {
        return error.response?.data || { error: "Error al obtener evaluaciones" };
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
