import { expect } from "chai";
import sinon from "sinon";
import { BoxService } from "../../services/BoxService";
import { BoxRepository } from "../../repository/BoxRepository";

// Mocking models that are required inside methods
const PokemonMock = {
    findByPk: sinon.stub(),
    update: sinon.stub()
};

describe("BoxService", () => {
    let boxService: BoxService;
    let boxRepoStub: sinon.SinonStubbedInstance<BoxRepository>;

    beforeEach(() => {
        boxRepoStub = sinon.createStubInstance(BoxRepository);
        boxService = new BoxService(boxRepoStub as any);

        // Reset requirements/mocks if needed
        // Note: BoxService uses require() inside transferPokemon, which is tricky to mock globally
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("create", () => {
        it("deve criar uma box com dados válidos", async () => {
            const mockBox = { id: 1, name: "Box 1", treinadorId: 1 };
            boxRepoStub.createBox.resolves(mockBox as any);

            const result = await boxService.create({ name: "Box 1", treinadorId: 1 });
            expect(result).to.deep.equal(mockBox);
        });

        it("deve lançar erro se faltar nome ou treinadorId", async () => {
            try {
                await boxService.create({ name: "" });
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Nome e treinadorId são obrigatórios");
            }
        });
    });

    describe("getById", () => {
        it("deve retornar box por ID", async () => {
            boxRepoStub.getBoxById.resolves({ id: 1, name: "Box 1" } as any);
            const result = await boxService.getById(1);
            expect(result.name).to.equal("Box 1");
        });

        it("deve lançar erro se box não existir", async () => {
            boxRepoStub.getBoxById.resolves(null);
            try {
                await boxService.getById(99);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Box não encontrada");
            }
        });
    });

    // Note: transferPokemon and searchPokemon would ideally need more complex mocking 
    // because of the internal require() calls. For unit test scope, we focus on the Service logic.
});
