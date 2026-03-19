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
        let fetchStub: sinon.SinonStub;

        beforeEach(() => {
            fetchStub = sinon.stub(globalThis, "fetch");
        });

        afterEach(() => {
            fetchStub.restore();
        });

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
            expect(fetchStub.called).to.be.false;
        });

        it("deve lançar erro se faltar nome ou treinador", async () => {
            try {
                await pokemonService.create({ name: "Pikachu" } as any);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.equal("Nome e treinador são obrigatórios");
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

        it("deve preservar evolução recebida do banco para espécies fora da lista padrão", async () => {
            const mockPokemon = {
                id: 99,
                name: "Gastly",
                evolvesTo: "Haunter",
                evolutionLevel: 30
            };
            pokemonRepoStub.createPokemon.resolves(mockPokemon as any);

            const result = await pokemonService.create({
                name: "Gastly",
                type: "Fantasma",
                level: 10,
                hp: 30,
                attack: 35,
                defense: 30,
                spAtk: 100,
                spDef: 35,
                speed: 80,
                trainerId: 1,
                evolvesTo: "Haunter",
                evolutionLevel: 30
            });

            expect(result).to.deep.equal(mockPokemon);
            expect(pokemonRepoStub.createPokemon.calledWith(
                "Gastly",
                "Fantasma",
                10,
                30,
                35,
                30,
                100,
                35,
                80,
                1,
                undefined,
                undefined,
                null,
                "Haunter",
                30
            )).to.be.true;
        });

        it("deve buscar dados na PokéAPI quando apenas nome for informado", async () => {
            const mockPokemon = { id: 10, name: "Charmander", type: "fire", level: 1, trainerId: 1 };
            pokemonRepoStub.createPokemon.resolves(mockPokemon as any);

            fetchStub.resolves({
                ok: true,
                json: async () => ({
                    types: [{ type: { name: "fire" } }],
                    stats: [
                        { stat: { name: "hp" }, base_stat: 39 },
                        { stat: { name: "attack" }, base_stat: 52 },
                        { stat: { name: "defense" }, base_stat: 43 },
                        { stat: { name: "special-attack" }, base_stat: 60 },
                        { stat: { name: "special-defense" }, base_stat: 50 },
                        { stat: { name: "speed" }, base_stat: 65 }
                    ]
                })
            } as any);

            const result = await pokemonService.create({
                name: "Charmander",
                trainerId: 1
            } as any);

            expect(result).to.deep.equal(mockPokemon);
            expect(fetchStub.calledOnce).to.be.true;
            expect(pokemonRepoStub.createPokemon.calledWith(
                "Charmander",
                "fire",
                1,
                39,
                52,
                43,
                60,
                50,
                65,
                1
            )).to.be.true;
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

        it("deve apenas liberar evolução ao atingir nível 30", async () => {
            const mockPokemon = {
                id: 1,
                name: "Vulpix",
                level: 29,
                trainerId: 1,
                hp: 30,
                attack: 30,
                defense: 30,
                spAtk: 30,
                spDef: 30,
                speed: 30
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, level: 30, evolvesTo: "Ninetales", evolutionLevel: 30 } as any);

            const result = await pokemonService.levelUp(1);

            expect(result.canEvolve).to.be.true;
            expect(result.pokemon!.name).to.equal("Vulpix");
            expect(pokemonRepoStub.updatePokemon.calledWith(1, sinon.match({
                level: 30,
                evolvesTo: "Ninetales",
                evolutionLevel: 30
            }))).to.be.true;
        });

        it("deve apenas liberar segunda evolução no nível 60", async () => {
            const mockPokemon = {
                id: 1,
                name: "Charmeleon",
                level: 59,
                trainerId: 1,
                hp: 39,
                attack: 52,
                defense: 43,
                spAtk: 60,
                spDef: 50,
                speed: 65
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({
                ...mockPokemon,
                level: 60,
                name: "Charmeleon",
                evolvesTo: "Charizard",
                evolutionLevel: 60
            } as any);

            const result = await pokemonService.levelUp(1);

            expect(result.canEvolve).to.be.true;
            expect(result.pokemon!.name).to.equal("Charmeleon");
            expect(pokemonRepoStub.updatePokemon.calledWith(1, sinon.match({
                level: 60,
                evolvesTo: "Charizard",
                evolutionLevel: 60
            }))).to.be.true;
        });
    });

    describe("evolve", () => {
        it("deve evoluir o pokemon se os requisitos forem atendidos", async () => {
            const mockPokemon = {
                id: 1, name: "Vulpix", level: 30, trainerId: 1,
                hp: 10, attack: 10, defense: 10, spAtk: 10, spDef: 10, speed: 10
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, name: "Ninetales" } as any);

            const result = await pokemonService.evolve(1);
            expect(result!.name).to.equal("Ninetales");
            expect(treinadorServiceStub.addExperience.calledWith(1, 50)).to.be.true;
        });

        it("deve evoluir para segunda forma no nível 60", async () => {
            const mockPokemon = {
                id: 1,
                name: "Charmeleon",
                level: 60,
                trainerId: 1,
                hp: 10,
                attack: 10,
                defense: 10,
                spAtk: 10,
                spDef: 10,
                speed: 10
            };
            pokemonRepoStub.getPokemonById.resolves(mockPokemon as any);
            pokemonRepoStub.updatePokemon.resolves({ ...mockPokemon, name: "Charizard", evolvesTo: null, evolutionLevel: null } as any);

            const result = await pokemonService.evolve(1);

            expect(result!.name).to.equal("Charizard");
            expect(pokemonRepoStub.updatePokemon.calledWith(1, sinon.match({
                name: "Charizard",
                evolvesTo: null,
                evolutionLevel: null
            }))).to.be.true;
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
            pokemonRepoStub.getPokemonById.resolves({ id: 1, name: "Vulpix", level: 5 } as any);
            try {
                await pokemonService.evolve(1);
                expect.fail("Deveria ter lançado erro");
            } catch (error: any) {
                expect(error.message).to.contain("Nível insuficiente para evoluir");
            }
        });
    });
});
