import { useState } from 'react';
import { crearEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useCrearEvaluacion = (fetchEvaluacionesByDocumento) => {
    const [submitting, setSubmitting] = useState(false);

    const handleCrearEvaluacion = async (evaluacionData) => {

        if (!evaluacionData.id_documento || !evaluacionData.nota) {
            showErrorAlert('Error', 'El ID del documento y la nota son obligatorios');
            return { success: false, error: 'Datos incompletos' };
        }

        if (evaluacionData.nota < 1 || evaluacionData.nota > 7) {
            showErrorAlert('Error', 'La nota debe estar entre 1.0 y 7.0');
            return { success: false, error: 'Nota inválida' };
        }

        setSubmitting(true);
        try {
            const response = await crearEvaluacion(evaluacionData);

            if (response.error) {
                showErrorAlert('Error al crear evaluación', response.error);
                return { success: false, data: response };
            }

            showSuccessAlert('¡Éxito!', 'Evaluación creada correctamente');

            if (fetchEvaluacionesByDocumento && evaluacionData.id_documento) {
                await fetchEvaluacionesByDocumento(evaluacionData.id_documento);
            }

            return { success: true, data: response };
        } catch (error) {
            console.error('Error al crear la evaluación:', error);
            showErrorAlert('Error', 'No se pudo crear la evaluación');
            return { success: false, data: { error: 'Error al crear evaluación' } };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        handleCrearEvaluacion
    };
};

export default useCrearEvaluacion;