import axios from './root.service.js';

export async function createComentario(dataComentario) {
    try {
        // Si hay archivos, usar FormData
        if (dataComentario.archivos && dataComentario.archivos.length > 0) {
            const formData = new FormData();
            formData.append('mensaje', dataComentario.mensaje);
            formData.append('estado', dataComentario.estado || 'Pendiente');
            formData.append('nivelUrgencia', dataComentario.nivelUrgencia || 'normal');
            formData.append('tipoProblema', dataComentario.tipoProblema || 'General');
            
            // Agregar todos los archivos
            dataComentario.archivos.forEach(file => {
                formData.append('archivos', file);
            });
            
            const response = await axios.post('/comentario', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } else {
            const response = await axios.post('/comentario', dataComentario);
            return response.data;
        }
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error en la solicitud' };
    }
}

export async function getComentarios() {
    try {
        const response = await axios.get('/comentario');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getComentarioById(id) {
    try {
        const response = await axios.get(`/comentario/${id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function updateComentario(id, dataComentario) {
    try {
        // Si hay archivos, usar FormData
        if (dataComentario.archivos && dataComentario.archivos.length > 0) {
            const formData = new FormData();
            formData.append('mensaje', dataComentario.mensaje);
            formData.append('estado', dataComentario.estado || 'Pendiente');
            formData.append('nivelUrgencia', dataComentario.nivelUrgencia || 'normal');
            formData.append('tipoProblema', dataComentario.tipoProblema || 'General');
            
            // Agregar todos los archivos
            dataComentario.archivos.forEach(file => {
                formData.append('archivos', file);
            });
            
            const response = await axios.put(`/comentario/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } else {
            const response = await axios.put(`/comentario/${id}`, dataComentario);
            return response.data;
        }
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error en la solicitud' };
    }
}

export async function deleteComentario(id) {
    try {
        const response = await axios.delete(`/comentario/${id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getComentariosByUsuarioId(usuarioId) {
    try {
        const response = await axios.get(`/comentario/usuario/${usuarioId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function getAllComentarios() {
    try {
        const response = await axios.get('/comentario/todos');
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}
