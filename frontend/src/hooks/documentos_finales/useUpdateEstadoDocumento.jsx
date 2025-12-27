// useUpdateEstadoDocumento.jsx - VERSIÓN SIMPLIFICADA
import { useState } from 'react';
import { updateEstadoDocumento } from '@services/documentos_finales_f.service.js';

const useUpdateEstadoDocumento = (fetchDocumentos, setDataDocumento) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEstados = async (documentosArray, nuevoEstado) => {
        if (!documentosArray || documentosArray.length === 0) return false;

        setUpdating(true);
        try {
            const promises = documentosArray.map(doc => {
                if (doc && doc.id_documento) {
                    return updateEstadoDocumento(doc.id_documento, nuevoEstado);
                }
                return Promise.resolve(null);
            });

            const responses = await Promise.all(promises);

            const errores = responses.filter(r => r && r.error);
            if (errores.length > 0) {
                console.error('Errores al actualizar estados:', errores);
                return false;
            }

            if (fetchDocumentos) {
                await fetchDocumentos();
            }

            if (setDataDocumento) {
                setDataDocumento([]);
            }

            return true;
        } catch (error) {
            console.error('Error al actualizar estados:', error);
            return false;
        } finally {
            setUpdating(false);
        }
    };

    return {
        updating,
        handleUpdateEstados
    };
};

export default useUpdateEstadoDocumento;