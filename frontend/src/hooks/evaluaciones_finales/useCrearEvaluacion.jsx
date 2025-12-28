import { useState } from 'react';
import { crearEvaluacion } from '@services/evaluaciones_finales_f.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';

const useCrearEvaluacion = (fetchEvaluacionByDocumento, fetchEvaluacionesDocente) => {
    const [submitting, setSubmitting] = useState(false);

    const handleCrearEvaluacion = async (evaluacionData) => {
        setSubmitting(true);

        try {
            const dataConComentario = {
                ...evaluacionData,
                comentario: evaluacionData.comentario || ""
            };

            const response = await crearEvaluacion(dataConComentario);

            if (response?.error) {
                showErrorAlert('Error', response.error);
                return false;
            }

            if (fetchEvaluacionByDocumento) {
                await fetchEvaluacionByDocumento(evaluacionData.id_documento);
            }

            if (fetchEvaluacionesDocente) {
                await fetchEvaluacionesDocente();
            }

            return true;
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            showErrorAlert('Error', 'Error inesperado al crear evaluación');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return { submitting, handleCrearEvaluacion };
};

export default useCrearEvaluacion;
