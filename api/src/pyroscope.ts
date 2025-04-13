import Pyroscope from "@pyroscope/nodejs";

export function initPyroscope() {
    Pyroscope.init({
        serverAddress: process.env.PYROSCOPE_SERVER || "http://localhost:4040",
        appName: "otel-api",
        wall: {
            collectCpuTime: true,
        }
    });

    Pyroscope.start();
}