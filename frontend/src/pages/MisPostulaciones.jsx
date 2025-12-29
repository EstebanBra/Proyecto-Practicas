import { useState, useEffect } from 'react';
import { getMisPostulaciones } from '@services/ofertaPractica.service.js';
import '@styles/offers.css';

const MisPostulaciones = () => {
    const [misPostulaciones, setMisPostulaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMisPostulaciones = async () => {
            const response = await getMisPostulaciones();
            if (response.status === 'Success' || Array.isArray(response.data)) {
                setMisPostulaciones(response.data || []);
            }
            setLoading(false);
        };
        fetchMisPostulaciones();
    }, []);

    // Función para obtener el estilo y el texto del estado
    const getEstadoInfo = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { 
                    texto: '⏳ Pendiente', 
                    color: '#ffc107', 
                    bgColor: '#fff3cd',
                    borderColor: '#ffc107'
                };
            case 'aceptado':
                return { 
                    texto: '✅ Aceptado', 
                    color: '#28a745', 
                    bgColor: '#d4edda',
                    borderColor: '#28a745'
                };
            case 'rechazado':
                return { 
                    texto: '❌ Rechazado', 
                    color: '#dc3545', 
                    bgColor: '#f8d7da',
                    borderColor: '#dc3545'
                };
            default:
                return { 
                    texto: estado, 
                    color: '#6c757d', 
                    bgColor: '#e9ecef',
                    borderColor: '#6c757d'
                };
        }
    };

    if (loading) return <p style={{textAlign:'center', marginTop: '50px'}}>Cargando historial...</p>;

    return (
        <div className="ofertas-container">
            <h1>Mis Postulaciones</h1>
            {misPostulaciones.length === 0 ? (
                <div style={{textAlign:'center', marginTop: '50px'}}>
                    <h3>No has postulado a ninguna práctica aún.</h3>
                    <p>Ve a la sección de Ofertas Publicadas para buscar una oportunidad.</p>
                </div>
            ) : (
                <div className="ofertas-list">
                    {misPostulaciones.map((postulacion) => {
                        const estadoInfo = getEstadoInfo(postulacion.estado);
                        const oferta = postulacion.oferta;
                        
                        return (
                            <article 
                                key={postulacion.id} 
                                className="offer-card" 
                                style={{ borderLeft: `5px solid ${estadoInfo.borderColor}` }}
                            >
                                <header className="offer-card__header">
                                    <h3 className="offer-card__title">{oferta?.titulo || 'Sin título'}</h3>
                                    <span 
                                        style={{
                                            backgroundColor: estadoInfo.bgColor,
                                            color: estadoInfo.color,
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {estadoInfo.texto}
                                    </span>
                                </header>
                                <p className="offer-card__desc">{oferta?.descripcion_cargo || 'Sin descripción'}</p>
                                <ul className="offer-card__list">
                                    <li><strong>Ubicación:</strong> {oferta?.ubicacion || 'No especificada'}</li>
                                    <li><strong>Modalidad:</strong> {oferta?.modalidad || 'No especificada'}</li>
                                    <li>
                                        <strong>Fecha Postulación:</strong> {' '}
                                        {postulacion.fecha_postulacion 
                                            ? new Date(postulacion.fecha_postulacion).toLocaleDateString('es-CL')
                                            : 'No disponible'}
                                    </li>
                                    {postulacion.fecha_respuesta && (
                                        <li>
                                            <strong>Fecha Respuesta:</strong> {' '}
                                            {new Date(postulacion.fecha_respuesta).toLocaleDateString('es-CL')}
                                        </li>
                                    )}
                                </ul>
                                
                                {postulacion.estado === 'aceptado' && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '10px',
                                        backgroundColor: '#d4edda',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <strong>🎉 ¡Felicitaciones! Ya puedes comenzar tu práctica y subir bitácoras.</strong>
                                    </div>
                                )}
                                
                                {postulacion.estado === 'rechazado' && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '10px',
                                        backgroundColor: '#f8d7da',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <span>No te desanimes, sigue postulando a otras ofertas.</span>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MisPostulaciones;