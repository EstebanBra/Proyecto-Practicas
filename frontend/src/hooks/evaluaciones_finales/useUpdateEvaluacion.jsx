import { useState } from 'react';
import { updateEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { deleteDataAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const useUpdateEvaluacion = (fetchEvaluacionesDocente) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEvaluacion = async (evaluacion, updateData) => {
        const result = await deleteDataAlert(
            'Actualizar evaluación',
            '¿Está seguro de actualizar esta evaluación?'
        );

        if (!result.isConfirmed) return false;

        setUpdating(true);

        try {
            const response = await updateEvaluacion(
                evaluacion.id_evaluacion,
                {
                    ...updateData,
                    comentario: updateData.comentario || ""
                }
            );

            if (response?.error) {
                showErrorAlert('Error', response.error);
                return false;
            }

            await fetchEvaluacionesDocente(); // 🔥 CLAVE

            return true;
        } catch {
            showErrorAlert('Error', 'Error inesperado al actualizar evaluación');
            return false;
        } finally {
            setUpdating(false);
        }
    };

    return { updating, handleUpdateEvaluacion };
};

export default useUpdateEvaluacion;
