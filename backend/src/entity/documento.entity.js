"use strict";
import { EntitySchema } from "typeorm";

const DocumentoSchema = new EntitySchema({
  name: "Documento",
  tableName: "documentos",
  columns: {
    id_documento: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_practica: {
      type: "int",
      nullable: false,
    },
    id_usuario: {
      type: "int",
      nullable: false,
    },
    nombre_archivo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    ruta_archivo: {
      type: "varchar",
      length: 500,
      nullable: false,
    },
    formato: {
      type: "varchar",
      length: 10,
      nullable: false,
    },
    peso_mb: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: false,
    },
    fecha_subida: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    tipo: {
      type: "enum",
      enum: ["informe", "autoevaluacion"],
      nullable: false,
    },
    estado_revision: {
      type: "enum",
      enum: ["pendiente", "revisado"],
      default: "pendiente",
    },
    nota_revision: {
      type: "float",
      nullable: true,
      default: null,
    },
    comentario: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    practica: {
      target: "Practica",
      type: "many-to-one",
      joinColumn: { name: "id_practica" },
      onDelete: "CASCADE",
    },
    usuario: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_usuario" },
      onDelete: "CASCADE",
    },
  },
});

export default DocumentoSchema;
