import { Router, Request, Response } from "express";
import { TreinadorService } from "../services/TreinadorService";

const router = Router();
const treinadorService = new TreinadorService();

/**
 * @swagger
 * /api/treinadores:
 *   get:
 *     summary: Listar todos os treinadores
 *     description: |
 *       Retorna a lista completa de treinadores cadastrados no sistema.
 *
 *       **Método HTTP:** GET
 *
 *       **Códigos de Resposta:** 200 (OK) ou 500 (Erro)
 *     tags:
 *       - Treinadores
 *     responses:
 *       200:
 *         description: Lista de treinadores retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Treinador'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const treinadores = await treinadorService.getAll();
    return res.status(200).json(treinadores);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os treinadores", error: error.message });
  }
});

/**
 * @swagger
 * /api/treinadores/{id}:
 *   get:
 *     summary: Obter treinador por ID
 *     description: |
 *       Retorna um treinador específico pelo seu ID.
 *
 *       **Método HTTP:** GET
 *
 *       **Códigos de Resposta:**
 *       - 200 (OK): Treinador encontrado
 *       - 404 (Not Found): Treinador não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Treinadores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do treinador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Treinador retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Treinador'
 *       404:
 *         description: Treinador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Treinador não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const treinador = await treinadorService.getById(id);
    return res.status(200).json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o treinador", error: error.message });
  }
});

/**
 * @swagger
 * /api/treinadores:
 *   post:
 *     summary: Criar novo treinador
 *     description: |
 *       Cria um novo treinador no sistema. Campos obrigatórios: name, email, password.
 *
 *       **Método HTTP:** POST
 *
 *       **Códigos de Resposta:**
 *       - 201 (Created): Treinador criado com sucesso
 *       - 400 (Bad Request): Dados inválidos ou incompletos
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Treinadores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TreinadorCreate'
 *           example:
 *             name: "Ash Ketchum"
 *             email: "ash@paldea.example"
 *             password: "senhaSegura123"
 *     responses:
 *       201:
 *         description: Treinador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Treinador'
 *       400:
 *         description: Dados inválidos ou incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Nome, email e senha são obrigatórios"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const treinador = await treinadorService.create(name, email, password);
    return res.status(201).json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Nome, email e senha são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o treinador", error: error.message });
  }
});

/**
 * @swagger
 * /api/treinadores/{id}:
 *   put:
 *     summary: Atualizar treinador
 *     description: |
 *       Atualiza os dados de um treinador existente. Todos os campos são opcionais na atualização.
 *
 *       **Método HTTP:** PUT
 *
 *       **Códigos de Resposta:**
 *       - 200 (OK): Treinador atualizado com sucesso
 *       - 404 (Not Found): Treinador não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Treinadores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do treinador
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TreinadorUpdate'
 *           example:
 *             name: "Ash M."
 *             email: "ash.updated@paldea.example"
 *     responses:
 *       200:
 *         description: Treinador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Treinador'
 *       404:
 *         description: Treinador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;
    const treinador = await treinadorService.update(id, { name, email, password });
    return res.status(200).json(treinador);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o treinador", error: error.message });
  }
});

/**
 * @swagger
 * /api/treinadores/{id}:
 *   delete:
 *     summary: Remover treinador
 *     description: |
 *       Remove um treinador do sistema permanentemente.
 *
 *       **Método HTTP:** DELETE
 *
 *       **Aviso:** Esta operação é irreversível!
 *
 *       **Códigos de Resposta:**
 *       - 200 (OK): Treinador removido com sucesso
 *       - 404 (Not Found): Treinador não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Treinadores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do treinador
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Treinador removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               message: "Treinador removido com sucesso"
 *       404:
 *         description: Treinador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await treinadorService.delete(id);
    return res.status(200).json({ message: "Treinador removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Treinador não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o treinador", error: error.message });
  }
});

export default router;
