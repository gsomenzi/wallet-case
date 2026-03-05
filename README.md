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

## Observabilidade (local)

Esta seção descreve como subir uma stack de observabilidade local composta por **Grafana**, **Prometheus**, **Loki**, **Tempo** e **OpenTelemetry Collector**, pronta para ser integrada ao BFF quando o desenvolvedor desejar adicionar instrumentação.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (versão 20.10+) com o plugin **Compose** (incluso no Docker Desktop).

> **Nota Linux:** O serviço Prometheus usa `host.docker.internal` para alcançar o BFF rodando fora do Docker. No Linux, adicione a seguinte entrada no serviço `prometheus` do `observability/docker-compose.yml`:
>
> ```yaml
> extra_hosts:
>   - "host.docker.internal:host-gateway"
> ```

### Subir a stack

```bash
cd observability/
docker compose up -d
```

Aguarde todos os containers ficarem saudáveis (verifique com `docker compose ps`).

### URLs úteis

| Serviço              | URL                          | Credenciais     |
| -------------------- | ---------------------------- | --------------- |
| Grafana              | <http://localhost:3001>      | admin / admin   |
| Prometheus           | <http://localhost:9090>      | —               |
| Loki                 | <http://localhost:3100>      | —               |
| Tempo (HTTP API)     | <http://localhost:3200>      | —               |
| OTel Collector OTLP  | grpc `localhost:4317` / http `localhost:4318` | — |

O Grafana já vem com os datasources **Prometheus**, **Loki** e **Tempo** pré-configurados via provisioning automático.

### Como instrumentar o BFF futuramente

As seções abaixo descrevem como o BFF poderá ser instrumentado. **Nenhuma modificação de código é necessária agora.**

#### Métricas (Prometheus)

1. Instale `@nestjs/terminus` ou uma biblioteca como `prom-client` no BFF.
2. Exponha um endpoint `GET /metrics` no formato Prometheus.
3. O Prometheus já está configurado para fazer scrape em `host.docker.internal:3000/metrics` (arquivo `observability/prometheus.yml`).

#### Traces (OpenTelemetry → Tempo)

1. Instale o SDK OTLP para Node.js no BFF:

   ```bash
   npm install @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http
   ```

2. Configure o exporter apontando para o OTel Collector:

   ```ts
   // Exemplo simplificado
   const exporter = new OTLPTraceExporter({ url: 'http://localhost:4318/v1/traces' });
   ```

3. O Collector está configurado para encaminhar os traces ao **Tempo** automaticamente.

#### Logs (Loki)

Enquanto o BFF rodar via `npm run dev:bff` fora do Docker, o **Promtail** não conseguirá coletar os logs automaticamente.

Opções futuras:

- **Containerizar o BFF** — quando o BFF rodar como container Docker, o Promtail (já configurado em `observability/promtail-config.yml`) coletará os logs automaticamente via Docker socket.
- **Push direto via OTLP** — configure o SDK do OpenTelemetry para enviar logs via OTLP HTTP (`http://localhost:4318/v1/logs`). O Collector encaminhará ao Loki.
- **Winston + transport HTTP** — use um transport HTTP do Winston para enviar logs em JSON diretamente à API do Loki em `http://localhost:3100/loki/api/v1/push`.

### Derrubar a stack

```bash
cd observability/
docker compose down
```

Para remover também os volumes persistentes (dados do Prometheus, Loki e Tempo):

```bash
docker compose down -v
```

---

## Uso de IA no desenvolvimento

Durante o desenvolvimento deste projeto, estou utilizando IA como apoio, com os seguintes usos:

- **GitHub Copilot Pro** com seleção automática de modelo
- **Autocomplete** durante a implementação de funcionalidades
- **Geração de trechos simples e rotineiros**, como criar listas e renderizar com `map`
- **Apoio na atualização da documentação** do projeto
