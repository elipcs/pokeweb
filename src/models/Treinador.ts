import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

// 1. Atributos que existem na tabela
export interface TreinadorAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 2. Atributos necessários para criar (id é auto incremento)
export interface TreinadorCreationAttributes
  extends Optional<TreinadorAttributes, "id"> {}

// 3. Classe do modelo
export class Treinador
  extends Model<TreinadorAttributes, TreinadorCreationAttributes>
  implements TreinadorAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
}

// 4. Inicialização do modelo (mapeia pra tabela)
Treinador.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "treinador",
    timestamps: true
  }
);

export default Treinador;
