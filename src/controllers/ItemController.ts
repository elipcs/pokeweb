import { Router, Request, Response } from "express";
import { ItemService } from "../services/ItemService";

const router = Router();
const itemService = new ItemService();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Listar todos os itens
 *     description: |
 *       Retorna todos os itens cadastrados no sistema.
 *
 *       **Método HTTP:** GET  
 *       **Códigos:**  
 *       - 200: OK  
 *       - 500: Erro interno  
 *     tags:
 *       - Itens
 *     responses:
 *       200:
 *         description: Lista de itens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Erro interno ao obter itens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await itemService.getAll();
    return res.json(items);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os itens", error: error.message });
  }
});

/**
 * @swagger
 * /api/items/treinador/{treinadorId}:
 *   get:
 *     summary: Listar itens de um treinador
 *     description: |
 *       Retorna todos os itens pertencentes a um treinador específico.
 *
 *       **Método HTTP:** GET  
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: treinadorId
 *         required: true
 *         description: ID do treinador proprietário dos itens
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Itens retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       500:
 *         description: Erro interno ao obter itens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/treinador/:treinadorId", async (req: Request, res: Response) => {
  try {
    const treinadorId = Number(req.params.treinadorId);
    const items = await itemService.getByTreinador(treinadorId);
    return res.json(items);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os itens", error: error.message });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Obter item por ID
 *     description: |
 *       Retorna um item específico pelo seu ID.
 *
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Item não encontrado"
 *       500:
 *         description: Erro inesperado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.getById(id);
    return res.json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o item", error: error.message });
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Criar item
 *     description: |
 *       Cria um novo item pertencente a um treinador.
 *
 *       **Campos obrigatórios:**  
 *       - name  
 *       - treinadorId  
 *
 *     tags:
 *       - Itens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreate'
 *           example:
 *             name: "Potion"
 *             description: "Restaura 20 HP"
 *             treinadorId: 1
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Nome e treinadorId são obrigatórios"
 *       500:
 *         description: Erro interno ao criar item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const item = await itemService.create(req.body);
    return res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome e treinadorId são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o item", error: error.message });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Atualizar item
 *     description: |
 *       Atualiza os dados de um item existente.
 *
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item a ser atualizado
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemUpdate'
 *           example:
 *             name: "Super Potion"
 *             description: "Restaura 50 HP"
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno ao atualizar item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.update(id, req.body);
    return res.json(item);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o item", error: error.message });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Remover item
 *     description: |
 *       Remove um item permanentemente do sistema.
 *
 *       **Aviso:** Essa ação é irreversível!
 *
 *     tags:
 *       - Itens
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item a ser removido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Item não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno ao remover item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await itemService.delete(id);
    return res.json({ message: "Item removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Item não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o item", error: error.message });
  }
});

export default router;
