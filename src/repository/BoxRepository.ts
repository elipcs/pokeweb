import { Box } from "../models/Box";
import { Op } from "sequelize";

export class BoxRepository {
  async createBox(name: string, treinadorId: number) {
    const box = await Box.create({
      name,
      treinadorId
    });

    return box;
  }

  async getAllBoxes(options?: { limit?: number; offset?: number; name?: string }) {
    const where: any = {};
    if (options?.name) {
      where.name = { [Op.iLike]: `%${options.name}%` };
    }

    return await Box.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async getBoxById(id: number) {
    return await Box.findByPk(id);
  }

  async getBoxesByTreinador(treinadorId: number, options?: { limit?: number; offset?: number; name?: string }) {
    const where: any = { treinadorId };
    if (options?.name) {
      where.name = { [Op.iLike]: `%${options.name}%` };
    }

    return await Box.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async updateBox(
    id: number,
    data: Partial<{
      name: string;
      treinadorId: number;
    }>
  ) {
    const box = await Box.findByPk(id);
    if (!box) return null;

    return await box.update(data);
  }

  async deleteBox(id: number) {
    const box = await Box.findByPk(id);
    if (!box) return false;

    await box.destroy();
    return true;
  }
}
