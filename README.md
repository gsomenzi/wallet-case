# Wallet Case

Repositório monorepo do projeto **Wallet Case**, contendo os aplicativos de **backend (BFF)** e **mobile** no mesmo workspace.

## Releases e checkpoints

Durante a implementação, foram criadas releases como checkpoints (versões de entrega) para facilitar acompanhamento da evolução do projeto.

É possível navegar entre essas versões por tags Git (ex.: `v1.0.0`) para inspecionar exatamente o estado entregue em cada checkpoint.

Essas versões também podem ser consultadas diretamente na lista de Releases do repositório.

Exemplo de checkout de uma tag específica:

```bash
git fetch --tags
git checkout tags/v1.0.0
```

Para voltar para a branch principal:

```bash
git checkout main
git pull
```

## Execução rápida

Para validar rapidamente o projeto, siga esta ordem em terminais separados:

1. Subir ambiente de infraestrutura (observabilidade + Redis):

```bash
cd infra
docker compose up -d
```

2. Em outro terminal, na raiz do repositório, iniciar o BFF:

```bash
npm run dev:bff
```

3. Em outro terminal, na raiz do repositório, iniciar o mobile no iOS:

```bash
npm run dev:mobile:ios
```

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
- Docker
- Docker Compose

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

As decisões técnicas deste projeto foram especificadas em um documento dedicado:

- [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md)

## Arquitetura do BFF

Os detalhes de arquitetura e desenvolvimento do BFF estão em:

- [docs/arquitetura-bff.md](docs/arquitetura-bff.md)

## Arquitetura do Mobile

Os detalhes de arquitetura e desenvolvimento do mobile estão em:

- [docs/arquitetura-mobile.md](docs/arquitetura-mobile.md)

## Infraestrutura

Os detalhes de infraestrutura foram separados em um documento dedicado:

- [docs/infraestrutura.md](docs/infraestrutura.md)

## Observabilidade

Os detalhes de observabilidade (fluxo OTLP, implementação no BFF, variáveis, Grafana e dashboards) estão em:

- [docs/observabilidade.md](docs/observabilidade.md)

## Resiliência

Os detalhes dos mecanismos de resiliência do BFF (persistência, workflow assíncrono, retries e trade-offs) estão em:

- [docs/resiliencia.md](docs/resiliencia.md)

## Uso de IA no desenvolvimento

Os detalhes sobre uso de IA no desenvolvimento foram separados em um documento dedicado:

- [docs/uso-de-ia-no-desenvolvimento.md](docs/uso-de-ia-no-desenvolvimento.md)

## Considerações sobre a entrega

Esta entrega foi planejada para equilibrar **qualidade técnica**, **demonstração de conhecimento e habilidades**, **simplicidade de ambiente** e **velocidade de execução**.

Por esse motivo, algumas decisões priorizaram pragmatismo para viabilizar um fluxo completo e executável localmente no contexto de avaliação. Assim, existem pontos que não foram implementados nesta versão ou que podem evoluir em uma próxima etapa.

Exemplos de evolução:

- Refinamento da arquitetura de desenvolvimento e maior separação de responsabilidades em alguns módulos
- Expansão e padronização de design patterns aplicados em fluxos e integrações
- Adoção de broker externo dedicado para mensageria
- Revisão e evolução das métricas de observabilidade e dos painéis de acompanhamento
- Aumento da cobertura de testes (unitários, integração e E2E)
- Evolução de funcionalidades no mobile e melhorias de experiência de uso
