export declare class MainOrchestrator {
    private errorHandler;
    constructor();
    processPhotoAnalysis(imageBuffer: Buffer, uid: string, analysisId: string): Promise<any>;
    private runStage;
}
export declare const mainOrchestrator: MainOrchestrator;
//# sourceMappingURL=orchestrator.d.ts.map