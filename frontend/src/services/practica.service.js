import axios from './root.service.js';

/**
 * Crear una práctica externa (para estudiantes)
 */
export async function crearPracticaExterna(datosPractica) {
    try {
        const response = await axios.post('/practica/externa', datosPractica);
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al crear la práctica externa'
        };
    }
}

/**
 * Obtener mi práctica actual
 */
export async function obtenerMiPractica() {
    try {
        const response = await axios.get('/practica/mi-practica');
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al obtener la práctica'
        };
    }
}

/**
 * Obtener todas mis prácticas
 */
export async function obtenerMisPracticas() {
    try {
        const response = await axios.get('/practica/mis-practicas');
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al obtener las prácticas'
        };
    }
}

/**
 * Obtener práctica por ID
 */
export async function obtenerPracticaPorId(id) {
    try {
        const response = await axios.get(`/practica/${id}`);
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al obtener la práctica'
        };
    }
}

/**
 * Actualizar práctica
 */
export async function actualizarPractica(id, datosActualizacion) {
    try {
        const response = await axios.put(`/practica/${id}`, datosActualizacion);
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al actualizar la práctica'
        };
    }
}

/**
 * Finalizar práctica
 */
export async function finalizarPractica(id) {
    try {
        const response = await axios.patch(`/practica/${id}/finalizar`);
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al finalizar la práctica'
        };
    }
}

/**
 * Obtener todas las prácticas (para docentes/admin)
 */
export async function obtenerTodasPracticas() {
    try {
        const response = await axios.get('/practica/todas');
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al obtener las prácticas'
        };
    }
}

/**
 * Asignar docente a práctica
 */
export async function asignarDocente(idPractica, idDocente) {
    try {
        const response = await axios.patch(`/practica/${idPractica}/asignar-docente`, { id_docente: idDocente });
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al asignar docente'
        };
    }
}

/**
 * Calificar práctica
 */
export async function calificarPractica(idPractica, nota) {
    try {
        const response = await axios.patch(`/practica/${idPractica}/calificar`, { nota });
        return response.data;
    } catch (error) {
        return {
            status: "Error",
            message: error.response?.data?.message || 'Error al calificar la práctica'
        };
    }
}
