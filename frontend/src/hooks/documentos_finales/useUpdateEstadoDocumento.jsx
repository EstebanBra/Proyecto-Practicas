import { useState } from 'react';
import { updateEstadoDocumento } from '@services/documentos_finales_f.service.js';
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useUpdateEstadoDocumento = (fetchDocumentos, setDataDocumento) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEstados = async (documentosArray, nuevoEstado) => {
        if (!documentosArray || documentosArray.length === 0) {
            showErrorAlert('Error', 'No hay documentos seleccionados');
            return false;
        }

        if (!['pendiente', 'revisado', 'calificado'].includes(nuevoEstado)) {
            showErrorAlert('Error', 'Estado no válido');
            return false;
        }

        const result = await deleteDataAlert(
            'Actualizar estado',
            `¿Está seguro de cambiar el estado a "${nuevoEstado}"?`
        );

        if (!result.isConfirmed) {
            showErrorAlert('Cancelado', 'La operación ha sido cancelada.');
            return false;
        }

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
                showErrorAlert('Error', 'Algunos estados no se pudieron actualizar');
                return false;
            }

            showSuccessAlert('¡Éxito!', 'Estado(s) actualizado(s) correctamente');

            if (fetchDocumentos) {
                await fetchDocumentos();
            }

            if (setDataDocumento) {
                setDataDocumento([]);
            }

            return true;
        } catch (error) {
            console.error('Error al actualizar estados:', error);
            showErrorAlert('Error', 'Ocurrió un error al actualizar los estados');
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
