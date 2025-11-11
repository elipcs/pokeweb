# PokéWeb

Sistema web para gerenciamento completo de Pokémons, desenvolvido para treinadores organizarem seus times, boxes e itens.

## Sobre o Projeto

O **PokéWeb** é uma aplicação web que permite aos treinadores:

- Gerenciar um time principal com até 6 Pokémons
- Organizar Pokémons em múltiplas boxes de armazenamento
- Gerenciar inventário de itens do treinador
- Transferir Pokémons entre time e boxes
- Visualizar informações detalhadas da coleção

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **HTML5** - Estrutura da aplicação web
- **CSS3** - Estilização da interface

## Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente vem com Node.js)

### Passos para instalação

1. Clone o repositório ou baixe os arquivos do projeto

2. No diretório do projeto, instale as dependências:
```bash
npm install
```

## Como Executar

Para iniciar o servidor, execute o comando:

```bash
npm run start
```

O servidor será iniciado na porta 3000. Acesse no navegador:

```
http://localhost:3000
```

ou

```
http://localhost:3000/index.html
```

## Estrutura do Projeto

```
pokeweb/
├── public/
│   └── index.html      # Página principal com informações do projeto
├── server.js           # Servidor Express
├── package.json        # Configurações e dependências do projeto
├── README.md           # Documentação do projeto
└── node_modules/       # Dependências instaladas (gerado automaticamente)
```

## Funcionalidades Principais

### Gerenciamento de Time
- Time principal com até 6 Pokémons
- Adicionar e remover Pokémons do time
- Reorganizar ordem dos Pokémons

### Sistema de Boxes
- Múltiplas boxes de armazenamento
- Transferir Pokémons entre boxes e time
- Buscar Pokémons nas boxes

### Gerenciamento de Itens
- Inventário completo de itens
- Organização por categorias
- Controle de quantidade



