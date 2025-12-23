import Search from '../components/Search';
import ComentarioPopup from '../components/ComentarioPopup';
import { useState } from 'react';
import '../styles/Documentos.css';

const Comentarios = () => {
    const [comentarios, setComentarios] = useState([
        {
            _id: 1,
            usuario: 'María',
            mensaje: 'Estoy teniendo problemas para acceder a mi cuenta.',
            estado: 'Pendiente',
            nivelUrgencia: 'normal',
            tipoProblema: 'Personal',
            fechaCreacion: '2024-04-14',
            archivos: []
        },
        {
            _id: 2,
            usuario: 'Carlos',
            mensaje: 'El sistema se cae continuamente.',
            estado: 'Abierto',
            nivelUrgencia: 'alta',
            tipoProblema: 'General',
            fechaCreacion: '2024-04-12',
            archivos: []
        },
        {
            _id: 3,
            usuario: 'Lucía',
            mensaje: 'Necesito recuperar mi contraseña.',
            estado: 'Respondido',
            nivelUrgencia: 'normal',
            tipoProblema: 'Personal',
            fechaCreacion: '2024-04-10',
            archivos: []
        },
        {
            _id: 4,
            usuario: 'Juan',
            mensaje: 'El sistema muestra resultados incorrectos.',
            estado: 'Respondido',
            nivelUrgencia: 'alta',
            tipoProblema: 'De Empresa',
            fechaCreacion: '2024-04-08',
            archivos: []
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [selectedComentario, setSelectedComentario] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredComentarios = comentarios.filter((comentario) =>
        comentario.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenPopup = (mode, comentario = null) => {
        setPopupMode(mode);
        setSelectedComentario(comentario);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedComentario(null);
    };

    const handleSubmit = (formData) => {
        if (popupMode === 'create') {
            const nuevo = {
                _id: Date.now(),
                usuario: 'Tú',
                ...formData,
                fechaCreacion: new Date().toISOString().split('T')[0],
                archivos: selectedFiles.length > 0 ? selectedFiles.map(f => ({
                    nombre: f.name,
                    tamaño: f.size,
                    tipo: f.type
                })) : []
            };
            setComentarios([...comentarios, nuevo]);
        } else {
            setComentarios(
                comentarios.map((c) =>
                    c._id === selectedComentario._id ? { 
                        ...c, 
                        ...formData,
                        archivos: selectedFiles.length > 0 ? selectedFiles.map(f => ({
                            nombre: f.name,
                            tamaño: f.size,
                            tipo: f.type
                        })) : c.archivos
                    } : c
                )
            );
        }
        setSelectedFiles([]);
        handleClosePopup();
    };

    const handleDelete = (id) => {
        setComentarios(comentarios.filter((c) => c._id !== id));
    };

    const fields = [
        { name: 'mensaje', label: 'Mensaje', type: 'textarea', required: true },
        { name: 'estado', label: 'Estado', type: 'select', options: ['Pendiente', 'Abierto', 'Respondido'], required: true },
        { name: 'nivelUrgencia', label: 'Nivel de Urgencia', type: 'select', options: ['normal', 'alta'], required: true },
        { name: 'tipoProblema', label: 'Tipo de Problema', type: 'select', options: ['Personal', 'General', 'De Empresa'], required: true }
    ];

    return (
        <div className="documentos-container">
            <div className="documentos-content">
                <div className="top-section">
                    <h1 className="title">Comentarios</h1>
                    <div className="filter-actions">
                        <Search
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={'Buscar comentarios...'}
                        />
                        <button onClick={() => handleOpenPopup('create')}>
                            Crear Comentario
                        </button>
                    </div>
                </div>

                <div className="tabla-docs">
                    {filteredComentarios.length > 0 ? (
                        filteredComentarios.map((comentario) => (
                            <div key={comentario._id} className="doc-card">
                                <div className="doc-header">
                                    <strong>{comentario.usuario}</strong>
                                    <span className="doc-estado">{comentario.estado}</span>
                                </div>
                                <div className="doc-info">
                                    <p>{comentario.mensaje}</p>
                                    <p className="comentario">
                                        Tipo: {comentario.tipoProblema} — Urgencia: {comentario.nivelUrgencia}
                                    </p>
                                </div>
                                <div className="doc-acciones">
                                    <button onClick={() => handleDelete(comentario._id)}>Responder</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No hay comentarios disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comentarios;
