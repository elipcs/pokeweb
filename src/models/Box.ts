import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface BoxAttributes {
  id: number;
  name: string;
  treinadorId: number;
}

export interface BoxCreationAttributes
  extends Optional<BoxAttributes, "id"> {}

export class Box
  extends Model<BoxAttributes, BoxCreationAttributes>
  implements BoxAttributes
{
  public id!: number;
  public name!: string;
  public treinadorId!: number;
}

Box.init(
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
    treinadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "treinador",
        key: "id"
      }
    }
  },
  {
    sequelize,
    tableName: "box",
    timestamps: false
  }
);

export default Box;
