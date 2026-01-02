import { useState, useCallback } from 'react';
import { calcularNotaFinal as serviceCalcularNotaFinal } from '@services/notaFinal.servicef.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

export function useCalcularNotaFinal() {
    const [calculando, setCalculando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const calcular = useCallback(async (idPractica) => {
        setCalculando(true);
        setResultado(null);

        try {
            const result = await serviceCalcularNotaFinal(idPractica);

            // Extraemos datos de forma segura
            const data = result?.data?.data || result?.data || {};

            const notaProcesada = {
                success: result.success,
                message: result.message,

                // componentes de la nota
                nota_informe: data.nota_informe ?? null,
                nota_autoevaluacion: data.nota_autoevaluacion ?? null,
                nota_final: data.nota_final ?? null,

                // por si el backend usa otros nombres
                ...data
            };

            setResultado(notaProcesada);

            if (result.success) {
                let extraMsg = '';

                if (data.nota_informe != null && data.nota_autoevaluacion != null) {
                    extraMsg =
                        `\n\nInforme: ${parseFloat(data.nota_informe).toFixed(1)} ` +
                        `| Autoevaluación: ${parseFloat(data.nota_autoevaluacion).toFixed(1)} ` +
                        `| Final: ${parseFloat(data.nota_final).toFixed(1)}`;
                }

                showSuccessAlert('¡Nota Calculada!', result.message + extraMsg);
            } else {
                showErrorAlert('Error', result.message || 'No fue posible calcular la nota');
            }

            return notaProcesada;

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
