import { useState } from 'react';
import { updateEstadoDocumento } from '@services/documentos_finales.service.js';
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useUpdateEstadoDocumento = (fetchDocumentos, setDataDocumento) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEstado = async (dataDocumento, nuevoEstado) => {
        if (dataDocumento.length > 0) {
            setUpdating(true);
            try {
                const result = await deleteDataAlert(
                    'Cambiar estado del documento',
                    `¿Está seguro de cambiar el estado a "${nuevoEstado}"?`
                );

                if (result.isConfirmed) {
                    const response = await updateEstadoDocumento(
                        dataDocumento[0].id_documento,
                        nuevoEstado
                    );

                    if(response.error) {
                        showErrorAlert('Error', response.details || response.error);
                        return false;
                    }

                    showSuccessAlert(
                        '¡Actualizado!',
                        'El estado del documento ha sido actualizado correctamente.'
                    );

                    if (fetchDocumentos) {
                        await fetchDocumentos();
                    }

                    if (setDataDocumento) {
                        setDataDocumento([]);
                    }

                    return true;
                } else {
                    showErrorAlert('Cancelado', 'La operación ha sido cancelada.');
                    return false;
                }
            } catch (error) {
                console.error('Error al actualizar el estado:', error);
                showErrorAlert('Error', 'Ocurrió un error al actualizar el estado.');
                return false;
            } finally {
                setUpdating(false);
            }
        }
    };

    return {
        updating,
        handleUpdateEstado
    };
};

export default useUpdateEstadoDocumento;