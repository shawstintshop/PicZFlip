// Validation Agent - Basic stub implementation for getting the app running
export const validationAgent = {
    async validateResults(results) {
        return results.filter(result => result && result.title);
    },
    async validateAnalysis(analysis) {
        return {
            isValid: true,
            errors: [],
            warnings: [],
            analysis: analysis
        };
    }
};
//# sourceMappingURL=validationAgent.js.map