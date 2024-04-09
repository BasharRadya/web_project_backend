const enablePrints: boolean = true;

export const debugLog = (...messages: any[]) => {
    if (enablePrints) {
        console.log('[DEBUG]', ...messages)
    }
}