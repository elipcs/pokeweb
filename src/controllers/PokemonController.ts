import { Router, Request, Response } from "express";
import { PokemonService } from "../services/PokemonService";
import { verifyToken, isOwnerOrAdmin } from "../middleware/authMiddleware";

const router = Router();
const pokemonService = new PokemonService();

/**
 * @swagger
 * /api/pokemons:
 *   get:
 *     summary: Listar todos os pokémons
 *     description: |
 *       Retorna uma lista completa de todos os pokémons cadastrados no sistema.
 *       
 *       **Método HTTP:** GET
 *       
 *       **Código de Resposta:** 200 (OK) ou 500 (Erro)
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (e.g., Elétrico, Fogo)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *     responses:
 *       200:
 *         description: Pokémons retornados com sucesso
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
 *                     $ref: '#/components/schemas/Pokemon'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const type = req.query.type as string;
    const name = req.query.name as string;

    const pokemons = await pokemonService.getAll({ page, limit, type, name });
    return res.status(200).json(pokemons);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os Pokémons", error: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{id}:
 *   get:
 *     summary: Obter pokémon por ID
 *     description: |
 *       Retorna um pokémon específico baseado no seu ID.
 *       
 *       **Método HTTP:** GET
 *       
 *       **Códigos de Resposta:**
 *       - 200 (OK): Pokémon encontrado e retornado
 *       - 404 (Not Found): Pokémon não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Pokémons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do pokémon
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       404:
 *         description: Pokémon não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Pokémon não encontrado"
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
    const pokemon = await pokemonService.getById(id);
    return res.status(200).json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao obter o Pokémon", error: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons:
 *   post:
 *     summary: Criar novo pokémon
 *     description: |
 *       Cria um novo pokémon no sistema com validação de campos obrigatórios.
 *       
 *       **Método HTTP:** POST
 *       
 *       **Campos Obrigatórios:**
 *       - name: string
 *       - type: string
 *       - level: integer
 *       - hp, attack, defense, spAtk, spDef, speed: integer
 *       
 *       **Códigos de Resposta:**
 *       - 201 (Created): Pokémon criado com sucesso
 *       - 400 (Bad Request): Validação falhou
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Pokémons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pokemon'
 *           example:
 *             name: "Pikachu"
 *             type: "Elétrico"
 *             level: 25
 *             hp: 60
 *             attack: 55
 *             defense: 40
 *             spAtk: 50
 *             spDef: 50
 *             speed: 90
 *     responses:
 *       201:
 *         description: Pokémon criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       400:
 *         description: Dados inválidos ou incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Todos os campos do Pokémon são obrigatórios"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const pokemon = await pokemonService.create(req.body);
    return res.status(201).json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Todos os campos do Pokémon são obrigatórios") {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao criar o Pokémon", error: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{id}:
 *   put:
 *     summary: Atualizar pokémon
 *     description: |
 *       Atualiza um pokémon existente com os novos dados fornecidos.
 *       
 *       **Método HTTP:** PUT
 *       
 *       **Campos Atualizáveis:** Todos os campos do pokémon (opcionais)
 *       
 *       **Códigos de Resposta:**
 *       - 200 (OK): Pokémon atualizado com sucesso
 *       - 404 (Not Found): Pokémon não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Pokémons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do pokémon
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pokemon'
 *           example:
 *             level: 30
 *             hp: 70
 *     responses:
 *       200:
 *         description: Pokémon atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       404:
 *         description: Pokémon não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/:id", verifyToken, isOwnerOrAdmin(async (req) => {
  const pokemon = await pokemonService.getById(Number(req.params.id));
  return pokemon.trainerId;
}), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const pokemon = await pokemonService.update(id, req.body);
    return res.status(200).json(pokemon);
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao atualizar o Pokémon", error: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{id}:
 *   delete:
 *     summary: Remover pokémon
 *     description: |
 *       Remove um pokémon do sistema permanentemente.
 *       
 *       **Método HTTP:** DELETE
 *       
 *       **Aviso:** Esta operação é irreversível!
 *       
 *       **Códigos de Resposta:**
 *       - 200 (OK): Pokémon removido com sucesso
 *       - 404 (Not Found): Pokémon não encontrado
 *       - 500 (Internal Server Error): Erro do servidor
 *     tags:
 *       - Pokémons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do pokémon
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               message: "Pokémon removido com sucesso"
 *       404:
 *         description: Pokémon não encontrado
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
router.delete("/:id", verifyToken, isOwnerOrAdmin(async (req) => {
  const pokemon = await pokemonService.getById(Number(req.params.id));
  return pokemon.trainerId;
}), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await pokemonService.delete(id);
    return res.status(200).json({ message: "Pokémon removido com sucesso" });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Pokémon não encontrado") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Erro ao remover o Pokémon", error: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{id}/level-up:
 *   put:
 *     summary: Aumentar nível do pokémon
 *     description: |
 *       Aumenta o nível do pokémon em 1 e melhora seus atributos básicos.
 *       Verifica se o pokémon atingiu o nível necessário para evoluir.
 *
 *     tags:
 *       - Pokémons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pokémon
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nível aumentado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pokemon:
 *                   $ref: '#/components/schemas/Pokemon'
 *                 canEvolve:
 *                   type: boolean
 *       500:
 *         description: Erro ao aumentar nível
 */
router.put("/:id/level-up", verifyToken, isOwnerOrAdmin(async (req) => {
  const pokemon = await pokemonService.getById(Number(req.params.id));
  return pokemon.trainerId;
}), async (req: Request, res: Response) => {
  try {
    const result = await pokemonService.levelUp(Number(req.params.id));
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{id}/evolve:
 *   post:
 *     summary: Evoluir pokémon
 *     description: |
 *       Transforma o pokémon em sua forma evoluída se o nível for suficiente.
 *        redefine o nome e concede um bônus significativo nos atributos.
 *
 *     tags:
 *       - Pokémons
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pokémon
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon evoluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       400:
 *         description: Requisitos de evolução não atendidos
 *       500:
 *         description: Erro ao evoluir pokémon
 */
router.post("/:id/evolve", verifyToken, isOwnerOrAdmin(async (req) => {
  const pokemon = await pokemonService.getById(Number(req.params.id));
  return pokemon.trainerId;
}), async (req: Request, res: Response) => {
  try {
    const result = await pokemonService.evolve(Number(req.params.id));
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;



