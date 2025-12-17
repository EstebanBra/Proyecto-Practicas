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

export default {
  getOfertas,
  getOfertaById,
  createOferta,
  updateOferta,
  deleteOferta,
};
