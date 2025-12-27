import { useState } from 'react';
import { updateEvaluacion } from '@services/evaluaciones_finales.service.js';
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useUpdateEvaluacion = (fetchEvaluacionesByDocumento, setDataEvaluacion) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEvaluacion = async (dataEvaluacion, updateData) => {
        if (dataEvaluacion.length > 0) {
            setUpdating(true);
            try {
                const result = await deleteDataAlert(
                    'Actualizar evaluación',
                    '¿Está seguro de actualizar esta evaluación?'
                );

                if (result.isConfirmed) {
                    const response = await updateEvaluacion(
                        dataEvaluacion[0].id_evaluacion,
                        updateData
                    );

                    if(response.error) {
                        showErrorAlert('Error', response.details || response.error);
                        return false;
                    }

                    showSuccessAlert(
                        '¡Actualizado!',
                        'La evaluación ha sido actualizada correctamente.'
                    );

                    // Refrescar evaluaciones del documento
                    if (fetchEvaluacionesByDocumento && dataEvaluacion[0].id_documento) {
                        await fetchEvaluacionesByDocumento(dataEvaluacion[0].id_documento);
                    }

                    // Limpiar selección
                    if (setDataEvaluacion) {
                        setDataEvaluacion([]);
                    }

                    return true;
                } else {
                    showErrorAlert('Cancelado', 'La operación ha sido cancelada.');
                    return false;
                }
            } catch (error) {
                console.error('Error al actualizar la evaluación:', error);
                showErrorAlert('Error', 'Ocurrió un error al actualizar la evaluación.');
                return false;
            } finally {
                setUpdating(false);
            }
        }
    };

    return {
        updating,
        handleUpdateEvaluacion
    };
};

export default useUpdateEvaluacion;