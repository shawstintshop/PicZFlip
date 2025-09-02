export declare const identifierAgent: {
    identifyItem(_imageBuffer: Buffer): Promise<{
        category: string;
        confidence: number;
        details: any;
    }>;
    identifyFromPhoto(imageBuffer: Buffer): Promise<any>;
};
//# sourceMappingURL=identifierAgent.d.ts.map