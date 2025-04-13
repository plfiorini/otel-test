import { AxiosError } from 'axios';
import HttpClient from './httpClient';

export async function runAllTests(server: string): Promise<void> {
    const apiClient = new HttpClient(server);

    // Constantly check the health of the server
    setInterval(() => {
        testHealthCheck(apiClient)
            .then(() => console.log('Health check passed'))
            .catch((error) => console.error('Health check failed:', error));
    }, 2000);

    // Sometimes call external resources: OK
    setInterval(() => {
        testExternalOk(apiClient)
            .then(() => console.log('External OK check passed'))
            .catch((error) => console.error('External OK check failed:', error));
    }, 2500);

    // Sometimes call external resources: 500
    setInterval(() => {
        testExternal500(apiClient)
            .catch((error: any) => {
                const axiosError = error as AxiosError;
                if (axiosError && axiosError.response?.status == 500) {
                    console.log('External 500 check passed');
                } else {
                    console.error('External 500 check failed:', error)
                }
            });
    }, 5000);

    // Sometimes call external resources: Slow
    setInterval(() => {
        testExternalSlow(apiClient)
            .catch((error: any) => {
                const axiosError = error as AxiosError;
                if (axiosError && axiosError.response?.status == 500) {
                    console.log('External slow check passed');
                } else {
                    console.error('External slow check failed:', error)
                }
            });
    }, 5000);
}

export async function runHealthTest(server: string): Promise<void> {
    const apiClient = new HttpClient(server);

    // Constantly check the health of the server
    setInterval(() => {
        testHealthCheck(apiClient)
            .then(() => console.log('Health check passed'))
            .catch((error) => console.error('Health check failed:', error));
    }, 2000);
}

async function testHealthCheck(apiClient: HttpClient): Promise<void> {
    await apiClient.get('/healthz');
}

async function testReadyCheck(apiClient: HttpClient): Promise<void> {
    await apiClient.get('/readyz');
}

async function testExternalOk(apiClient: HttpClient): Promise<void> {
    await apiClient.get('/external/ok');
}

async function testExternal500(apiClient: HttpClient): Promise<void> {
    await apiClient.get('/external/500');
}

async function testExternalSlow(apiClient: HttpClient): Promise<void> {
    await apiClient.get('/external/slow');
}
