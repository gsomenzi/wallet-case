import { Inject, Injectable } from "@nestjs/common";
import { ApplicationError } from "../../../application/application-error";
import { type StepResponse } from "../../../features/payment/payment.entity";
import { MetricRecorder } from "../../observability/metric-recorder/metric-recorder.interface";

export type RetryPolicy = {
    maxAttempts: number;
    initialDelayMs: number;
    backoffFactor: number;
    jitterMs: number;
    timeoutMs: number;
};

const DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxAttempts: 1,
    initialDelayMs: 0,
    backoffFactor: 2,
    jitterMs: 0,
    timeoutMs: 4000,
};

const RETRY_POLICY_BY_STEP: Record<string, Partial<RetryPolicy>> = {
    account_validation: { maxAttempts: 1 },
    card_validation: { maxAttempts: 1 },
    antifraud_validation: {
        maxAttempts: 3,
        initialDelayMs: 120,
        jitterMs: 80,
        timeoutMs: 3000,
    },
    acquirer_processing: {
        maxAttempts: 3,
        initialDelayMs: 180,
        jitterMs: 120,
        timeoutMs: 4000,
    },
    payment: {
        maxAttempts: 3,
        initialDelayMs: 200,
        jitterMs: 130,
        timeoutMs: 4000,
    },
    notification: {
        maxAttempts: 3,
        initialDelayMs: 100,
        jitterMs: 70,
        timeoutMs: 2500,
    },
};

type ExecuteStepWithResilienceInput = {
    step: string;
    action: () => Promise<unknown>;
    retryPolicy?: Partial<RetryPolicy>;
};

@Injectable()
export class PaymentStepExecutor {
    constructor(@Inject(MetricRecorder) private readonly metricRecorder: MetricRecorder) {}

    async executeWithResilience(input: ExecuteStepWithResilienceInput): Promise<StepResponse> {
        const { action, step } = input;
        const startedAt = Date.now();
        let outcome: "success" | "error" = "success";
        const resolvedRetryPolicy = resolveRetryPolicy(step, input.retryPolicy);

        try {
            await runActionWithRetry(step, action, resolvedRetryPolicy, this.metricRecorder);
            return { step, timeMs: Date.now() - startedAt };
        } catch (error) {
            outcome = "error";
            throw error;
        } finally {
            const durationMs = Date.now() - startedAt;
            this.metricRecorder.recordHistogram("payment_step_duration_ms", durationMs, {
                step,
                outcome,
            });
            this.metricRecorder.incrementCounter("payment_step_total", 1, {
                step,
                outcome,
            });
        }
    }
}

function resolveRetryPolicy(step: string, overrides?: Partial<RetryPolicy>): RetryPolicy {
    return {
        ...DEFAULT_RETRY_POLICY,
        ...(RETRY_POLICY_BY_STEP[step] ?? {}),
        ...(overrides ?? {}),
    };
}

async function runActionWithRetry(
    step: string,
    action: () => Promise<unknown>,
    retryPolicy: RetryPolicy,
    metricRecorder: MetricRecorder
): Promise<void> {
    let attempt = 0;
    let nextDelayMs = retryPolicy.initialDelayMs;

    while (attempt < retryPolicy.maxAttempts) {
        attempt += 1;

        try {
            await runActionWithTimeout(action, retryPolicy.timeoutMs);
            metricRecorder.incrementCounter("payment_step_attempt_total", 1, {
                step,
                attempt,
                outcome: "success",
            });
            return;
        } catch (error) {
            const retryable = isRetryableError(error);
            const canRetry = retryable && attempt < retryPolicy.maxAttempts;

            metricRecorder.incrementCounter("payment_step_attempt_total", 1, {
                step,
                attempt,
                outcome: "error",
                retryable,
            });

            if (!canRetry) {
                throw error;
            }

            metricRecorder.incrementCounter("payment_step_retry_total", 1, {
                step,
            });

            await sleep(getJitteredDelay(nextDelayMs, retryPolicy.jitterMs));
            nextDelayMs = Math.max(0, Math.round(nextDelayMs * retryPolicy.backoffFactor));
        }
    }
}

function isRetryableError(error: unknown): boolean {
    if (error instanceof ApplicationError) return error.retryable;
    return false;
}

async function runActionWithTimeout(action: () => Promise<unknown>, timeoutMs: number): Promise<void> {
    if (timeoutMs <= 0) {
        await action();
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const timeoutRef = setTimeout(() => {
            reject(new Error(`Step timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        action()
            .then(() => {
                clearTimeout(timeoutRef);
                resolve();
            })
            .catch((error: unknown) => {
                clearTimeout(timeoutRef);
                reject(error);
            });
    });
}

function getJitteredDelay(delayMs: number, jitterMs: number): number {
    if (jitterMs <= 0) return Math.max(0, delayMs);
    const randomOffset = Math.floor(Math.random() * (jitterMs * 2 + 1)) - jitterMs;
    return Math.max(0, delayMs + randomOffset);
}

async function sleep(ms: number): Promise<void> {
    if (ms <= 0) return;
    await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
