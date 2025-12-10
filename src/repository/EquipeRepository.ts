import { Equipe } from "../models/Equipe";

export class EquipeRepository {
  async createEquipe(name: string, treinadorId: number) {
    const equipe = await Equipe.create({
      name,
      treinadorId
    });

    return equipe;
  }

  async getAllEquipes() {
    return await Equipe.findAll();
  }

  async getEquipeById(id: number) {
    return await Equipe.findByPk(id);
  }

  async getEquipesByTreinador(treinadorId: number) {
    return await Equipe.findAll({
      where: { treinadorId }
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
