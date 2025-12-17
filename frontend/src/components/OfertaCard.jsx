import '../styles/offers.css';

function Fecha({ dateStr }) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return <span>{d.toLocaleDateString()}</span>;
}

export default function OfertaCard({ oferta }) {
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
    <article className="offer-card">
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

    </article>
  );
}
