import { useState } from 'react';
import { crearAutoevaluacion } from '@services/evaluaciones_finales.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useCrearAutoevaluacion = (fetchAutoevaluacionesByDocumento) => {
    const [submitting, setSubmitting] = useState(false);

    const handleCrearAutoevaluacion = async (autoevaluacionData) => {
        if (!autoevaluacionData.nota) {
            showErrorAlert('Error', 'Debe ingresar una nota de autoevaluación');
            return { success: false, error: 'Nota requerida' };
        }

        if (autoevaluacionData.nota < 1 || autoevaluacionData.nota > 7) {
            showErrorAlert('Error', 'La nota de autoevaluación debe estar entre 1.0 y 7.0');
            return { success: false, error: 'Nota inválida' };
        }

        if (!autoevaluacionData.id_documento) {
            showErrorAlert('Error', 'El ID del documento es requerido');
            return { success: false, error: 'Documento requerido' };
        }

        setSubmitting(true);
        try {
            const response = await crearAutoevaluacion(autoevaluacionData);

            if (response.error) {
                showErrorAlert('Error al crear autoevaluación', response.error);
                return { success: false, data: response };
            }

            showSuccessAlert('¡Éxito!', 'Autoevaluación enviada correctamente');

            if (fetchAutoevaluacionesByDocumento && autoevaluacionData.id_documento) {
                await fetchAutoevaluacionesByDocumento(autoevaluacionData.id_documento);
            }

            return { success: true, data: response };
        } catch (error) {
            console.error('Error al crear la autoevaluación:', error);
            showErrorAlert('Error', 'No se pudo enviar la autoevaluación');
            return { success: false, data: { error: 'Error al enviar autoevaluación' } };
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        handleCrearAutoevaluacion
    };
};

export default useCrearAutoevaluacion;