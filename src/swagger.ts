import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PokéWeb API",
      version: "1.0.0",
      description: "API RESTful para gerenciamento de pokémons, treinadores, equipes, boxes e itens",
      contact: {
        name: "Seu Nome",
        email: "seu.email@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      schemas: {
        Treinador: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            id: {
              type: "integer",
              description: "ID único do treinador",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome do treinador",
              example: "Ash Ketchum",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email único do treinador",
              example: "ash@pokemon.com",
            },
            password: {
              type: "string",
              description: "Senha (armazenar hash em produção)",
              example: "senha123",
            },
            level: {
              type: "integer",
              description: "Nível do treinador",
              example: 1,
            },
            experience: {
              type: "integer",
              description: "Experiência acumulada do treinador",
              example: 50,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-11T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-12-11T10:00:00Z",
            },
          },
        },
        Pokemon: {
          type: "object",
          required: ["name", "type", "level", "hp", "attack", "defense", "spAtk", "spDef", "speed"],
          properties: {
            id: {
              type: "integer",
              description: "ID único do pokémon",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome do pokémon",
              example: "Pikachu",
            },
            type: {
              type: "string",
              description: "Tipo do pokémon (Fogo, Água, Grama, etc.)",
              example: "Elétrico",
            },
            level: {
              type: "integer",
              description: "Nível do pokémon",
              example: 25,
            },
            hp: {
              type: "integer",
              description: "Pontos de vida",
              example: 60,
            },
            attack: {
              type: "integer",
              description: "Ataque",
              example: 55,
            },
            defense: {
              type: "integer",
              description: "Defesa",
              example: 40,
            },
            spAtk: {
              type: "integer",
              description: "Ataque Especial",
              example: 50,
            },
            spDef: {
              type: "integer",
              description: "Defesa Especial",
              example: 50,
            },
            speed: {
              type: "integer",
              description: "Velocidade",
              example: 90,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Box: {
          type: "object",
          required: ["name", "trainerId"],
          properties: {
            id: {
              type: "integer",
              description: "ID único da box",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome da box",
              example: "Box Inicial",
            },
            trainerId: {
              type: "integer",
              description: "ID do treinador proprietário",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Equipe: {
          type: "object",
          required: ["name", "trainerId"],
          properties: {
            id: {
              type: "integer",
              description: "ID único da equipe",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome da equipe (máximo 6 pokémons)",
              example: "Equipe de Fogo",
            },
            trainerId: {
              type: "integer",
              description: "ID do treinador proprietário",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Item: {
          type: "object",
          required: ["name", "quantity", "trainerId"],
          properties: {
            id: {
              type: "integer",
              description: "ID único do item",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nome do item",
              example: "Poção",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Descrição do item (opcional)",
              example: "Restaura 20 HP",
            },
            quantity: {
              type: "integer",
              description: "Quantidade do item no inventário",
              example: 5,
            },
            trainerId: {
              type: "integer",
              description: "ID do treinador proprietário",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensagem de erro",
              example: "Erro ao obter o pokémon",
            },
            error: {
              type: "string",
              description: "Detalhes do erro",
              example: "Pokemon not found",
            },
          },
        },
        SuccessMessage: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mensagem de sucesso",
              example: "Pokémon removido com sucesso",
            },
          },
        },
      },
    },
  },
  apis: ["./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/swagger.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
