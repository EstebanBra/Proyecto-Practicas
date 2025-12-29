import axios from './root.service.js';

export async function getDocumentos() {
    try {
        const { data } = await axios.get('/documentos/');
        if (data.success === false) {
            return { error: data.message || "Error al obtener documentos" };
        }
        return data.data || [];
    } catch (error) {
        return {
            error: error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al obtener documentos"
        };
    }
}

export async function getDocumentoById(id) {
    try {
        const { data } = await axios.get(`/documentos/${id}`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener documento" };
    }
}

export async function subirDocumento(formData) {
    try {
        const { data } = await axios.post('/documentos/subir', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al subir documento" };
    }
}

export async function updateEstadoDocumento(id, estado_revision) {
    try {
        const { data } = await axios.patch(`/documentos/${id}/estado`, {
            estado_revision
        });
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar estado" };
    }
}

export async function deleteDocumento(id) {
    try {
        const { data } = await axios.delete(`/documentos/${id}`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al eliminar documento" };
    }
}
