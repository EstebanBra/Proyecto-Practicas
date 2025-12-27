import { useState } from 'react';
import { subirDocumento } from '@services/documentos_finales_f.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useSubirDocumento = (fetchDocumentos) => {
    const [uploading, setUploading] = useState(false);

    const handleSubirDocumento = async (formData) => {
        if (!formData || !formData.get('id_practica')) {
            showErrorAlert('Error', 'Datos incompletos para subir documento');
            return { success: false, error: 'Datos incompletos' };
        }

        setUploading(true);
        try {
            const response = await subirDocumento(formData);

            if (response.error) {
                showErrorAlert('Error al subir', response.error);
                return { success: false, data: response };
            }

            showSuccessAlert('¡Éxito!', 'Documento subido correctamente');

            if (fetchDocumentos) {
                await fetchDocumentos();
            }

            return { success: true, data: response };
        } catch (error) {
            console.error('Error al subir el documento:', error);
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