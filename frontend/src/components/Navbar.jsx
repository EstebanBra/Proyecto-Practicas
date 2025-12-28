import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    <li>
                        <NavLink
                            to="/home"
                            onClick={() => {
                                setMenuOpen(false);
                            }}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Inicio
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/bitacoras" 
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) => isActive ? 'active' : ''}
                        >
                            Bitácoras
                        </NavLink>
                    </li>

                    {/* Solo visible para ADMINISTRADORES */}
                    {userRole === 'administrador' && (
                    <li>
                        <NavLink
                            to="/users"
                            onClick={() => {
                                setMenuOpen(false);
                            }}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Usuarios
                        </NavLink>
                    </li>
                    )}

                    {/* Visible solo si NO es estudiante (Docentes y Admins) */}
                    {userRole !== 'estudiante' && (
                    <li>
                        <NavLink
                            to="/ofertas"
                            onClick={() => { setMenuOpen(false); }}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Ofertas
                        </NavLink>
                    </li>
                    )}
                    {/* Visible solo para ESTUDIANTES */}
                    {userRole === 'estudiante' && (
                    <li>
                        <NavLink to="/mis-postulaciones" onClick={() => setMenuOpen(false)}>
                            Mis Postulaciones
                        </NavLink>
                    </li>
                    )}

                    {/* Visible para TODOS */}
                    <li>
                        <NavLink
                            to="/ofertas-publicas"
                            onClick={() => { setMenuOpen(false); }}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Ofertas Publicadas
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/auth"
                            onClick={() => {
                                logoutSubmit();
                                setMenuOpen(false);
                            }}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            Cerrar sesión
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};

export default Navbar;