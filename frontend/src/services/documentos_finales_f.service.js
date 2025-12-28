import axios from './root.service.js';

export async function getDocumentos() {
    try {
        const { data } = await axios.get('/documentos/');
        return data.data || [];
    } catch (error) {
        return error.response?.data || { error: "Error al obtener documentos" };
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
