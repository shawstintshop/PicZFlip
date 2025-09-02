// Error Handler - Basic stub implementation for getting the app running
export class ErrorHandler {
    static handle(error) {
        console.error('Error:', error);
    }
    static async handleAsync(error) {
        console.error('Async Error:', error);
    }
    static async handleStageError(stageName, error) {
        console.error(`Stage Error [${stageName}]:`, error);
    }
}
//# sourceMappingURL=errorHandler.js.map