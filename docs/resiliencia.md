# Resiliência

Este documento descreve os mecanismos de resiliência implementados no BFF para garantir continuidade do processamento de pagamentos, tolerância a falhas transitórias e redução de acoplamento entre etapas.

## Objetivos

- Preservar estado e progresso de pagamentos ao longo do workflow
- Tolerar falhas transitórias com retentativas controladas
- Evitar quebra do fluxo principal por falhas não críticas
- Permitir continuidade do processamento após restart do serviço

## Mecanismos implementados

### 1) Persistência do estado de pagamento (SQLite)

Cada pagamento é persistido com `transactionId`, `status`, `steps`, `totalTimeMs` e `failure`, permitindo leitura e continuidade do fluxo com base em estado armazenado.

Benefícios:

- Recuperação de contexto do pagamento sem depender de memória do processo
- Histórico de steps executados para evitar duplicação de trabalho

Exemplo:

```ts
await this.paymentRepository.save({
	transactionId: payment.transactionId,
	status: payment.status,
	totalTimeMs: payment.totalTimeMs,
	steps: payment.steps,
	failure: payment.failure,
});

const existing = await this.paymentRepository.findOneBy({ transactionId });
```

### 2) Workflow assíncrono com fila persistente (BullMQ + Redis)

O processamento é modelado como eventos em fila (`payment-workflow`), com execução assíncrona por processor dedicado.

No enfileiramento, existem políticas padrão de resiliência em job:

- `attempts: 5`
- backoff exponencial com delay inicial de `1000ms`

Com Redis persistente (AOF), o workflow não depende do ciclo de vida do processo do Nest para manter jobs pendentes.

Exemplo:

```ts
await this.queue.add(eventName, payload, {
	attempts: 5,
	backoff: { type: "exponential", delay: 1000 },
	removeOnComplete: 500,
	removeOnFail: 1000,
});
```

### 3) Encadeamento desacoplado por eventos

O fluxo é dividido em etapas independentes:

- `payment.started`
- `account-validation.requested`
- `card-validation.requested`
- `antifraud-validation.requested`
- `acquirer-processing.requested`
- `payment-processing.requested`
- `notification.requested`

Cada etapa agenda a próxima por evento, reduzindo acoplamento direto entre implementações e facilitando evolução do pipeline.

Exemplo:

```ts
await this.paymentWorkflowCoordinator.execute({
	event,
	step: "acquirer_processing",
	statusInProgress: PaymentStatus.ProcessingAcquirer,
	action: () => this.acquirerProcessor.process(),
	nextEvent: PaymentWorkflowEvent.PaymentProcessingRequested,
});
```

### 4) Retry de steps com política configurável

Além de retry de job na fila, cada step crítico possui política de retentativa com:

- número máximo de tentativas
- timeout por tentativa
- backoff exponencial
- jitter

Steps como antifraude, adquirente, pagamento e notificação possuem retry habilitado por padrão; validações de conta/cartão seguem política mais conservadora.

Exemplo:

```ts
const RETRY_POLICY_BY_STEP = {
	antifraud_validation: { maxAttempts: 3, initialDelayMs: 120, jitterMs: 80, timeoutMs: 3000 },
	acquirer_processing: { maxAttempts: 3, initialDelayMs: 180, jitterMs: 120, timeoutMs: 4000 },
	payment: { maxAttempts: 3, initialDelayMs: 200, jitterMs: 130, timeoutMs: 4000 },
	notification: { maxAttempts: 3, initialDelayMs: 100, jitterMs: 70, timeoutMs: 2500 },
};
```

### 5) Guards de idempotência e consistência

O coordenador do workflow aplica proteções antes de executar cada step:

- não processar pagamentos em estado terminal (`approved`, `declined`, `error`)
- não repetir step já executado (`hasStepAlreadyExecuted`)

Isso reduz reprocessamento indevido em cenários de reentrega/retry de eventos.

Exemplo:

```ts
if (isTerminalStatus(payment.status)) {
	return;
}

if (hasStepAlreadyExecuted(payment, step)) {
	if (input.nextEvent) {
		await this.paymentWorkflowQueueService.enqueue(input.nextEvent, { transactionId });
	}
	return;
}
```

### 6) Falha não bloqueante na etapa de notificação

A notificação final roda desacoplada da conclusão principal do pagamento. Quando há erro de notificação com `failureBehavior: continue`, o fluxo não reprova o pagamento por causa dessa etapa.

Benefício:

- Falha em canal de comunicação não compromete a decisão transacional do pagamento

Exemplo:

```ts
await this.paymentWorkflowCoordinator.execute({
	event,
	step: "notification",
	statusInProgress: PaymentStatus.SendingNotification,
	action: () => this.notificationSender.send(),
	failureBehavior: "continue",
});

await this.paymentWorkflowCoordinator.completeAsApproved(event);
```

### 7) Tratamento explícito de falhas de negócio

Falhas modeladas como `ApplicationError` são convertidas em resultado de negócio (declínio) ou erro controlado, com persistência do estado final no pagamento.

Benefícios:

- Comportamento previsível em falhas
- Estado final consistente para consulta e acompanhamento

Exemplo:

```ts
if (error instanceof ApplicationError) {
	payment.decline({
		code: error.code,
		message: error.message,
		details: error.details,
	});
} else {
	payment.error({
		code: "UNKNOWN_APPLICATION_ERROR",
		message: error instanceof Error ? error.message : "Erro inesperado ao processar pagamento",
	});
}
```

### 8) Continuidade para consulta e atualização em tempo real

As atualizações de pagamento são publicadas durante o workflow e os clientes podem se reinscrever por `transactionId`. Ao assinar, o gateway também consulta o estado persistido e envia o snapshot atual.

Isso melhora a recuperação de sessão no cliente em reconexões.

Exemplo:

```ts
const payment = await this.paymentStorage.findByTransactionId(payload.transactionId);
if (payment) {
	client.emit("payment.updated", payment);
}
```

## Trade-offs assumidos

- Arquitetura orientada a fluxo assíncrono no próprio BFF, com maior acoplamento interno em troca de menor complexidade operacional
- Sem broker externo dedicado (como Kafka/RabbitMQ/SQS), priorizando setup enxuto para contexto de avaliação
