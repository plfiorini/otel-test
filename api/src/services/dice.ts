import logger from "../logger.ts";
import { trace, type Attributes, type Span, type Tracer } from "@opentelemetry/api";
import { Counter, Histogram, register } from "prom-client";

const tracer: Tracer = trace.getTracer("dice-service");

// Prometheus counter for dice rolls
const diceRollsCounter = new Counter({
    name: "dice_service_rolls_total",
    help: "Counts the number of dice rolls",
});

// Prometheus histogram for dice roll results
const diceRollsHistogram = new Histogram({
    name: "dice_service_rolls_histogram",
    help: "Records the results of dice rolls",
    buckets: Array.from({ length: 20 }, (_, i) => i + 1),
});

// Register Prometheus metrics
register.registerMetric(diceRollsCounter);
register.registerMetric(diceRollsHistogram);

// Export Prometheus metrics for external use
export const prometheusMetrics = register.metrics();

export function rollOnce(min: number, max: number): number {
    return tracer.startActiveSpan("rollDice", (span: Span) => {
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        logger.info(`Rolling dice once: ${min} - ${max} = ${result}`);
        span.setAttributes({ "dice-service.result": result });
        diceRollsCounter.inc();
        diceRollsHistogram.observe(result);
        span.end();
        return result;
    });
}

export function rollMultiple(times: number, min: number, max: number): number[] {
    return tracer.startActiveSpan(`rollDiceMultiple:${times}`, (span: Span) => {
        const results: number[] = [];
        for (let i = 0; i < times; i++) {
            const result = Math.floor(Math.random() * (max - min + 1)) + min;
            logger.info(`Rolling dice ${i}: ${min} - ${max} = ${result}`);
            results.push(result);
            span.setAttributes({ [`dice-service.result.${i}`]: result });
            diceRollsCounter.inc();
            diceRollsHistogram.observe(result);
        }
        span.end();
        return results;
    });
}
