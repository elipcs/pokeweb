/*
 * Repository Equipe - COMENTADO TEMPORARIAMENTE
 * Será ativado em entregas futuras
 */

/*
import { Equipe } from "../models/Equipe";

export class EquipeRepository {
  // Criar uma nova Equipe
  async createEquipe(name: string, treinadorId: number) {
    const equipe = await Equipe.create({
      name,
      treinadorId
    });

    return equipe;
  }

  // Listar todas as Equipes
  async getAllEquipes() {
    return await Equipe.findAll();
  }

  // Buscar Equipe por ID
  async getEquipeById(id: number) {
    return await Equipe.findByPk(id);
  }

  // Buscar Equipes por Treinador
  async getEquipesByTreinador(treinadorId: number) {
    return await Equipe.findAll({
      where: { treinadorId }
    });
  }

  // Atualizar Equipe
  async updateEquipe(id: number, data: Partial<{
    name: string;
    treinadorId: number;
  }>) {
    const equipe = await Equipe.findByPk(id);
    if (!equipe) return null;
    
    return await equipe.update(data);
  }

  // Deletar Equipe
  async deleteEquipe(id: number) {
    const equipe = await Equipe.findByPk(id);
    if (!equipe) return false;
    
    await equipe.destroy();
    return true;
  }
}
*/
