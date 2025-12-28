import { useState } from 'react';
import { updateEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useUpdateEvaluacion = (fetchEvaluacionByDocumento) => {
    const [updating, setUpdating] = useState(false);

    const handleUpdateEvaluacion = async (evaluacion, updateData) => {
        const result = await deleteDataAlert(
            'Actualizar evaluación',
            '¿Está seguro de actualizar esta evaluación?'
        );

        if (!result.isConfirmed) return false;

        setUpdating(true);
        const response = await updateEvaluacion(evaluacion.id_evaluacion, updateData);

        if (response?.error) {
            showErrorAlert('Error', response.error);
            setUpdating(false);
            return false;
        }

        showSuccessAlert('Éxito', 'Evaluación actualizada');

        if (fetchEvaluacionByDocumento) {
            await fetchEvaluacionByDocumento(evaluacion.id_documento);
        }

        setUpdating(false);
        return true;
    };

    return { updating, handleUpdateEvaluacion };
};

export default useUpdateEvaluacion;
