import { Router, Request, Response } from "express";
import { EquipeService } from "../services/EquipeService";

const router = Router();
const equipeService = new EquipeService();

/**
 * @swagger
 * /api/equipes:
 *   get:
 *     summary: Listar todas as equipes
 *     description: |
 *       Retorna todas as equipes cadastradas no sistema.
 *
 *       **Método HTTP:** GET  
 *
 *     tags:
 *       - Equipes
 *     responses:
 *       200:
 *         description: Lista de equipes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipe'
 *       500:
 *         description: Erro ao obter equipes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const equipes = await equipeService.getAll();
    return res.json(equipes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as equipes", error: error.message });
  }
});

/**
 * @swagger
 * /api/equipes/treinador/{treinadorId}:
 *   get:
 *     summary: Listar equipes de um treinador
 *     description: |
 *       Retorna todas as equipes pertencentes a um treinador específico.
 *
 *     tags:
 *       - Equipes
 *     parameters:
 *       - in: path
 *         name: treinadorId
 *         required: true
 *         description: ID do treinador dono das equipes
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipes retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipe'
 *       500:
 *         description: Erro ao obter equipes do treinador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const equipes = await equipeService.getByTreinador(treinadorId);
    return res.json(equipes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as equipes", error: error.message });
  }
});

/**
 * @swagger
 * /api/equipes/{id}:
 *   get:
 *     summary: Obter equipe por ID
 *     description: |
 *       Retorna uma equipe específica pelo seu ID.
 *
 *     tags:
 *       - Equipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *     responses:
 *       200:
 *         description: Equipe encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       404:
 *         description: Equipe não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Equipe não encontrada"
 *       500:
 *         description: Erro interno ao buscar equipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipe = await equipeService.getById(id);
    return res.json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter a equipe", error: error.message });
  }
});

/**
 * @swagger
 * /api/equipes:
 *   post:
 *     summary: Criar nova equipe
 *     description: |
 *       Cria uma nova equipe associada a um treinador.
 *
 *       **Campos obrigatórios:**  
 *       - name  
 *       - treinadorId  
 *
 *     tags:
 *       - Equipes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipeCreate'
 *           example:
 *             name: "Time Alpha"
 *             treinadorId: 1
 *     responses:
 *       201:
 *         description: Equipe criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Nome e treinadorId são obrigatórios"
 *       500:
 *         description: Erro ao criar equipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const equipe = await equipeService.create(req.body);
    return res.status(201).json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar a equipe", error: error.message });
  }
});

/**
 * @swagger
 * /api/equipes/{id}:
 *   put:
 *     summary: Atualizar equipe
 *     description: |
 *       Atualiza os dados de uma equipe existente.
 *
 *     tags:
 *       - Equipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipeUpdate'
 *           example:
 *             name: "Equipe Renovada"
 *     responses:
 *       200:
 *         description: Equipe atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipe'
 *       404:
 *         description: Equipe não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao atualizar equipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const equipe = await equipeService.update(id, req.body);
    return res.json(equipe);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar a equipe", error: error.message });
  }
});

/**
 * @swagger
 * /api/equipes/{id}:
 *   delete:
 *     summary: Remover equipe
 *     description: |
 *       Remove uma equipe permanentemente do sistema.
 *
 *     tags:
 *       - Equipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da equipe
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipe removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Equipe não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao remover equipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await equipeService.delete(id);
    return res.json({ message: "Equipe removida com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Equipe não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover a equipe", error: error.message });
  }
});

router.post("/:teamId/pokemon", async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const { pokemonId } = req.body;
    if (!pokemonId) {
      return res.status(400).json({ message: "pokemonId é obrigatório" });
    }
    const result = await equipeService.addPokemonToTeam(teamId, pokemonId);
    return res.json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:teamId/pokemon/:pokemonId", async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const pokemonId = Number(req.params.pokemonId);
    await equipeService.removePokemonFromTeam(teamId, pokemonId);
    return res.json({ message: "Pokémon removido da equipe" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:teamId/reorder", async (req: Request, res: Response) => {
  try {
    const teamId = Number(req.params.teamId);
    const { pokemonIds } = req.body;
    if (!pokemonIds || !Array.isArray(pokemonIds)) {
      return res.status(400).json({ message: "pokemonIds (array) é obrigatório" });
    }
    await equipeService.reorderPokemon(teamId, pokemonIds);
    return res.json({ message: "Ordem atualizada com sucesso" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
