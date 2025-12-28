import { useState, useEffect } from 'react';
import { getMisPostulaciones } from '@services/ofertaPractica.service.js';
import '@styles/offers.css';

const MisPostulaciones = () => {
    const [misOfertas, setMisOfertas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMisPostulaciones = async () => {
            const response = await getMisPostulaciones();
            if (response.status === 'Success' || Array.isArray(response.data)) {
                setMisOfertas(response.data || []);
            }
            setLoading(false);
        };
        fetchMisPostulaciones();
    }, []);

    if (loading) return <p style={{textAlign:'center', marginTop: '50px'}}>Cargando historial...</p>;

    return (
        <div className="ofertas-container">
            <h1>Mis Postulaciones</h1>
            {misOfertas.length === 0 ? (
                <div style={{textAlign:'center', marginTop: '50px'}}>
                    <h3>No has postulado a ninguna práctica aún.</h3>
                    <p>Ve a la sección de Ofertas Publicadas para buscar una oportunidad.</p>
                </div>
            ) : (
                <div className="ofertas-list">
                    {misOfertas.map((oferta) => (
                        <article key={oferta.id} className="offer-card" style={{borderLeft: '5px solid #28a745'}}>
                            <header className="offer-card__header">
                                <h3 className="offer-card__title">{oferta.titulo}</h3>
                                <small>Estado: Postulado ✅</small>
                            </header>
                            <p className="offer-card__desc">{oferta.descripcion_cargo}</p>
                            <ul className="offer-card__list">
                                <li><strong>Ubicación:</strong> {oferta.ubicacion}</li>
                                <li><strong>Modalidad:</strong> {oferta.modalidad}</li>
                                <li><strong>Fecha Postulación:</strong> {new Date().toLocaleDateString()}</li>
                            </ul>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisPostulaciones;