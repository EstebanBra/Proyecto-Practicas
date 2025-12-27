import axios from './root.service.js';

export async function getDocumentos() {
    try {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const rol = usuario?.rol;

        let endpoint = '/documentos/';

        if (rol === 'estudiante') {
            endpoint = '/documentos/et/';
        } else if (rol === 'docente') {
            endpoint = '/documentos/';
        } else {
            return { error: "Usuario sin rol válido" };
        }

        const { data } = await axios.get(endpoint);

        if (data === '') {
            return [];
        }

        return data.data || data;

    } catch (error) {
        if (error.response?.status === 403) {
            return {
                error: "Acceso denegado. No tienes permisos para ver estos documentos."
            };
        }

        if (error.response?.status === 204) {
            return [];
        }

        return error.response?.data || { error: "Error al obtener documentos" };
    }
}

export async function getDocumentoById(id) {
    try {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const rol = usuario?.rol;

        let endpoint = `/documentos/${id}`;

        if (rol === 'estudiante') {
            endpoint = `/documentos/et/${id}`;
        }

        const { data } = await axios.get(endpoint);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener documento" };
    }
}

export async function subirDocumento(formData) {
    try {
        const { data } = await axios.post('/documentos/subir', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al subir documento" };
    }
}

export async function updateEstadoDocumento(id, estado) {
    try {
        const { data } = await axios.patch(`/documentos/${id}/estado`, {
            estado_revision: estado
        });
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar estado" };
    }
}