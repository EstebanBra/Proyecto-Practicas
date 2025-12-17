import OfertaCard from '@components/OfertaCard';
import useGetOfertas from '@hooks/ofertas/useGetOfertas';
import '../styles/offers.css';

export default function Ofertas() {
  const { ofertas, loading, error } = useGetOfertas();

  return (
    <main className="offers-page">
      <section className="offers-header">
        <h2>Ofertas de Práctica</h2>
        <p className="muted">Encuentra prácticas activas y aplica según los requisitos.</p>
      </section>

      <section className="offers-list">
        {loading && <p>Cargando ofertas...</p>}
        {error && <p className="error">Error: {JSON.stringify(error)}</p>}
        {!loading && ofertas.length === 0 && <p>No hay ofertas disponibles.</p>}

        <div className="offers-grid">
          {ofertas.map((o) => (
            <OfertaCard key={o.id || o.id_practica || Math.random()} oferta={o} />
          ))}
        </div>
      </section>
    </main>
  );
}
