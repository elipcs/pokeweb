import { Router, Request, Response } from "express";
import { BoxService } from "../services/BoxService";

const router = Router();
const boxService = new BoxService();

/**
 * @swagger
 * /api/boxes:
 *   get:
 *     summary: Listar todas as boxes
 *     description: |
 *       Retorna todas as boxes cadastradas no sistema.
 *
 *       **Método HTTP:** GET
 *
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *     responses:
 *       200:
 *         description: Lista de boxes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Box'
 *       500:
 *         description: Erro ao obter boxes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const name = req.query.name as string;

    const boxes = await boxService.getAll({ page, limit, name });
    return res.json(boxes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as boxes", error: error.message });
  }
});

/**
 * @swagger
 * /api/boxes/treinador/{treinadorId}:
 *   get:
 *     summary: Listar boxes de um treinador
 *     description: |
 *       Retorna todas as boxes pertencentes a um treinador específico.
 *
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: treinadorId
 *         required: true
 *         description: ID do treinador proprietário das boxes
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Boxes retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Box'
 *       500:
 *         description: Erro ao obter boxes do treinador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const name = req.query.name as string;

    const boxes = await boxService.getByTreinador(treinadorId, { page, limit, name });
    return res.json(boxes);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter as boxes", error: error.message });
  }
});

/**
 * @swagger
 * /api/boxes/{id}:
 *   get:
 *     summary: Obter box por ID
 *     description: |
 *       Retorna uma box específica pelo seu ID.
 *
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da box
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Box encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 *       404:
 *         description: Box não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Box não encontrada"
 *       500:
 *         description: Erro interno ao buscar box
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const box = await boxService.getById(id);
    return res.json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter a box", error: error.message });
  }
});

/**
 * @swagger
 * /api/boxes:
 *   post:
 *     summary: Criar nova box
 *     description: |
 *       Cria uma nova box associada a um treinador.
 *
 *       **Campos obrigatórios:**  
 *       - name  
 *       - treinadorId
 *
 *     tags:
 *       - Boxes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxCreate'
 *           example:
 *             name: "Box Principal"
 *             treinadorId: 1
 *     responses:
 *       201:
 *         description: Box criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Nome e treinadorId são obrigatórios"
 *       500:
 *         description: Erro ao criar box
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const box = await boxService.create(req.body);
    return res.status(201).json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar a box", error: error.message });
  }
});

/**
 * @swagger
 * /api/boxes/{id}:
 *   put:
 *     summary: Atualizar box
 *     description: |
 *       Atualiza os dados de uma box existente.
 *
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da box
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoxUpdate'
 *           example:
 *             name: "Box Secundária"
 *     responses:
 *       200:
 *         description: Box atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Box'
 *       404:
 *         description: Box não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao atualizar box
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const box = await boxService.update(id, req.body);
    return res.json(box);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar a box", error: error.message });
  }
});

/**
 * @swagger
 * /api/boxes/{id}:
 *   delete:
 *     summary: Remover box
 *     description: |
 *       Remove uma box permanentemente do sistema.
 *
 *     tags:
 *       - Boxes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da box a ser removida
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Box removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Box não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao remover box
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await boxService.delete(id);
    return res.json({ message: "Box removida com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Box não encontrada") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover a box", error: error.message });
  }
});

router.post("/transfer", async (req: Request, res: Response) => {
  try {
    const { pokemonId, targetType, targetId } = req.body;
    if (!pokemonId || !targetType || !targetId) {
      return res.status(400).json({ message: "pokemonId, targetType e targetId são obrigatórios" });
    }
    const result = await boxService.transferPokemon(pokemonId, targetType, targetId);
    return res.json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:boxId/search", async (req: Request, res: Response) => {
  try {
    const boxId = Number(req.params.boxId);
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Parâmetro de busca 'q' é obrigatório" });
    }
    const result = await boxService.searchPokemon(boxId, String(q));
    return res.json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
