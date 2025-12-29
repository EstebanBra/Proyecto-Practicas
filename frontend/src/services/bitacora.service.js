import axios from './root.service.js';

// Servicio para Bitácoras
export const bitacoraService = {
    async obtenerMiPractica() {
        try {
            const response = await axios.get('/bitacora/mi-practica');
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'No se encontró práctica';
            return { data: null, error: errorMessage };
        }
    },

    async crearBitacora(bitacoraData) {
        try {
            const response = await axios.post('/bitacora/registrar', bitacoraData);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al crear la bitácora';
            return { data: null, error: errorMessage };
        }
    },

    async obtenerBitacora(id) {
        try {
            const response = await axios.get(`/bitacora/${id}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener la bitácora';
            return { data: null, error: errorMessage };
        }
    },

    async obtenerBitacoras(idPractica) {
        try {
            const response = await axios.get(`/bitacora/practica/${idPractica}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener las bitácoras';
            return { data: null, error: errorMessage };
        }
    },

    async obtenerUltimaSemana(idPractica) {
        try {
            const response = await axios.get(`/bitacora/ultima-semana/${idPractica}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener la última semana';
            return { data: null, error: errorMessage };
        }
    },

    async buscarPorRut(rut) {
        try {
            const response = await axios.get(`/bitacora/buscar-rut/${rut}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al buscar bitácoras';
            return { data: null, error: errorMessage };
        }
    },

    async actualizarEstado(idBitacora, estadoRevision, nota = null) {
        try {
            const body = { estado_revision: estadoRevision };
            if (nota !== null) {
                body.nota = nota;
            }
            const response = await axios.put(`/bitacora/${idBitacora}/estado`, body);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el estado';
            return { data: null, error: errorMessage };
        }
    },

    async eliminarBitacora(idBitacora) {
        try {
            const response = await axios.delete(`/bitacora/${idBitacora}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar la bitácora';
            return { data: null, error: errorMessage };
        }
    },

    async descargarArchivo(idBitacora, nombreArchivo) {
        try {
            const response = await axios.get(`/bitacora/${idBitacora}/descargar`, {
                responseType: 'blob'
            });
            
            // Crear un enlace temporal para descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo || `bitacora_${idBitacora}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al descargar el archivo';
            return { success: false, error: errorMessage };
        }
    }
};

// Servicio para Documentos de Bitácora
export const documentoService = {
    async subirArchivo(file) {
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await axios.post('/bitacoradocumento/subir', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al subir el archivo';
            return { data: null, error: errorMessage };
        }
    },

    async registrarDocumento(documentoData) {
        try {
            const response = await axios.post('/bitacoradocumento/registrar', documentoData);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al registrar el documento';
            return { data: null, error: errorMessage };
        }
    },

    async obtenerDocumentos(idPractica) {
        try {
            const response = await axios.get(`/bitacoradocumento/practica/${idPractica}`);
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al obtener los documentos';
            return { data: null, error: errorMessage };
        }
    },

    async actualizarEstadoDocumento(idDocumento, estadoRevision) {
        try {
            const response = await axios.put(
                `/bitacoradocumento/${idDocumento}/estado`,
                { estado_revision: estadoRevision }
            );
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el documento';
            return { data: null, error: errorMessage };
        }
    },

    async descargarDocumento(idDocumento, nombreArchivo) {
        try {
            const response = await axios.get(`/bitacoradocumento/descargar/${idDocumento}`, {
                responseType: 'blob'
            });
            
            // Crear un enlace temporal para descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo || `documento_${idDocumento}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al descargar el documento';
            return { success: false, error: errorMessage };
        }
    }
};

export default { bitacoraService, documentoService };
