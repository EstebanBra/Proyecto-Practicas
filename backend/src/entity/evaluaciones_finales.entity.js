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
    tipo_documento: {
      type: "enum",
      enum: ["informe", "autoevaluacion"],
      nullable: false,
    },
    nota: {
      type: "float",
      nullable: false,
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
  indices: [
    {
      name: "IDX_EVALUACION_UNICA",
      columns: ["id_documento", "tipo_documento"],
      unique: true,
    },
  ],
});

export default EvaluacionSchema;
