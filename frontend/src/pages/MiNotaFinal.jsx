import { useState, useCallback } from 'react';
import { useMiNotaFinal } from '@hooks/notafinales/useMiNotaFinal.jsx';
import { useCalcularNotaFinal } from '@hooks/notafinales/useCalcularNotaFinal.jsx';
import '@styles/notaFinal.css';

const MiNotaFinal = () => {
    const { nota, documentos, todosDocumentos, loading, error, reloadAll } = useMiNotaFinal();
    const { calcular, calculando } = useCalcularNotaFinal();
    const [actualizando, setActualizando] = useState(false);

    const handleCalcularNota = useCallback(async () => {
        setActualizando(true);
        const result = await calcular();
        if (result?.success) {
            await reloadAll();
        }
        setActualizando(false);
    }, [calcular, reloadAll]);

    const estaCalculando = calculando || actualizando;

    if (loading) {
        return (
            <div className="nota-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando nota y documentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="nota-container">
            <div className="nota-content">
                <div className="nota-header">
                    <h1 className="nota-title">Mi Nota Final</h1>
                    <button
                        className="btn-calcular"
                        onClick={handleCalcularNota}
                        disabled={estaCalculando}
                    >
                        {estaCalculando ? 'Calculando...' : 'Recalcular Nota'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {nota ? (
                    <div className="nota-card">
                        <div className="nota-principal">
                            <div className="nota-circular">
                                <div className="nota-valor">{nota.nota_final}</div>
                                <div className="nota-label">NOTA FINAL</div>
                            </div>
                            <div className="nota-estado">
                                <span className={`estado-badge ${nota.estado || 'desconocido'}`}>
                                    {nota.estado || 'N/A'}
                                </span>
                                <p className="fecha-calculo">
                                    Calculada: {nota.fecha_calculo ?
                                    new Date(nota.fecha_calculo).toLocaleDateString() :
                                    'Fecha no disponible'}
                                </p>
                            </div>
                        </div>

                        <div className="nota-detalles">
                            <h3>Detalles del Cálculo</h3>
                            <div className="detalles-grid">
                                <div className="detalle-item">
                                    <span className="detalle-label">Promedio Bitácoras:</span>
                                    <span className="detalle-valor">
                                        {nota.promedio_bitacoras != null ?
                                            parseFloat(nota.promedio_bitacoras).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="detalle-porcentaje">(50%)</span>
                                </div>
                                <div className="detalle-item">
                                    <span className="detalle-label">Nota Informe:</span>
                                    <span className="detalle-valor">
                                        {nota.nota_informe != null ?
                                            parseFloat(nota.nota_informe).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="detalle-porcentaje">(30%)</span>
                                </div>
                                <div className="detalle-item">
                                    <span className="detalle-label">Nota Autoevaluación:</span>
                                    <span className="detalle-valor">
                                        {nota.nota_autoevaluacion != null ?
                                            parseFloat(nota.nota_autoevaluacion).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="detalle-porcentaje">(20%)</span>
                                </div>
                            </div>

                            <div className="formula-info">
                                <h4>Fórmula de Cálculo</h4>
                                <p>
                                    Nota Final = (Bitácoras × 50%) + (Informe × 30%) + (Autoevaluación × 20%)
                                </p>
                                {nota.promedio_bitacoras != null &&
                                    nota.nota_informe != null &&
                                    nota.nota_autoevaluacion != null && (
                                        <p className="formula-ejemplo">
                                            ({parseFloat(nota.promedio_bitacoras).toFixed(1)} × 0.5) +
                                            ({parseFloat(nota.nota_informe).toFixed(1)} × 0.3) +
                                            ({parseFloat(nota.nota_autoevaluacion).toFixed(1)} × 0.2) =
                                            <strong> {nota.nota_final}</strong>
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-nota">
                        <h3>No hay nota calculada</h3>
                        <p>Para calcular tu nota final necesitas:</p>
                        <ul className="requisitos-list">
                            <li>Práctica finalizada</li>
                            <li>Bitácoras calificadas</li>
                            <li>Informe revisado y calificado</li>
                            <li>Autoevaluación revisada y calificada</li>
                        </ul>
                        <button
                            className="btn-calcular"
                            onClick={handleCalcularNota}
                            disabled={estaCalculando}
                        >
                            {estaCalculando ? 'Calculando...' : 'Calcular Nota Final'}
                        </button>
                    </div>
                )}

                {/* SECCIÓN DE DOCUMENTOS - SIEMPRE VISIBLE */}
                <div className="documentos-container">
                    <h2 className="documentos-title">📚 Mis Documentos</h2>

                    {todosDocumentos?.length > 0 ? (
                        <div className="documentos-section">
                            <div className="documentos-list">
                                <table className="documentos-table">
                                    <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Fecha de Entrega</th>
                                        <th>Estado</th>
                                        <th>Nota</th>
                                        <th>Comentarios</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {todosDocumentos.map((documento, index) => (
                                        <tr key={index} className={`documento-row tipo-${documento.tipo || 'otro'}`}>
                                            <td>
                                                    <span className={`tipo-badge tipo-${documento.tipo || 'otro'}`}>
                                                        {documento.tipo === 'informe' ? '📄 Informe' :
                                                            documento.tipo === 'autoevaluacion' ? '📝 Autoevaluación' :
                                                                documento.tipo === 'bitacora' ? '📓 Bitácora' :
                                                                    '📎 ' + (documento.tipo || 'Otro')}
                                                    </span>
                                            </td>
                                            <td>
                                                {documento.fecha_subida
                                                    ? new Date(documento.fecha_subida).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td>
                                                    <span className={`estado-badge ${documento.estado || 'pendiente'}`}>
                                                        {documento.estado === 'revisado' ? '✅ Revisado' :
                                                            documento.estado === 'pendiente' ? '⏳ Pendiente' :
                                                                documento.estado === 'aprobado' ? '✅ Aprobado' :
                                                                    documento.estado === 'rechazado' ? '❌ Rechazado' :
                                                                        documento.estado || 'Pendiente'}
                                                    </span>
                                            </td>
                                            <td className="nota-cell">
                                                {documento.nota_revision != null ? (
                                                    <span className={`nota-revision ${documento.nota_revision >= 4 ? 'aprobado' : 'reprobado'}`}>
                                                            {parseFloat(documento.nota_revision).toFixed(1)}
                                                        </span>
                                                ) : documento.estado === 'revisado' ? (
                                                    <span className="sin-nota">Sin calificar</span>
                                                ) : (
                                                    <span className="no-revisado">No revisado</span>
                                                )}
                                            </td>
                                            <td className="comentarios-cell">
                                                {documento.comentario || 'Sin comentarios'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumen de documentos */}
                            <div className="documentos-resumen">
                                <div className="resumen-item">
                                    <span className="resumen-label">Total documentos:</span>
                                    <span className="resumen-valor">{todosDocumentos.length}</span>
                                </div>
                                <div className="resumen-item">
                                    <span className="resumen-label">Documentos revisados:</span>
                                    <span className="resumen-valor">
                                        {todosDocumentos.filter(d => d.estado === 'revisado' || d.estado === 'aprobado').length}
                                    </span>
                                </div>
                                <div className="resumen-item">
                                    <span className="resumen-label">Documentos calificados:</span>
                                    <span className="resumen-valor">
                                        {todosDocumentos.filter(d => d.nota_revision != null).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-documentos">
                            <p>No hay documentos registrados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiNotaFinal;