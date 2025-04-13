import logger from "@/logger.ts";
import { metrics, trace, type Attributes, type Counter, type Meter, type Span, type Tracer } from "@opentelemetry/api";

const tracer: Tracer = trace.getTracer("dice-service");
const meter: Meter = metrics.getMeter("dice-service");

const counter: Counter<Attributes> = meter.createCounter("dice-service.rolls.counter", {
    description: "Counts the number of dice rolls",
});
// const histogram: Histogram<Attributes> = meter.createHistogram("dice-service.rolls.histogram", {
//     description: "Records the results of dice rolls",
//     boundaries: [1, 2, 3, 4, 5, 6],
// });

export function rollOnce(min: number, max: number): number {
    return tracer.startActiveSpan("rollDice", (span: Span) => {
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        logger.info(`Rolling dice once: ${min} - ${max} = ${result}`);
        span.setAttributes({ "dice-service.result": result });
        counter.add(1);
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
            counter.add(1);
        }
        span.end();
        return results;
    });
}
