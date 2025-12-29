"use strict";

import axios from './root.service.js';

export async function crearPractica(practicaData) {
    try {
        const { data } = await axios.post('/practicas/crear', practicaData);
        if (data.success === false) {
            return { error: data.message || "Error al crear la práctica" };
        }
        return data.data;
    } catch (error) {
        return {
            error: error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al crear la práctica"
        };
    }
}

export async function obtenerTodasPracticas() {
    try {
        const { data } = await axios.get('/practicas/todas');
        if (data.success === false) {
            return { error: data.message || "Error al obtener prácticas" };
        }
        return data.data || [];
    } catch (error) {
        return {
            error: error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al obtener prácticas"
        };
    }
}

export async function obtenerPracticasEstudiante() {
    try {
        const { data } = await axios.get('/practicas/mis-practicas');
        if (data.success === false) {
            return { error: data.message || "Error al obtener prácticas del estudiante" };
        }
        return data.data || [];
    } catch (error) {
        return {
            error: error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al obtener prácticas del estudiante"
        };
    }
}

export async function obtenerPracticaPorId(id) {
    try {
        const { data } = await axios.get(`/practicas/${id}`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al obtener la práctica" };
    }
}

export async function actualizarEstadoPractica(id, estado, observaciones) {
    try {
        const { data } = await axios.put(`/practicas/estado/${id}`, {
            estado,
            observaciones
        });
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar estado de la práctica" };
    }
}

export async function actualizarPractica(id, datosActualizacion) {
    try {
        const { data } = await axios.put(`/practicas/actualizar/${id}`, datosActualizacion);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: "Error al actualizar la práctica" };
    }
}
