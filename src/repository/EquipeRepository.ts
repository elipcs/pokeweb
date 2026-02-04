import { Equipe } from "../models/Equipe";
import { Pokemon } from "../models/Pokemon";
import { Op } from "sequelize";

export class EquipeRepository {
  async countPokemonsInEquipe(equipeId: number): Promise<number> {
    return await Pokemon.count({
      where: { teamId: equipeId }
    });
  }
  async createEquipe(name: string, treinadorId: number) {
    const equipe = await Equipe.create({
      name,
      treinadorId
    });

    return equipe;
  }

  async getAllEquipes(options?: { limit?: number; offset?: number; name?: string }) {
    const where: any = {};
    if (options?.name) {
      where.name = { [Op.iLike]: `%${options.name}%` };
    }

    return await Equipe.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async getEquipeById(id: number) {
    return await Equipe.findByPk(id);
  }

  async getEquipesByTreinador(treinadorId: number, options?: { limit?: number; offset?: number; name?: string }) {
    const where: any = { treinadorId };
    if (options?.name) {
      where.name = { [Op.iLike]: `%${options.name}%` };
    }

    return await Equipe.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async updateEquipe(
    id: number,
    data: Partial<{
      name: string;
      treinadorId: number;
    }>
  ) {
    const equipe = await Equipe.findByPk(id);
    if (!equipe) return null;

    return await equipe.update(data);
  }

  async deleteEquipe(id: number) {
    const equipe = await Equipe.findByPk(id);
    if (!equipe) return false;

    await equipe.destroy();
    return true;
  }
}
