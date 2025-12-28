"use strict";
import { EntitySchema } from "typeorm";

const PracticaSchema = new EntitySchema({
  name: "Practica",
  tableName: "practicas",
  columns: {
    id_practica: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_estudiante: {
      type: "int",
      nullable: false,
    },
    id_docente: {
      type: "int",
      nullable: false,
    },
    fecha_inicio: {
      type: "date",
      nullable: true,
    },
    fecha_fin: {
      type: "date",
      nullable: true,
    },
    horas_practicas: {
      type: "int",
      nullable: true,
    },
    semanas: {
      type: "int",
      nullable: true,
    },
    tipo_presencia:{
      type: "enum",
      enum: ["presencial", "virtual"],
      default: "presencial",
    },
    nota_practica: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: ["activa", "en_progreso", "finalizada", "cancelada"],
      default: "activa",
    },
  },
  relations: {
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_estudiante" },
      onDelete: "CASCADE",
    },
    docente: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_docente" },
      onDelete: "CASCADE",
    },
  },
});

export default PracticaSchema;
