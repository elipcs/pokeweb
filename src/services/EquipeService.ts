import { EquipeRepository } from "../repository/EquipeRepository";

const equipeRepository = new EquipeRepository();

export class EquipeService {
  async getAll() {
    return await equipeRepository.getAllEquipes();
  }

  async getById(id: number) {
    const equipe = await equipeRepository.getEquipeById(id);
    if (!equipe) {
      throw new Error("Equipe não encontrada");
    }
    return equipe;
  }

  async getByTreinador(treinadorId: number) {
    return await equipeRepository.getEquipesByTreinador(treinadorId);
  }

  async create(data: { name?: string; treinadorId?: number }) {
    const { name, treinadorId } = data;
    if (!name || treinadorId === undefined) {
      throw new Error("Nome e treinadorId são obrigatórios");
    }
    return await equipeRepository.createEquipe(name, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; treinadorId: number }>
  ) {
    const equipe = await equipeRepository.updateEquipe(id, data);
    if (!equipe) {
      throw new Error("Equipe não encontrada");
    }
    return equipe;
  }

  async delete(id: number) {
    const deleted = await equipeRepository.deleteEquipe(id);
    if (!deleted) {
      throw new Error("Equipe não encontrada");
    }
    return true;
  }
}


