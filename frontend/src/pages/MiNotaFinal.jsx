import { useMiNotaFinal } from '@hooks/notafinales/useMiNotaFinal.jsx';
import '@styles/notaFinal.css';

const MiNotaFinal = () => {
    const { nota, loading, error } = useMiNotaFinal();

    if (loading) {
        return (
            <div className="nota-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando información de nota...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="nota-container">
            <div className="nota-content">
                <div className="nota-header">
                    <h1 className="nota-title">Mi Nota Final</h1>
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
                                <div className="nota-valor">{parseFloat(nota.nota_final || 0).toFixed(1)}</div>
                                <div className="nota-label">NOTA FINAL</div>
                            </div>
                            <div className="nota-estado">
                                <span className={`estado-badge ${nota.estado === 'aprobado' ? 'aprobado' : 'reprobado'}`}>
                                    {nota.nota_final >= 4 ? 'Aprobado' : 'Reprobado'}
                                </span>
                                <p className="fecha-calculo">
                                    Calculada: {nota.fecha_calculo ?
                                    new Date(nota.fecha_calculo).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) :
                                    'Fecha no disponible'}
                                </p>
                            </div>
                        </div>

                        <div className="nota-detalles">
                            <h3>Detalles del Cálculo</h3>
                            <div className="detalles-grid">
                                <div className="detalle-item">
                                    <span className="detalle-label">Nota Informe:</span>
                                    <span className="detalle-valor">
                                        {nota.nota_informe != null ?
                                            parseFloat(nota.nota_informe).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="detalle-porcentaje">(70%)</span>
                                </div>
                                <div className="detalle-item">
                                    <span className="detalle-label">Nota Autoevaluación:</span>
                                    <span className="detalle-valor">
                                        {nota.nota_autoevaluacion != null ?
                                            parseFloat(nota.nota_autoevaluacion).toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="detalle-porcentaje">(30%)</span>
                                </div>
                            </div>

                            <div className="formula-info">
                                <h4>Fórmula de Cálculo</h4>
                                <p>
                                    Nota Final = (Informe × 70%) + (Autoevaluación × 30%)
                                </p>
                                {nota.nota_informe != null &&
                                    nota.nota_autoevaluacion != null && (
                                        <p className="formula-ejemplo">
                                            ({parseFloat(nota.nota_informe).toFixed(1)} × 0.7) +
                                            ({parseFloat(nota.nota_autoevaluacion).toFixed(1)} × 0.3) =
                                            <strong> {parseFloat(nota.nota_final).toFixed(1)}</strong>
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-nota">
                        <h3>No hay nota calculada aún</h3>
                        <p>Tu docente calculará tu nota final una vez que revise y califique tus documentos.</p>
                    </div>
                )}

                {nota && (
                    <div className="documentos-container">
                        <h2 className="documentos-title">📚 Detalles de la Nota</h2>
                        <div className="documentos-section">
                            <table className="documentos-table">
                                <thead>
                                <tr>
                                    <th>Componente</th>
                                    <th>Porcentaje</th>
                                    <th>Nota</th>

                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Informe Final</td>
                                    <td>70%</td>
                                    <td>{nota.nota_informe != null ? parseFloat(nota.nota_informe).toFixed(1) : 'N/A'}</td>
                                    <td>{nota.nota_informe != null ? (nota.nota_informe * 0.7).toFixed(1) : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Autoevaluación</td>
                                    <td>30%</td>
                                    <td>{nota.nota_autoevaluacion != null ? parseFloat(nota.nota_autoevaluacion).toFixed(1) : 'N/A'}</td>
                                    <td>{nota.nota_autoevaluacion != null ? (nota.nota_autoevaluacion * 0.3).toFixed(1) : 'N/A'}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiNotaFinal;
