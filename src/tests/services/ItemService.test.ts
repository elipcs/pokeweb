import { expect } from "chai";
import sinon from "sinon";
import { ItemService } from "../../services/ItemService";
import { ItemRepository } from "../../repository/ItemRepository";

describe("ItemService", () => {
  let itemService: ItemService;
  let repositoryStub: sinon.SinonStubbedInstance<ItemRepository>;

  beforeEach(() => {
    repositoryStub = sinon.createStubInstance(ItemRepository);
    itemService = new ItemService(repositoryStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("create", () => {
    it("deve criar um item com dados válidos", async () => {
      const mockItem = {
        id: 1,
        name: "Potion",
        description: "Recupera 20 HP",
        category: "Cura",
        quantity: 5,
        treinadorId: 1
      };

      repositoryStub.createItem.resolves(mockItem as any);

      const result = await itemService.create({
        name: "Potion",
        description: "Recupera 20 HP",
        category: "Cura",
        quantity: 5,
        treinadorId: 1
      });

      expect(result).to.deep.equal(mockItem);
      expect(repositoryStub.createItem.calledOnce).to.be.true;
      expect(repositoryStub.createItem.calledWith(
        "Potion",
        "Recupera 20 HP",
        "Cura",
        5,
        1
      )).to.be.true;
    });

    it("deve criar item com valores padrão para description e quantity", async () => {
      const mockItem = {
        id: 1,
        name: "Pokeball",
        description: "",
        category: "Captura",
        quantity: 1,
        treinadorId: 1
      };

      repositoryStub.createItem.resolves(mockItem as any);

      const result = await itemService.create({
        name: "Pokeball",
        category: "Captura",
        treinadorId: 1
      });

      expect(result).to.deep.equal(mockItem);
      expect(repositoryStub.createItem.calledWith("Pokeball", "", "Captura", 1, 1)).to.be.true;
    });

    it("deve lançar erro quando nome está vazio", async () => {
      try {
        await itemService.create({ category: "Cura", treinadorId: 1 });
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, categoria e treinadorId são obrigatórios");
      }
    });

    it("deve lançar erro quando categoria está vazia", async () => {
      try {
        await itemService.create({ name: "Potion", treinadorId: 1 });
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, categoria e treinadorId são obrigatórios");
      }
    });

    it("deve lançar erro quando treinadorId não é fornecido", async () => {
      try {
        await itemService.create({ name: "Potion", category: "Cura" });
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Nome, categoria e treinadorId são obrigatórios");
      }
    });
  });

  describe("getById", () => {
    it("deve retornar um item quando existe", async () => {
      const mockItem = {
        id: 1,
        name: "Potion",
        description: "Recupera 20 HP",
        category: "Cura",
        quantity: 5,
        treinadorId: 1
      };

      repositoryStub.getItemById.resolves(mockItem as any);

      const result = await itemService.getById(1);

      expect(result).to.deep.equal(mockItem);
      expect(repositoryStub.getItemById.calledOnceWith(1)).to.be.true;
    });

    it("deve lançar erro quando item não existe", async () => {
      repositoryStub.getItemById.resolves(null);

      try {
        await itemService.getById(999);
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Item não encontrado");
      }
    });
  });

  describe("getAll", () => {
    it("deve retornar lista de itens com paginação padrão", async () => {
      const mockResult = {
        rows: [
          { id: 1, name: "Potion", category: "Cura", quantity: 5, treinadorId: 1 },
          { id: 2, name: "Pokeball", category: "Captura", quantity: 10, treinadorId: 1 }
        ],
        count: 2
      };

      repositoryStub.getAllItems.resolves(mockResult as any);

      const result = await itemService.getAll();

      expect(result).to.deep.equal(mockResult);
      expect(repositoryStub.getAllItems.calledOnce).to.be.true;
    });

    it("deve passar parâmetros de paginação corretamente", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getAllItems.resolves(mockResult as any);

      await itemService.getAll({ page: 2, limit: 5 });

      expect(repositoryStub.getAllItems.calledOnceWith({
        limit: 5,
        offset: 5,
        category: undefined,
        name: undefined
      })).to.be.true;
    });

    it("deve filtrar por categoria quando fornecido", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getAllItems.resolves(mockResult as any);

      await itemService.getAll({ category: "Cura" });

      const callArgs = repositoryStub.getAllItems.firstCall.args[0];
      expect(callArgs?.category).to.equal("Cura");
    });

    it("deve filtrar por nome quando fornecido", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getAllItems.resolves(mockResult as any);

      await itemService.getAll({ name: "Potion" });

      const callArgs = repositoryStub.getAllItems.firstCall.args[0];
      expect(callArgs?.name).to.equal("Potion");
    });
  });

  describe("getByTreinador", () => {
    it("deve retornar itens de um treinador específico", async () => {
      const mockResult = {
        rows: [
          { id: 1, name: "Potion", category: "Cura", quantity: 5, treinadorId: 1 }
        ],
        count: 1
      };

      repositoryStub.getItemsByTreinador.resolves(mockResult as any);

      const result = await itemService.getByTreinador(1);

      expect(result).to.deep.equal(mockResult);
      expect(repositoryStub.getItemsByTreinador.calledOnce).to.be.true;
    });

    it("deve passar parâmetros de filtro corretamente", async () => {
      const mockResult = { rows: [], count: 0 };
      repositoryStub.getItemsByTreinador.resolves(mockResult as any);

      await itemService.getByTreinador(1, { page: 2, limit: 5, category: "Cura" });

      expect(repositoryStub.getItemsByTreinador.calledOnceWith(1, {
        limit: 5,
        offset: 5,
        category: "Cura",
        name: undefined
      })).to.be.true;
    });
  });

  describe("update", () => {
    it("deve atualizar um item existente", async () => {
      const mockItem = {
        id: 1,
        name: "Super Potion",
        description: "Recupera 50 HP",
        category: "Cura",
        quantity: 3,
        treinadorId: 1
      };

      repositoryStub.updateItem.resolves(mockItem as any);

      const result = await itemService.update(1, { name: "Super Potion", description: "Recupera 50 HP" });

      expect(result).to.deep.equal(mockItem);
      expect(repositoryStub.updateItem.calledOnceWith(1, { name: "Super Potion", description: "Recupera 50 HP" })).to.be.true;
    });

    it("deve lançar erro quando item não existe", async () => {
      repositoryStub.updateItem.resolves(null);

      try {
        await itemService.update(999, { name: "Novo Nome" });
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Item não encontrado");
      }
    });
  });

  describe("delete", () => {
    it("deve deletar um item existente", async () => {
      repositoryStub.deleteItem.resolves(true);

      const result = await itemService.delete(1);

      expect(result).to.be.true;
      expect(repositoryStub.deleteItem.calledOnceWith(1)).to.be.true;
    });

    it("deve lançar erro quando item não existe", async () => {
      repositoryStub.deleteItem.resolves(false);

      try {
        await itemService.delete(999);
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Item não encontrado");
      }
    });
  });

  describe("useItem", () => {
    it("deve lançar erro quando item não existe", async () => {
      repositoryStub.getItemById.resolves(null);

      try {
        await itemService.useItem(999, 1, 1);
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Item não encontrado");
      }
    });

    it("deve lançar erro quando item não pertence ao treinador", async () => {
      const mockItem = {
        id: 1,
        name: "Potion",
        category: "Cura",
        quantity: 5,
        treinadorId: 2 // Pertence ao treinador 2
      };

      repositoryStub.getItemById.resolves(mockItem as any);

      try {
        await itemService.useItem(1, 1, 1); // Treinador 1 tentando usar
        expect.fail("Deveria ter lançado um erro");
      } catch (error: any) {
        expect(error.message).to.equal("Você não possui este item.");
      }
    });
  });
});
