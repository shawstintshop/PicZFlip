// Identifier Agent - Basic stub implementation for getting the app running
export const identifierAgent = {
    async identifyItem(_imageBuffer) {
        return {
            category: 'general',
            confidence: 0.5,
            details: { description: 'Placeholder item identification' }
        };
    },
    async identifyFromPhoto(imageBuffer) {
        const result = await this.identifyItem(imageBuffer);
        return {
            category: result.category,
            details: result.details,
            confidence: result.confidence
        };
    }
};
//# sourceMappingURL=identifierAgent.js.map