import '../styles/offers.css';

function Fecha({ dateStr }) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return <span>{d.toLocaleDateString()}</span>;
}

// Agregamos canApply y onApply a las props
export default function OfertaCard({ oferta, canManage, canApply, onDelete, onEdit, onApply }) {
  if (!oferta) return null;
  const {
    titulo,
    descripcion_cargo,
    requisitos,
    duracion,
    modalidad,
    jornada,
    ubicacion,
    cupos,
    fecha_limite,
    fecha_publicacion,
    encargado,
  } = oferta;

  return (
    <article className="offer-card" style={{ position: 'relative' }}>
      <header className="offer-card__header">
        <h3 className="offer-card__title">{titulo}</h3>
        <div className="offer-card__meta">
          <small>Publicado: <Fecha dateStr={fecha_publicacion} /></small>
          {encargado?.nombreCompleto && (
            <small> • Encargado: {encargado.nombreCompleto}</small>
          )}
        </div>
      </header>

      <p className="offer-card__desc">{descripcion_cargo}</p>

      <ul className="offer-card__list">
        <li><strong>Requisitos:</strong> {requisitos}</li>
        <li><strong>Duración:</strong> {duracion} semanas</li>
        <li><strong>Modalidad:</strong> {modalidad}</li>
        <li><strong>Jornada:</strong> {jornada}</li>
        <li><strong>Ubicación:</strong> {ubicacion}</li>
        <li><strong>Cupos:</strong> {cupos}</li>
        <li><strong>Fecha límite:</strong> <Fecha dateStr={fecha_limite} /></li>
      </ul>

      {/* BOTONES DE ADMINISTRACIÓN (Editar/Eliminar) */}
      {canManage && (
        <div className="offer-card__actions" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
                onClick={onEdit}
                style={{ backgroundColor: '#ffc107', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Editar
            </button>
            <button 
                onClick={onDelete}
                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                Eliminar
            </button>
        </div>
      )}

      {/* BOTÓN DE POSTULACIÓN (Solo estudiantes) */}
      {canApply && (
        <div className="offer-card__actions" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <button 
                onClick={onApply}
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
                Postular a esta Oferta
            </button>
        </div>
      )}

    </article>
  );
}