import api from './root.service.js';

const BASE = '/ofertaPractica';

export async function getOfertas() {
  const res = await api.get(BASE);
  return res.data;
}

export async function getOfertaById(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function createOferta(oferta) {
  const res = await api.post(BASE, oferta);
  return res.data;
}

export async function updateOferta(id, oferta) {
  const res = await api.put(`${BASE}/${id}`, oferta);
  return res.data;
}

export async function deleteOferta(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

export async function postularOferta(id) {
  try {
    const res = await api.post(`${BASE}/${id}/postular`);
    return res.data;
  } catch (error) {
    return error.response.data;
  }
}

// Obtener historial de postulaciones (Estudiante)
export async function getMisPostulaciones() {
    try {
        const response = await api.get(`${BASE}/mis-postulaciones`);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error de conexión' };
    }
}

// Obtener lista de alumnos (Docente)
export async function getPostulantes(idOferta) {
    try {
        const response = await api.get(`${BASE}/${idOferta}/postulantes`);
        return response.data; 
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al obtener postulantes' };
    }
}

// Aceptar a un postulante (Convertirlo en practicante)
export async function aceptarPostulante(idOferta, idEstudiante, idPostulacion) {
    try {
        const response = await api.post(`${BASE}/aceptar-postulante`, { idOferta, idEstudiante, idPostulacion });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al aceptar estudiante' };
    }
}

// Rechazar a un postulante
export async function rechazarPostulante(idOferta, idEstudiante, idPostulacion) {
    try {
        const response = await api.post(`${BASE}/rechazar-postulante`, { idOferta, idEstudiante, idPostulacion });
        return response.data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error al rechazar estudiante' };
    }
}

export default {
  getOfertas,
  getOfertaById,
  createOferta,
  updateOferta,
  postularOferta,
  deleteOferta,
  getMisPostulaciones,
  getPostulantes,
  aceptarPostulante,
  rechazarPostulante,
};
