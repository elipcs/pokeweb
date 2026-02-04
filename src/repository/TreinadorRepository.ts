import { Treinador } from "../models/Treinador";
import { Op } from "sequelize";

export class TreinadorRepository {
  async createTreinador(name: string, email: string, password: string) {
    const treinador = await Treinador.create({
      name,
      email,
      password
    });

    return treinador;
  }

  async getAllTreinadores(options?: { limit?: number; offset?: number; name?: string }) {
    const where: any = {};
    if (options?.name) {
      where.name = { [Op.iLike]: `%${options.name}%` };
    }

    return await Treinador.findAndCountAll({
      where,
      limit: options?.limit,
      offset: options?.offset
    });
  }

  async getTreinadorById(id: number) {
    return await Treinador.findByPk(id);
  }

  async getTreinadorByEmail(email: string) {
    return await Treinador.findOne({
      where: { email }
    });
  }

  // Atualizar Treinador
  async updateTreinador(id: number, data: Partial<{
    name: string;
    email: string;
    password: string;
  }>) {
    const treinador = await Treinador.findByPk(id);
    if (!treinador) return null;

    return await treinador.update(data);
  }

  async deleteTreinador(id: number) {
    const treinador = await Treinador.findByPk(id);
    if (!treinador) return false;

    await treinador.destroy();
    return true;
  }
}
