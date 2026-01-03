import axios from './root.service.js';

export async function calcularNotaFinal(idPractica) {
    try {
        const { data } = await axios.post('/notas/calcular', {
            id_practica: idPractica
        });
        return data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al calcular la nota final'
        };
    }
}


export async function obtenerMiNotaFinal() {
    try {
        const { data } = await axios.get('/notas/mi-nota');
        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener la nota final'
        };
    }
}

export async function obtenerNotasEstudiantes() {
    try {
        const { data } = await axios.get('/notas/estudiantes');

        return {
            success: true,
            data: data.data || [],
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener notas'
        };
    }
}

export async function obtenerTodasNotas() {
    try {
        const { data } = await axios.get('/notas/todas');
        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener todas las notas'
        };
    }
}

export async function obtenerNotaFinalById(id) {
    try {
        const { data } = await axios.get(`/notas/${id}`);
        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al obtener la nota final por ID'
        };
    }
}

export async function exportarNotasFinalesExcelService() {
    try {
        const response = await axios.get(
            '/notas/notas-finales/exportar',
            { responseType: 'blob' }
        );

        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Error al exportar Excel'
        };
    }
}