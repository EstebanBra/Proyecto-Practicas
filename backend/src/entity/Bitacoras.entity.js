"use strict";
import { EntitySchema } from "typeorm";

const BitacoraSchema = new EntitySchema({
  name: "Bitacora",
  tableName: "bitacoras",
  columns: {
    id_bitacora: {
      type: "int",
      primary: true,
      generated: true
    },

    id_practica: {
      type: "int",
      nullable: false
    },

    semana: {
      type: "int",
      nullable: false
    },

    horas_trabajadas: {
      type: "decimal",
      precision: 4,
      scale: 1,
      nullable: false
    },

    descripcion_actividades: {
      type: "text",
      nullable: false
    },

    resultados_aprendizajes: {
      type: "text",
      nullable: false
    },

    nombre_archivo: {
      type: "varchar",
      length: 255,
      nullable: true
    },

    ruta_archivo: {
      type: "varchar",
      length: 500,
      nullable: true
    },

    formato_archivo: {
      type: "varchar",
      length: 10,
      nullable: true
    },

    peso_archivo_mb: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: true
    },

    fecha_registro: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false
    },

    estado_revision: {
      type: "varchar",
      length: 20,
      default: "en_progreso",
      nullable: false
    },

    nota: {
      type: "decimal",
      precision: 2,
      scale: 1,
      nullable: true,
      check: {
        name: "check_nota_rango",
        expression: "nota >= 1.0 AND nota <= 7.0"
      }
    },
  },

  relations: {
    practica: {
      target: "Practica",
      type: "many-to-one",
      joinColumn: { name: "id_practica" },
      onDelete: "CASCADE",
    },
  },

  uniques: [
    {
      name: "UNQ_BITACORA_PRACTICA_SEMANA",
      columns: ["id_practica", "semana"],
    },
  ],
});

export default BitacoraSchema;
