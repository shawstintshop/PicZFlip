// Error Handler - Basic stub implementation for getting the app running
export class ErrorHandler {
  static handle(error: any): void {
    console.error('Error:', error);
  }
  
  static async handleAsync(error: any): Promise<void> {
    console.error('Async Error:', error);
  }
  
  static async handleStageError(stageName: string, error: any): Promise<void> {
    console.error(`Stage Error [${stageName}]:`, error);
  }
}