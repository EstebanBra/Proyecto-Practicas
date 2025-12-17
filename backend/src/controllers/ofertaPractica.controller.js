"use strict";
import { ofertaPracticaValidation } from "../validations/ofertaPractica.validation.js";
import {
  createOfertaPracticaService,
  getOfertasPracticaService,
  getOfertaPracticaByIdService,
  updateOfertaPracticaService,
  deleteOfertaPracticaService,
} from "../services/ofertaPractica.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function createOfertaPractica(req, res) {
  try {
    const { body } = req;
    const idEncargado = req.user.id;

    const { error } = ofertaPracticaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [nuevaOferta, errorOferta] = await createOfertaPracticaService(body, idEncargado);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error creando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 201, "Oferta de práctica creada exitosamente", nuevaOferta);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getOfertasPractica(req, res) {
  try {
    const [ofertas, errorOfertas] = await getOfertasPracticaService();

    if (errorOfertas) {
      return handleErrorClient(res, 400, "Error obteniendo las ofertas de práctica", errorOfertas);
    }

    ofertas.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Ofertas de práctica encontradas", ofertas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getOfertaPracticaById(req, res) {
  try {
    const { id } = req.params;

    const [oferta, errorOferta] = await getOfertaPracticaByIdService(id);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error obteniendo la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica encontrada", oferta);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateOfertaPractica(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const { error } = ofertaPracticaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [ofertaActualizada, errorOferta] = await updateOfertaPracticaService(id, body);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error actualizando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica actualizada exitosamente", ofertaActualizada);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteOfertaPractica(req, res) {
  try {
    const { id } = req.params;

    const [resultado, errorOferta] = await deleteOfertaPracticaService(id);

    if (errorOferta) {
      return handleErrorClient(res, 400, "Error eliminando la oferta de práctica", errorOferta);
    }

    handleSuccess(res, 200, "Oferta de práctica eliminada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}