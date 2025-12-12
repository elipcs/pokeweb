import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface ItemAttributes {
  id: number;
  name: string;
  description: string;
  quantity: number;
  treinadorId: number;
}

export interface ItemCreationAttributes
  extends Optional<ItemAttributes, "id"> {}

export class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public quantity!: number;
  public treinadorId!: number;
}

Item.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
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
    tableName: "item",
    timestamps: true
  }
);

export default Item;
