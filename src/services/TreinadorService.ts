import { TreinadorRepository } from "../repository/TreinadorRepository";

export class TreinadorService {
  private treinadorRepository: TreinadorRepository;

  constructor(treinadorRepository?: TreinadorRepository) {
    this.treinadorRepository = treinadorRepository || new TreinadorRepository();
  }

  async getAll(params?: { page?: number; limit?: number; name?: string }) {
    const limit = params?.limit || 10;
    const offset = ((params?.page || 1) - 1) * limit;

    return await this.treinadorRepository.getAllTreinadores({
      limit,
      offset,
      name: params?.name
    });
  }

  async getById(id: number) {
    const treinador = await this.treinadorRepository.getTreinadorById(id);
    if (!treinador) {
      throw new Error("Treinador não encontrado");
    }
    return treinador;
  }

  async create(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error("Nome, email e senha são obrigatórios");
    }
    return await this.treinadorRepository.createTreinador(name, email, password);
  }

  async update(id: number, data: { name?: string; email?: string; password?: string }) {
    const treinador = await this.treinadorRepository.updateTreinador(id, data);
    if (!treinador) {
      throw new Error("Treinador não encontrado");
    }
    return treinador;
  }

  async delete(id: number) {
    const deleted = await this.treinadorRepository.deleteTreinador(id);
    if (!deleted) {
      throw new Error("Treinador não encontrado");
    }
    return true;
  }
}

