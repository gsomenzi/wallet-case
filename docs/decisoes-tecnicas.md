# Decisões técnicas

## 1) Adoção de monorepo

Foi decidido usar **monorepo** para manter BFF e Mobile no mesmo repositório, facilitando:

- Visão unificada do projeto
- Desenvolvimento simultâneo do frontend mobile e backend
- Execução e avaliação técnica do projeto em um único setup

> Essa decisão também foi tomada para **facilitar a execução pelos avaliadores** em um único repositório.

## 2) Uso de npm

Foi decidido usar **npm** como gerenciador padrão de pacotes e workspaces.

Motivação:

- Maior compatibilidade com ambientes de desenvolvimento padrão
- Menor fricção para instalação e execução inicial

> Essa escolha foi feita para **maximizar a compatibilidade com o ambiente de desenvolvimento**.

## 3) Acoplamento intencional ao NestJS (contexto de avaliação)

Por se tratar de um **sistema de teste para fins de avaliação técnica**, algumas implementações foram mantidas de forma mais direta e pragmática dentro do ecossistema NestJS.

Exemplo prático:

- Parte da infraestrutura foi registrada diretamente como módulos/providers do Nest, sem camadas extras de abstração que aumentariam complexidade para este contexto.

Motivação:

- Reduzir tempo de implementação
- Facilitar entendimento e execução do projeto pelo avaliador
- Evitar overengineering para um cenário controlado de avaliação

## 4) Separação de camadas no código do BFF com módulo backend

Foi decidido implementar a separação de camadas no BFF em nível de código, concentrando as ações de backend no módulo `backend`.

Com essa abordagem, foi possível centralizar a implementação do que seria o backend dentro do próprio BFF, sem demandar um novo serviço.

Trade-off assumido:

- Maior acoplamento da implementação ao BFF

Como este sistema foi construído para fins de teste e avaliação técnica, esse acoplamento foi considerado aceitável para reduzir complexidade operacional e de setup.

## 5) Simulação de fila de eventos dentro do próprio sistema

Foi decidido não implementar, neste contexto, um sistema de fila completo como **Kafka**, **RabbitMQ** ou **SQS**, para evitar mais um container em execução e complexidade adicional de integração.

Por isso, foi adotado o mecanismo de filas/eventos do próprio NestJS, simulando o fluxo de publicação e inscrição de eventos totalmente dentro do sistema.

Trade-off assumido:

- Menor aderência a uma topologia distribuída de mensageria externa

Essa decisão foi tomada para reduzir complexidade e diminuir o tempo de entrega do sistema para avaliação técnica.

## 6) Fluxo assíncrono com fila persistente em Redis

Para implementar o processamento assíncrono de pagamento com continuidade após restart do serviço, o workflow foi migrado para **BullMQ + Redis**.

Motivação:

- Persistir jobs do workflow fora da memória do processo
- Permitir reinício do BFF sem perder progresso dos eventos pendentes
- Manter encadeamento assíncrono dos steps com menor risco de perda em falhas locais

Com isso, o sistema processa o pagamento em etapas assíncronas com fila persistente, retomando o fluxo quando o serviço volta.

## 7) Atualização em tempo real via WebSocket no app mobile

Foi adotado **WebSocket (Gateway do Nest + Socket.IO no mobile)** para que o app receba atualizações de status do pagamento em tempo real na tela de feedback.

Benefícios da abordagem:

- Atualização contínua do status sem polling agressivo
- Integração simples com o fluxo assíncrono do backend
- Dispensa de sistema de push notifications para este caso de uso específico

Essa combinação permitiu uma experiência de acompanhamento em tempo real mantendo arquitetura e setup locais simples para avaliação.

## 8) Adoção da stack de observabilidade com Grafana + OpenTelemetry

Foi decidida a adoção da stack de observabilidade baseada no ecossistema do **Grafana** (Grafana, Loki, Tempo e Prometheus) integrada via **OpenTelemetry**.

Motivação:

- Simplicidade de integração do BFF por meio dos padrões e SDKs do OpenTelemetry
- Conhecimento prévio da stack adotada, reduzindo curva de aprendizado e risco de implementação

Essa escolha acelerou a instrumentação ponta a ponta e a visualização unificada de logs, métricas e traces no ambiente local.
