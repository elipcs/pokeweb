/*
 * Repository Box - COMENTADO TEMPORARIAMENTE
 * Será ativado em entregas futuras
 */

/*
import { Box } from "../models/Box";

export class BoxRepository {
  async createBox(name: string, treinadorId: number) {
    const box = await Box.create({
      name,
      treinadorId
    });

    return box;
  }

  async getAllBoxes() {
    return await Box.findAll();
  }

  async getBoxById(id: number) {
    return await Box.findByPk(id);
  }

  async getBoxesByTreinador(treinadorId: number) {
    return await Box.findAll({
      where: { treinadorId }
    });
  }

  async updateBox(id: number, data: Partial<{
    name: string;
    treinadorId: number;
  }>) {
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
*/
