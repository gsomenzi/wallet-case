# Wallet Case

Repositório monorepo do projeto **Wallet Case**, contendo os aplicativos de **backend (BFF)** e **mobile** no mesmo workspace.

## Estrutura do monorepo

```text
wallet-case/
├── apps/
│   ├── bff/       # API/BFF com NestJS
│   └── mobile/    # App mobile com Expo + React Native
├── packages/      # Pacotes compartilhados (reservado para uso futuro)
├── biome.json
├── commitlint.config.cjs
└── package.json   # scripts e configuração dos workspaces
```

### Apps

- `apps/bff`: serviço backend em NestJS
- `apps/mobile`: aplicativo mobile em Expo/React Native

## Pré-requisitos

- Node.js (recomendado: versão LTS)
- npm

## Instalação

Na raiz do repositório:

```bash
npm install
```

## Execução do projeto

### Rodar BFF e Mobile juntos

```bash
npm run dev
```

Esse comando usa `concurrently` e executa em paralelo:

- `npm run dev:bff`
- `npm run dev:mobile`

### Rodar apenas o BFF

```bash
npm run dev:bff
```

### Rodar apenas o Mobile

```bash
npm run dev:mobile
```

### Rodar Mobile por plataforma

Android:

```bash
npm run dev:mobile:android
```

iOS:

```bash
npm run dev:mobile:ios
```

## Testes

Executar apenas os testes do BFF:

```bash
npm run test:bff
```

Executar apenas os testes do Mobile:

```bash
npm run test:mobile
```

## Qualidade de código

### BiomeJS

O projeto utiliza **BiomeJS** para lint e formatação centralizados via `biome.json`.

Principais pontos já configurados:

- Formatação padronizada (indentação, largura de linha, aspas, etc.)
- Regras de lint recomendadas e específicas do projeto
- `organizeImports` habilitado
- Exclusão de diretórios gerados (`node_modules`, `dist`, `build`, `coverage`, etc.)

Comandos:

```bash
npm run lint
npm run format
```

### Commitlint + Husky

O repositório usa **Commitlint** com `@commitlint/config-conventional` para validar mensagens de commit.

- Configuração: `commitlint.config.cjs`
- Hook: `.husky/commit-msg`

Exemplo de mensagem válida:

```text
feat(mobile): adiciona fluxo inicial de autenticação
```

## Decisões técnicas

### 1) Adoção de monorepo

Foi decidido usar **monorepo** para manter BFF e Mobile no mesmo repositório, facilitando:

- Visão unificada do projeto
- Desenvolvimento simultâneo do frontend mobile e backend
- Execução e avaliação técnica do projeto em um único setup

> Essa decisão também foi tomada para **facilitar a execução pelos avaliadores** em um único repositório.

### 2) Uso de npm

Foi decidido usar **npm** como gerenciador padrão de pacotes e workspaces.

Motivação:

- Maior compatibilidade com ambientes de desenvolvimento padrão
- Menor fricção para instalação e execução inicial

> Essa escolha foi feita para **maximizar a compatibilidade com o ambiente de desenvolvimento**.

## Uso de IA no desenvolvimento

Durante o desenvolvimento deste projeto, estou utilizando IA como apoio, com os seguintes usos:

- **GitHub Copilot Pro** com seleção automática de modelo
- **Autocomplete** durante a implementação de funcionalidades
- **Geração de trechos simples e rotineiros**, como criar listas e renderizar com `map`
- **Apoio na atualização da documentação** do projeto
