import { expect } from "chai";
import sinon from "sinon";
import { TreinadorService } from "../../services/TreinadorService";
import { TreinadorRepository } from "../../repository/TreinadorRepository";

describe("TreinadorService", () => {
  let treinadorService: TreinadorService;
  let repositoryStub: sinon.SinonStubbedInstance<TreinadorRepository>;

  beforeEach(() => {
    // Cria um stub do repository
    repositoryStub = sinon.createStubInstance(TreinadorRepository);
    // Injeta o stub no service
    treinadorService = new TreinadorService(repositoryStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("create", () => {
    it("deve criar um treinador com dados válidos", async () => {
      const mockTreinador = {
        id: 1,
        name: "Ash Ketchum",
        email: "ash@pokemon.com",
        password: "pikachu123"
      };

      repositoryStub.createTreinador.resolves(mockTreinador as any);

      const result = await treinadorService.create(
        "Ash Ketchum",
        "ash@pokemon.com",
        "pikachu123"
      );

      expect(result).to.deep.equal(mockTreinador);
      expect(repositoryStub.createTreinador.calledOnce).to.be.true;
      expect(repositoryStub.createTreinador.calledWith(
        "Ash Ketchum",
        "ash@pokemon.com",
        "pikachu123"
      )).to.be.true;
    });

    it("deve lançar erro quando nome está vazio", async () => {
      try {
        await treinadorService.create("", "ash@pokemon.com", "pikachu123");
        expect.fail("Deveria ter lançado um erro de nome obrigatório");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, email e senha são obrigatórios");
      }
    });

    it("deve lançar erro quando email está vazio", async () => {
      try {
        await treinadorService.create("Ash Ketchum", "", "pikachu123");
        expect.fail("Deveria ter lançado um erro de email obrigatório");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, email e senha são obrigatórios");
      }
    });

    it("deve lançar erro quando senha está vazia", async () => {
      try {
        await treinadorService.create("Ash Ketchum", "ash@pokemon.com", "");
        expect.fail("Deveria ter lançado um erro de senha obrigatória");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, email e senha são obrigatórios");
      }
    });
  });

  describe("getById", () => {
    it("deve retornar um treinador quando existe", async () => {
      const mockTreinador = {
        id: 1,
        name: "Ash Ketchum",
        email: "ash@pokemon.com",
        password: "pikachu123"
      };

      repositoryStub.getTreinadorById.resolves(mockTreinador as any);

      const result = await treinadorService.getById(1);

      expect(result).to.deep.equal(mockTreinador);
      expect(repositoryStub.getTreinadorById.calledOnceWith(1)).to.be.true;
    });

    it("deve lançar erro quando treinador não existe", async () => {
      repositoryStub.getTreinadorById.resolves(null);

      try {
        await treinadorService.getById(999);
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Treinador não encontrado");
      }
    });
  });

  describe("getAll", () => {
    it("deve retornar lista de treinadores com paginação padrão", async () => {
      const mockResult = {
        rows: [
          { id: 1, name: "Ash", email: "ash@pokemon.com", password: "123" },
          { id: 2, name: "Misty", email: "misty@pokemon.com", password: "456" }
        ],
        count: 2
      };

      repositoryStub.getAllTreinadores.resolves(mockResult as any);

      const result = await treinadorService.getAll();

      expect(result).to.deep.equal(mockResult);
      expect(repositoryStub.getAllTreinadores.calledOnce).to.be.true;
    });

    it("deve passar parâmetros de paginação corretamente", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getAllTreinadores.resolves(mockResult as any);

      await treinadorService.getAll({ page: 2, limit: 5 });

      expect(repositoryStub.getAllTreinadores.calledOnceWith({
        limit: 5,
        offset: 5, // (page 2 - 1) * limit 5 = 5
        name: undefined
      })).to.be.true;
    });

    it("deve filtrar por nome quando fornecido", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getAllTreinadores.resolves(mockResult as any);

      await treinadorService.getAll({ name: "Ash" });

      expect(repositoryStub.getAllTreinadores.calledOnce).to.be.true;
      const callArgs = repositoryStub.getAllTreinadores.firstCall.args[0];
      expect(callArgs?.name).to.equal("Ash");
    });
  });

  describe("update", () => {
    it("deve atualizar um treinador existente", async () => {
      const mockTreinador = {
        id: 1,
        name: "Ash Ketchum Master",
        email: "ash@pokemon.com",
        password: "pikachu123"
      };

      repositoryStub.updateTreinador.resolves(mockTreinador as any);

      const result = await treinadorService.update(1, { name: "Ash Ketchum Master" });

      expect(result).to.deep.equal(mockTreinador);
      expect(repositoryStub.updateTreinador.calledOnceWith(1, { name: "Ash Ketchum Master" })).to.be.true;
    });

    it("deve lançar erro quando treinador não existe", async () => {
      repositoryStub.updateTreinador.resolves(null);

      try {
        await treinadorService.update(999, { name: "Novo Nome" });
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Treinador não encontrado");
      }
    });
  });

  describe("delete", () => {
    it("deve deletar um treinador existente", async () => {
      repositoryStub.deleteTreinador.resolves(true);

      const result = await treinadorService.delete(1);

      expect(result).to.be.true;
      expect(repositoryStub.deleteTreinador.calledOnceWith(1)).to.be.true;
    });

    it("deve lançar erro quando treinador não existe", async () => {
      repositoryStub.deleteTreinador.resolves(false);

      try {
        await treinadorService.delete(999);
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Treinador não encontrado");
      }
    });
  });
});
