import { useState, useCallback } from 'react';
import { calcularNotaFinal as serviceCalcularNotaFinal } from '@services/notaFinal.servicef.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

export function useCalcularNotaFinal() {
    const [calculando, setCalculando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const calcular = useCallback(async () => {
        setCalculando(true);
        setResultado(null);

        try {
            const result = await serviceCalcularNotaFinal();
            setResultado(result);

            if (result.success) {
                showSuccessAlert('¡Éxito!', result.message);
            } else {
                showErrorAlert('Error', result.message);
            }

            return result;
        } catch (error) {
            const errorResult = {
                success: false,
                message: 'Error inesperado al calcular la nota'
            };
            setResultado(errorResult);
            showErrorAlert('Error', errorResult.message);
            return errorResult;
        } finally {
            setCalculando(false);
        }
    }, []);

    return {
        calcular,
        calculando,
        resultado
    };
}
