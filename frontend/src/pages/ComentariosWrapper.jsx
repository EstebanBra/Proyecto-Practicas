import { useEffect, useState } from 'react';
import Comentarios from './comentarios';
import ComentarioDocente from './comentarioDocente';

const ComentariosWrapper = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const usuarioStorage = sessionStorage.getItem('usuario');
        if (usuarioStorage) {
            setUser(JSON.parse(usuarioStorage));
        }
    }, []);

    if (!user) {
        return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Cargando...</div>;
    }

    // Si es docente o administrador, mostrar vista de docente
    if (user.rol === 'docente' || user.rol === 'administrador') {
        return <ComentarioDocente />;
    }

    // Si es estudiante, mostrar vista de estudiante
    return <Comentarios />;
};

export default ComentariosWrapper;
