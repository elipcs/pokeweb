import { expect } from "chai";
import sinon from "sinon";
import { EquipeService } from "../../services/EquipeService";
import { EquipeRepository } from "../../repository/EquipeRepository";
import { TreinadorService } from "../../services/TreinadorService";

describe("EquipeService", () => {
    let equipeService: EquipeService;
    let equipeRepoStub: sinon.SinonStubbedInstance<EquipeRepository>;
    let treinadorServiceStub: sinon.SinonStubbedInstance<TreinadorService>;

    beforeEach(() => {
        equipeRepoStub = sinon.createStubInstance(EquipeRepository);
        treinadorServiceStub = sinon.createStubInstance(TreinadorService);
        equipeService = new EquipeService(equipeRepoStub as any, treinadorServiceStub as any);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("create", () => {
        it("deve criar equipe e dar XP ao treinador", async () => {
            const mockEquipe = { id: 1, name: "Time A", treinadorId: 1 };
            equipeRepoStub.createEquipe.resolves(mockEquipe as any);

            const result = await equipeService.create({ name: "Time A", treinadorId: 1 });

            expect(result).to.deep.equal(mockEquipe);
            expect(treinadorServiceStub.addExperience.calledWith(1, 20)).to.be.true;
        });

        it("deve lançar erro se faltar dados", async () => {
            try {
                await equipeService.create({ name: "" });
                expect.fail("Erro");
            } catch (error: any) {
                expect(error.message).to.equal("Nome e treinadorId são obrigatórios");
            }
        });
    });

    describe("addPokemonToTeam", () => {
        it("deve lançar erro se equipe estiver cheia (>=6)", async () => {
            equipeRepoStub.countPokemonsInEquipe.resolves(6);
            try {
                await equipeService.addPokemonToTeam(1, 10);
                expect.fail("Erro");
            } catch (error: any) {
                expect(error.message).to.contain("Equipe cheia");
            }
        });
    });

    describe("getById", () => {
        it("deve retornar equipe se existir", async () => {
            equipeRepoStub.getEquipeById.resolves({ id: 1, name: "Time" } as any);
            const result = await equipeService.getById(1);
            expect(result.name).to.equal("Time");
        });

        it("deve lançar erro se equipe não existir", async () => {
            equipeRepoStub.getEquipeById.resolves(null);
            try {
                await equipeService.getById(99);
                expect.fail("Erro");
            } catch (error: any) {
                expect(error.message).to.equal("Equipe não encontrada");
            }
        });
    });
});
