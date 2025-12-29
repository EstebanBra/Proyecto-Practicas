import { useState } from 'react';
import { subirDocumento } from '@services/documento.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const useSubirDocumento = (fetchDocumentos) => {
    const [uploading, setUploading] = useState(false);

    const handleSubirDocumento = async (formData) => {
        if (!formData || !formData.get('id_practica')) {
            showErrorAlert('Error', 'Datos incompletos para subir documento');
            return { success: false, error: 'Datos incompletos' };
        }
        
        const hasInforme = formData.has('informe');
        const hasAutoevaluacion = formData.has('autoevaluacion');

        if (!hasInforme && !hasAutoevaluacion) {
            showErrorAlert('Error', 'Debe seleccionar al menos un archivo');
            return { success: false, error: 'No hay archivos' };
        }

        setUploading(true);
        try {
            const response = await subirDocumento(formData);

            if (response.error) {
                showErrorAlert('Error al subir', response.error);
                return { success: false, data: response };
            }

            const successMessage = Array.isArray(response)
                ? `${response.length} documento(s) subido(s) correctamente`
                : 'Documento subido correctamente';

            showSuccessAlert('¡Éxito!', successMessage);

            if (fetchDocumentos) {
                await fetchDocumentos();
            }

            return { success: true, data: response };
        } catch (error) {
            showErrorAlert('Error', 'No se pudo subir el documento');
            return { success: false, data: { error: 'Error en la subida' } };
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        handleSubirDocumento
    };
};

export default useSubirDocumento;
