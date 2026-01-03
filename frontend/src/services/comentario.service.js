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

export async function downloadArchivoComentario(comentarioId, archivoIndex, nombreArchivo) {
    try {
        const response = await axios.get(`/comentario/archivo/${comentarioId}/${archivoIndex}`, {
            responseType: 'blob'
        });
        
        // Crear un enlace temporal para descargar
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', nombreArchivo || `archivo_${archivoIndex}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error al descargar el archivo' };
    }
}
export async function downloadComentariosExcel(usuarioId) {
    try {
        const response = await axios.get(`/comentario/plantilla/descargar/${usuarioId}`, {
            responseType: 'blob'
        });
        
        // Crear un enlace temporal para descargar
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `comentarios_estudiante_${usuarioId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error al descargar la plantilla' };
    }
}

export async function uploadComentariosExcel(usuarioId, archivo) {
    try {
        const formData = new FormData();
        formData.append('plantilla', archivo);
        
        const response = await axios.post(`/comentario/plantilla/subir/${usuarioId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // response.data tiene la estructura: { status: "Success", message, data }
        return {
            success: response.data.status === "Success",
            message: response.data.message,
            data: response.data.data
        };
    } catch (error) {
        const errorData = error.response?.data || {};
        return {
            success: false,
            message: errorData.message || 'Error al subir la plantilla'
        };
    }
}

export async function downloadComentariosExcelConRespuestas() {
    try {
        const response = await axios.get('/comentario/plantilla/descargar-respuestas', {
            responseType: 'blob'
        });
        
        // Crear un enlace temporal para descargar
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mis_comentarios_respondidos.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error al descargar la plantilla' };
    }
}