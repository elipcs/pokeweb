import type { Optional } from "sequelize";
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface PokemonAttributes {
  id: number;
  name: string;
  type: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  trainerId: number;
  boxId?: number | null;
  teamId?: number | null;
  teamPosition?: number | null;
  evolvesTo?: string | null;
  evolutionLevel?: number | null;
}

export interface PokemonCreationAttributes
  extends Optional<PokemonAttributes, "id" | "boxId" | "teamId"> { }

export class Pokemon
  extends Model<PokemonAttributes, PokemonCreationAttributes>
  implements PokemonAttributes {
  public id!: number;
  public name!: string;
  public type!: string;
  public level!: number;
  public hp!: number;
  public attack!: number;
  public defense!: number;
  public spAtk!: number;
  public spDef!: number;
  public speed!: number;
  public trainerId!: number;
  public boxId!: number | null;
  public teamId!: number | null;
  public teamPosition!: number | null;
  public evolvesTo!: string | null;
  public evolutionLevel!: number | null;
}

Pokemon.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    hp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    attack: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    defense: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spAtk: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spDef: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "treinador",
        key: "id"
      }
    },
    boxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "box",
        key: "id"
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "equipe",
        key: "id"
      }
    },
    teamPosition: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    evolvesTo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    evolutionLevel: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "pokemon",
    timestamps: true
  }
);

export default Pokemon;
