import { useState } from 'react';
import { updateEstadoDocumento } from '@services/documento.service.js';
import { showSuccessAlert, showErrorAlert, deleteDataAlert } from '@helpers/sweetAlert.js';

const useUpdateEstadoDocumento = (fetchDocumentos) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEstados = async (documentosArray, nuevoEstado) => {
        if (!documentosArray || documentosArray.length === 0) {
            showErrorAlert('Error', 'No hay documentos seleccionados');
            return false;
        }

        if (!['pendiente', 'revisado'].includes(nuevoEstado)) {
            showErrorAlert('Error', 'Estado no válido');
            return false;
        }

        const result = await deleteDataAlert(
            'Actualizar estado',
            `¿Está seguro de cambiar el estado a "${nuevoEstado}"?`,
            'Sí, actualizar'
        );

        if (!result.isConfirmed) {
            return false;
        }

        setUpdating(true);
        try {
            const promises = documentosArray.map(doc => {
                const id = doc.id_documento || doc.id;
                return updateEstadoDocumento(id, nuevoEstado);
            });

            const responses = await Promise.all(promises);

            const errores = responses.filter(r => r && r.error);
            if (errores.length > 0) {
                showErrorAlert('Error', 'Algunos documentos no pudieron actualizarse');
                return false;
            }

            showSuccessAlert('¡Éxito!', 'Estado(s) actualizado(s) correctamente');

            if (fetchDocumentos) {
                await fetchDocumentos();
            }

            return true;
        } catch (error) {
            showErrorAlert('Error', 'Error al actualizar estados');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateEstadoSimple = async (documento, nuevoEstado) => {
        if (!documento || !documento.id_documento) {
            showErrorAlert('Error', 'Documento no válido');
            return false;
        }

        return await handleUpdateEstados([documento], nuevoEstado);
    };

    return {
        updating,
        handleUpdateEstados,
        handleUpdateEstadoSimple
    };
};

export default useUpdateEstadoDocumento;
