import { TreinadorRepository } from "../repository/TreinadorRepository";

const treinadorRepository = new TreinadorRepository();

export class TreinadorService {
  async getAll() {
    return await treinadorRepository.getAllTreinadores();
  }

  async getById(id: number) {
    const treinador = await treinadorRepository.getTreinadorById(id);
    if (!treinador) {
      throw new Error("Treinador não encontrado");
    }
    return treinador;
  }

  async create(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error("Nome, email e senha são obrigatórios");
    }
    return await treinadorRepository.createTreinador(name, email, password);
  }

  async update(id: number, data: { name?: string; email?: string; password?: string }) {
    const treinador = await treinadorRepository.updateTreinador(id, data);
    if (!treinador) {
      throw new Error("Treinador não encontrado");
    }
    return treinador;
  }

  async delete(id: number) {
    const deleted = await treinadorRepository.deleteTreinador(id);
    if (!deleted) {
      throw new Error("Treinador não encontrado");
    }
    return true;
  }
}

