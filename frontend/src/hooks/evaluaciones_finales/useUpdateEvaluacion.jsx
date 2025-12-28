import { useState } from 'react';
import { updateEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { deleteDataAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const useUpdateEvaluacion = (fetchEvaluacionByDocumento, fetchEvaluacionesDocente) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEvaluacion = async (evaluacion, updateData) => {
        const result = await deleteDataAlert(
            'Actualizar evaluación',
            '¿Está seguro de actualizar esta evaluación?'
        );

        if (!result.isConfirmed) return false;

        setUpdating(true);

        try {
            const dataConComentario = {
                ...updateData,
                comentario: updateData.comentario || ""
            };

            const response = await updateEvaluacion(
                evaluacion.id_evaluacion,
                dataConComentario
            );

            if (response?.error) {
                showErrorAlert('Error', response.error);
                return false;
            }

            if (fetchEvaluacionByDocumento) {
                await fetchEvaluacionByDocumento(evaluacion.id_documento);
            }

            if (fetchEvaluacionesDocente) {
                await fetchEvaluacionesDocente();
            }

            return true;
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            showErrorAlert('Error', 'Error inesperado al actualizar evaluación');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    return { updating, handleUpdateEvaluacion };
};

export default useUpdateEvaluacion;
