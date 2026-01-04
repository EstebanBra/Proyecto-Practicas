import { useState, useCallback } from 'react';
import { calcularNotaFinal as serviceCalcularNotaFinal } from '@services/notaFinal.servicef.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import Swal from 'sweetalert2';

export function useCalcularNotaFinal() {
    const [calculando, setCalculando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const showConfirmAlert = (nombreEstudiante) => {
        return Swal.fire({
            title: 'Calcular Nota Final',
            html: `
                <div style="text-align: center;">
                    <p style="margin-bottom: 15px; font-size: 16px;">
                        ¿Desea calcular la nota final para el estudiante?
                    </p>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 15px 0;">
                        <strong style="color: #10b981; font-size: 18px;">
                            ${nombreEstudiante}
                        </strong>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        Esta acción calculará la nota final basada en el informe (70%) y autoevaluación (30%)
                    </p>
                </div>
            `,
            icon: 'question',
            iconColor: '#10b981',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, calcular',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-confirm-btn',
                cancelButton: 'custom-cancel-btn'
            },
            buttonsStyling: true,
            reverseButtons: true
        });
    };

    const calcular = useCallback(async (idPractica, nombreEstudiante = 'Estudiante') => {
        const confirmacion = await showConfirmAlert(nombreEstudiante);

        if (!confirmacion.isConfirmed) {
            return { cancelled: true };
        }

        setCalculando(true);
        setResultado(null);

        try {
            const response = await serviceCalcularNotaFinal(idPractica);

            const data = response?.data || response || {};
            const success = data.success !== false;
            const message = data.message || 'Operación completada';

            const notaProcesada = {
                success,
                message,
                nota_informe: data.nota_informe ?? data.data?.nota_informe ?? null,
                nota_autoevaluacion: data.nota_autoevaluacion ?? data.data?.nota_autoevaluacion ?? null,
                nota_final: data.nota_final ?? data.data?.nota_final ?? null,
                rawData: data
            };

            setResultado(notaProcesada);

            if (success) {
                let detallesHTML = '';

                if (notaProcesada.nota_informe != null && notaProcesada.nota_autoevaluacion != null) {
                    const notaInforme = parseFloat(notaProcesada.nota_informe).toFixed(1);
                    const notaAuto = parseFloat(notaProcesada.nota_autoevaluacion).toFixed(1);
                    const notaFinal = parseFloat(notaProcesada.nota_final).toFixed(1);
                    const ponderacionInforme = (notaProcesada.nota_informe * 0.7).toFixed(1);
                    const ponderacionAuto = (notaProcesada.nota_autoevaluacion * 0.3).toFixed(1);

                    detallesHTML = `
                    <div style="text-align: left; margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <div style="flex: 1; margin-right: 10px;">
                                <p style="margin: 8px 0; color: #374151;">
                                    <strong>Informe:</strong> ${notaInforme} × 70%
                                </p>
                                <p style="margin: 8px 0; color: #374151;">
                                    <strong>Autoevaluación:</strong> ${notaAuto} × 30%
                                </p>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 8px 0; color: #059669;">
                                    <strong>${ponderacionInforme} puntos</strong>
                                </p>
                                <p style="margin: 8px 0; color: #059669;">
                                    <strong>${ponderacionAuto} puntos</strong>
                                </p>
                            </div>
                        </div>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">
                                Nota Final: <span style="font-size: 24px;">${notaFinal}</span>
                            </p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                                Cálculo: (${notaInforme} × 0.7) + (${notaAuto} × 0.3) = ${notaFinal}
                            </p>
                        </div>
                    </div>`;
                }

                await Swal.fire({
                    title: '¡Nota Calculada!',
                    html: `
                        <div style="text-align: center;">
                            <p style="font-size: 16px; margin-bottom: 15px;">
                                ${message}
                            </p>
                            <div style="background: #d1fae5; padding: 12px; border-radius: 8px; margin: 10px 0;">
                                <strong style="color: #065f46;">
                                    ${nombreEstudiante}
                                </strong>
                            </div>
                            ${detallesHTML}
                        </div>
                    `,
                    icon: 'success',
                    iconColor: '#10b981',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                });

            } else {
                if (message.toLowerCase().includes('exitosamente') || message.toLowerCase().includes('calculada')) {
                    await Swal.fire({
                        title: '¡Nota Calculada!',
                        html: `
                            <div style="text-align: center;">
                                <p style="font-size: 16px; margin-bottom: 15px;">
                                    ${message}
                                </p>
                                <div style="background: #d1fae5; padding: 12px; border-radius: 8px;">
                                    <strong style="color: #065f46;">
                                        ${nombreEstudiante}
                                    </strong>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        iconColor: '#10b981',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    showErrorAlert('Error al Calcular', message);
                }
            }

            return notaProcesada;

        } catch (error) {
            console.error('Error en useCalcularNotaFinal:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Error inesperado al calcular la nota';

            showErrorAlert(
                'Error del Sistema',
                `<div style="text-align: left;">
                    <p style="margin-bottom: 10px;">${errorMessage}</p>
                    <p style="color: #6b7280; font-size: 14px;">
                        Estudiante: <strong>${nombreEstudiante}</strong>
                    </p>
                </div>`
            );

            return {
                success: false,
                message: errorMessage,
                error: true
            };

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
