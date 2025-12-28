import { useState } from 'react';
import { crearEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useCrearEvaluacion = (fetchEvaluacionByDocumento) => {
    const [submitting, setSubmitting] = useState(false);

    const handleCrearEvaluacion = async (evaluacionData) => {
        setSubmitting(true);
        const response = await crearEvaluacion(evaluacionData);

        if (response?.error) {
            showErrorAlert('Error', response.error);
            setSubmitting(false);
            return false;
        }

        showSuccessAlert('Éxito', 'Evaluación creada correctamente');

        if (fetchEvaluacionByDocumento) {
            await fetchEvaluacionByDocumento(evaluacionData.id_documento);
        }

        setSubmitting(false);
        return true;
    };

    return { submitting, handleCrearEvaluacion };
};

export default useCrearEvaluacion;
