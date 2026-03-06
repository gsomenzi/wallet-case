# Uso de IA no desenvolvimento

Sou entusiasta do uso de IA como apoio ao desenvolvimento, mas prefiro utilizá-la em contextos nos quais já sei o que vou implementar e qual caminho técnico pretendo seguir. Nesses cenários, normalmente já tenho decisões arquiteturais definidas e uso a IA de forma guiada, orientando sugestões e implementações a partir dessas decisões.

Este documento descreve como IA foi utilizada como apoio durante o desenvolvimento, com foco em produtividade, organização técnica e documentação.

## GitHub Copilot Pro na IDE

O principal suporte de IA foi feito com **GitHub Copilot Pro**, com seleção automática de modelo, integrado ao fluxo diário dentro da IDE.

## Autocomplete e geração de trechos rotineiros

Os recursos de autocomplete foram utilizados para tarefas de baixa complexidade e alta repetição, como criação de listas, renderização com `map` e ajustes estruturais de componentes e funções.

Esse uso ficou concentrado em produtividade operacional, sem delegar decisões arquiteturais críticas.

## Apoio em integrações de observabilidade

A IA foi usada de forma iterativa para lembrar detalhes de integração de observabilidade que não estavam frescos na memória no momento da implementação, apesar de já existir conhecimento prévio sobre o assunto.

Esse apoio acelerou a configuração de pontos de instrumentação e validação de integração entre componentes da stack.

## Estruturação do ambiente local com Docker Compose

Durante a organização do ambiente de observabilidade, a IA foi utilizada como apoio para estruturar os serviços no `docker-compose`, revisar encaixe entre componentes e conferir consistência do setup local.

O objetivo foi reduzir fricção de configuração e garantir um ambiente reproduzível para execução do projeto.

## Construção da dashboard de observabilidade

A IA também foi usada para apoiar a construção da dashboard de ponta a ponta, com base nas métricas e sinais já disponíveis no projeto.

A condução foi feita por direcionamento explícito do que precisava ser visualizado, usando a IA para acelerar organização de painéis e consultas.

## Aceleração de releases com queue, WebSocket e orquestração de eventos

Nas últimas releases, a IA foi utilizada para acelerar implementações mais específicas relacionadas ao uso de queue e WebSocket, incluindo a simulação da orquestração de eventos no fluxo de pagamento.

As decisões de arquitetura e de implementação, no entanto, foram tomadas por mim. Em diversos momentos, usei a IA de forma guiada para apoiar a execução dessas decisões e reduzir o tempo de entrega.

## Atualização da documentação

Por fim, a IA foi utilizada para apoiar a evolução da documentação técnica, incluindo organização de seções, clareza textual e consolidação de informações relevantes para avaliação e execução do projeto.
