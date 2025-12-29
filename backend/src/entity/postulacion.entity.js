"use strict";
import { EntitySchema } from "typeorm";

const PostulacionSchema = new EntitySchema({
  name: "Postulacion",
  tableName: "postulaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_estudiante: {
      type: "int",
      nullable: false,
    },
    id_oferta: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "enum",
      enum: ["pendiente", "aceptado", "rechazado"],
      default: "pendiente",
    },
    fecha_postulacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    fecha_respuesta: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante" },
      onDelete: "CASCADE",
    },
    oferta: {
      target: "OfertaPractica",
      type: "many-to-one",
      joinColumn: { name: "id_oferta" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "IDX_POSTULACION_UNIQUE",
      columns: ["id_estudiante", "id_oferta"],
      unique: true,
    },
  ],
});

export default PostulacionSchema;
