"use strict";
import { EntitySchema } from "typeorm";

const EvaluacionSchema = new EntitySchema({
  name: "Evaluacion",
  tableName: "evaluaciones",
  columns: {
    id_evaluacion: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_documento: {
      type: "int",
      nullable: false,
    },
    id_usuario: {
      type: "int",
      nullable: false,
    },
    rol_usuario: {
      type: "enum",
      enum: ["docente", "estudiante"],
      nullable: false,
    },
    nota: {
      type: "float",
      nullable: true,
    },
    comentario: {
      type: "text",
      nullable: true,
    },
    fecha_registro: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    documento: {
      target: "Documento",
      type: "many-to-one",
      joinColumn: { name: "id_documento" },
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

export default EvaluacionSchema;
