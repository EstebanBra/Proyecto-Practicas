"use strict";
import { EntitySchema } from "typeorm";

const EvaluacionPracticaSchema = new EntitySchema({
  name: "EvaluacionPractica",
  tableName: "evaluaciones_practica",
  columns: {
    id_evaluacion: {
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
    rol_usuario: {
      type: "enum",
      enum: ["estudiante", "docente"],
      nullable: false,
    },
    nota: {
      type: "decimal",
      precision: 4,
      scale: 2,
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

export default EvaluacionPracticaSchema;
