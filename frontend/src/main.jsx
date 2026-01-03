import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Ofertas from '@pages/Ofertas';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Bitacoras from '@pages/Bitacoras';
import ComentariosWrapper from '@pages/ComentariosWrapper';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import OfertasPublicas from '@pages/OfertasPublicas';
import MisPostulaciones from '@pages/MisPostulaciones';
import PracticaExterna from '@pages/PracticaExterna';
import DocumentosFinales from '@pages/DocumentosFinales';
import DocsEntregados from '@pages/DocsEntregados';
import MiNotaFinal from '@pages/MiNotaFinal.jsx';
import NotasEstudiantes from '@pages/NotasEstudiantes.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/ofertas',
        element: <Ofertas />
      },
      {
        path: '/ofertas-publicas',
        element: <OfertasPublicas />
      },
      {
        path: '/mis-postulaciones',
        element: (
            <ProtectedRoute allowedRoles={['estudiante']}>
              <MisPostulaciones />
            </ProtectedRoute>
        ),
      },
      {
        path: '/practica-externa',
        element: (
            <ProtectedRoute allowedRoles={['estudiante']}>
              <PracticaExterna />
            </ProtectedRoute>
        ),
      },
      {
        path: '/documentos-finales',
        element: (
            <ProtectedRoute allowedRoles={['estudiante']}>
              <DocumentosFinales />
            </ProtectedRoute>
        ),
      },
      {
        path: '/docs-entregados',
        element: (
            <ProtectedRoute allowedRoles={['docente', 'administrador']}>
              <DocsEntregados />
            </ProtectedRoute>
        ),
      },
      {
        path: '/mi-nota-final',
        element: (
            <ProtectedRoute allowedRoles={['estudiante']}>
              <MiNotaFinal />
            </ProtectedRoute>
        ),
      },
      {
        path: '/notas-estudiantes',
        element: (
            <ProtectedRoute allowedRoles={['docente', 'administrador']}>
              <NotasEstudiantes />
            </ProtectedRoute>
        ),
      },
      {
        path: '/users',
        element: (
            <ProtectedRoute allowedRoles={['administrador']}>
              <Users />
            </ProtectedRoute>
        ),
      },
      {
        path: '/bitacoras',
        element: (
            <ProtectedRoute allowedRoles={['estudiante', 'docente', 'administrador']}>
              <Bitacoras />
            </ProtectedRoute>
        ),
      },
      {
        path: '/comentarios',
        element: (
            <ProtectedRoute allowedRoles={['estudiante', 'docente', 'administrador']}>
              <ComentariosWrapper />
            </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)