# Infraestrutura

Este documento descreve a infraestrutura local necessária para execução do projeto.

## Stack local

O ambiente local é provisionado com:

- **OpenTelemetry Collector** (ponto central de ingestão)
- **Tempo** (traces)
- **Prometheus** (métricas)
- **Loki** (logs)
- **Grafana** (visualização e correlação)
- **Redis** (fila persistente do workflow de pagamento)

## Ambiente e arquitetura

Todos os serviços sobem via `infra/docker-compose.yml` em uma rede bridge `observability`.

## Diagrama C4

```mermaid
C4Container
title Infraestrutura local

System_Ext(bff, "BFF", "Serviço de backend do sistema")

System_Boundary(obs, "Docker network: observability") {
   Container(redis, "Redis", "redis:7.4-alpine", "Persistência da fila do workflow")
   Container(grafana, "Grafana", "grafana/grafana", "Visualização de métricas, logs e traces")
   Container(prometheus, "Prometheus", "prom/prometheus", "Armazenamento e consulta de métricas")
   Container(loki, "Loki", "grafana/loki", "Armazenamento e consulta de logs")
   Container(tempo, "Tempo", "grafana/tempo", "Armazenamento e consulta de traces")
   Container(otel, "OTel Collector", "otel/opentelemetry-collector-contrib", "Ingestão e roteamento OTLP")
}

Rel(bff, redis, "Persiste e consome jobs", "Redis protocol :6379")
Rel(bff, otel, "Envia traces, métricas e logs", "OTLP gRPC/HTTP :4317/:4318")

Rel(otel, tempo, "Exporta traces", "OTLP gRPC :4317")
Rel(otel, loki, "Exporta logs", "HTTP /loki/api/v1/push")
Rel(otel, prometheus, "Exporta métricas", "Remote write /api/v1/write")

Rel(grafana, prometheus, "Lê métricas")
Rel(grafana, loki, "Lê logs")
Rel(grafana, tempo, "Lê traces")
```

Serviços e portas:

- Grafana: `localhost:3001`
- Prometheus: `localhost:9090`
- Loki: `localhost:3100`
- Tempo: `localhost:3200`
- Redis: `localhost:6379`
- OTel Collector:
   - OTLP gRPC: `localhost:4317`
   - OTLP HTTP: `localhost:4318`
   - Métricas internas: `localhost:8888`
   - Health check: `localhost:13133`

## Como subir e validar

```bash
cd infra/
docker compose up -d
docker compose ps
```

Para derrubar:

```bash
docker compose down
```

Para derrubar removendo volumes:

```bash
docker compose down -v
```

