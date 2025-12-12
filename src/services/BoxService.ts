import { BoxRepository } from "../repository/BoxRepository";

const boxRepository = new BoxRepository();

export class BoxService {
  async getAll() {
    return await boxRepository.getAllBoxes();
  }

  async getById(id: number) {
    const box = await boxRepository.getBoxById(id);
    if (!box) {
      throw new Error("Box não encontrada");
    }
    return box;
  }

  async getByTreinador(treinadorId: number) {
    return await boxRepository.getBoxesByTreinador(treinadorId);
  }

  async create(data: { name?: string; treinadorId?: number }) {
    const { name, treinadorId } = data;
    if (!name || treinadorId === undefined) {
      throw new Error("Nome e treinadorId são obrigatórios");
    }
    return await boxRepository.createBox(name, treinadorId);
  }

  async update(
    id: number,
    data: Partial<{ name: string; treinadorId: number }>
  ) {
    const box = await boxRepository.updateBox(id, data);
    if (!box) {
      throw new Error("Box não encontrada");
    }
    return box;
  }

  async delete(id: number) {
    const deleted = await boxRepository.deleteBox(id);
    if (!deleted) {
      throw new Error("Box não encontrada");
    }
    return true;
  }
}



