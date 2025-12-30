import axios from './root.service.js';

/**
 * Calcular nota final (estudiante)
 */
export async function calcularNotaFinal() {
    try {
        const { data } = await axios.post('/notas/calcular');
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al calcular la nota final'
        };
    }
}

/**
 * Validar prerequisitos para calcular nota (estudiante)
 */
export async function validarPrerequisitosNota() {
    try {
        const { data } = await axios.get('/notas/validar-prerequisitos');
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al validar prerequisitos'
        };
    }
}

/**
 * Obtener mi nota final (estudiante)
 */
export async function obtenerMiNotaFinal() {
    try {
        const { data } = await axios.get('/notas/mi-nota');
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener la nota final'
        };
    }
}

/**
 * Obtener notas finales de estudiantes asignados (docente)
 */
export async function obtenerNotasEstudiantes() {
    try {
        const { data } = await axios.get('/notas/estudiantes');
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener notas de estudiantes'
        };
    }
}

/**
 * Obtener todas las notas finales (admin)
 */
export async function obtenerTodasNotas() {
    try {
        const { data } = await axios.get('/notas/todas');
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener todas las notas'
        };
    }
}