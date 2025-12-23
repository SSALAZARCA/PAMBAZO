export const metricsCollector = {
    recordSecurityEvent: (type: string) => {
        console.log(`Security event: ${type}`);
    }
};
