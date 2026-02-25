import { expect } from "chai";
import sinon from "sinon";
import { PokemonService } from "../../services/PokemonService";
import { PokemonRepository } from "../../repository/PokemonRepository";
import { TreinadorService } from "../../services/TreinadorService";

describe("PokemonService", () => {
    let pokemonService: PokemonService;
    let pokemonRepoStub: sinon.SinonStubbedInstance<PokemonRepository>;
    let treinadorServiceStub: sinon.SinonStubbedInstance<TreinadorService>;

    beforeEach(() => {
        pokemonRepoStub = sinon.createStubInstance(PokemonRepository);
        treinadorServiceStub = sinon.createStubInstance(TreinadorService);
        pokemonService = new PokemonService(pokemonRepoStub as any, treinadorServiceStub as any);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("create", () => {
        it("deve criar um pokemon com dados válidos", async () => {
            const mockPokemon = { id: 1, name: "Pikachu", type: "Elétrico", level: 5, trainerId: 1 };
            pokemonRepoStub.createPokemon.resolves(mockPokemon as any);

            const result = await pokemonService.create({
                name: "Pikachu",
                type: "Elétrico",
                level: 5,
                hp: 35,
                attack: 55,
                defense: 40,
                spAtk: 50,
                spDef: 50,
                speed: 90,
                trainerId: 1
            });

            expect(result).to.deep.equal(mockPokemon);
            expect(pokemonRepoStub.createPokemon.calledOnce).to.be.true;
        });

        it("deve lançar erro se faltar campos obrigatórios", async () => {
            try {
                await pokemonService.create({ name: "Pikachu" } as any);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Todos os campos obrigatórios do Pokémon devem ser preenchidos");
            }
        });

        it("deve lançar erro se estiver em box e equipe simultaneamente", async () => {
            try {
                await pokemonService.create({
                    name: "Pikachu", type: "Elétrico", level: 5, hp: 35, attack: 55, defense: 40,
                    spAtk: 50, spDef: 50, speed: 90, trainerId: 1,
                    boxId: 1, teamId: 1
                });
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Um Pokémon não pode estar em uma box e em uma equipe simultaneamente");
            }
        });
    });

    describe("levelUp", () => {
        it("deve aumentar o nível e atributos, e dar XP ao treinador", async () => {
            const mockPokemon = {
                id: 1, level: 5, hp: 10, attack: 10, defense: 10, spAtk: 10, spDef: 10, speed: 10, trainerId: 1
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, level: 6 } as any);

            const result = await pokemonService.levelUp(1);

            expect(result.pokemon!.level).to.equal(6);
            expect(treinadorServiceStub.addExperience.calledWith(1, 10)).to.be.true;
            expect(pokemonRepoStub.updatePokemon.calledWith(1, sinon.match({ level: 6, hp: 12 }))).to.be.true;
        });

        it("deve sinalizar que pode evoluir se atingir o nível", async () => {
            const mockPokemon = {
                id: 1, level: 15, trainerId: 1, evolvesTo: "Raichu", evolutionLevel: 16
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, level: 16 } as any);

            const result = await pokemonService.levelUp(1);
            expect(result.canEvolve).to.be.true;
        });
    });

    describe("evolve", () => {
        it("deve evoluir o pokemon se os requisitos forem atendidos", async () => {
            const mockPokemon = {
                id: 1, name: "Pikachu", level: 16, trainerId: 1, evolvesTo: "Raichu", evolutionLevel: 16,
                hp: 10, attack: 10, defense: 10, spAtk: 10, spDef: 10, speed: 10
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, name: "Raichu" } as any);

            const result = await pokemonService.evolve(1);
            expect(result!.name).to.equal("Raichu");
            expect(treinadorServiceStub.addExperience.calledWith(1, 50)).to.be.true;
        });

        it("deve lançar erro se não tiver evolução cadastrada", async () => {
            pokemonRepoStub.getPokemonById.resolves({ id: 1, evolvesTo: null } as any);
            try {
                await pokemonService.evolve(1);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Este Pokémon não possui evolução cadastrada.");
            }
        });

        it("deve lançar erro se nível for insuficiente", async () => {
            pokemonRepoStub.getPokemonById.resolves({ id: 1, level: 5, evolvesTo: "Raichu", evolutionLevel: 16 } as any);
            try {
                await pokemonService.evolve(1);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.contain("Nível insuficiente para evoluir");
            }
        });
    });
});
