import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "NotaFinal",
  tableName: "notas_finales",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    id_practica: {
      type: "int",
      nullable: false,
    },
    id_estudiante: {
      type: "int",
      nullable: false,
    },
    id_docente: {
      type: "int",
      nullable: true,
    },
    nota_final: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    promedio_bitacoras: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: false,
    },
    nota_informe: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: false,
    },
    nota_autoevaluacion: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: false,
    },
    detalle_bitacoras: {
      type: "simple-array",
      nullable: true,
    },
    fecha_calculo: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    practica: {
      target: "Practica",
      type: "many-to-one",
      joinColumn: {
        name: "id_practica",
        referencedColumnName: "id_practica",
      },
      onDelete: "CASCADE",
    },
    estudiante: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "id_estudiante",
        referencedColumnName: "id",
      },
      onDelete: "CASCADE",
    },
    docente: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "id_docente",
        referencedColumnName: "id",
      },
      nullable: true,
      onDelete: "SET NULL",
    },
  },
  indices: [
    {
      name: "IDX_NOTAFINAL_ESTUDIANTE",
      columns: ["id_estudiante"],
    },
    {
      name: "IDX_NOTAFINAL_DOCENTE",
      columns: ["id_docente"],
    },
    {
      name: "IDX_NOTAFINAL_PRACTICA",
      columns: ["id_practica"],

    },
  ],
});