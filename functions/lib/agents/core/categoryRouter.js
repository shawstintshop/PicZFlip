// Category Router - Basic stub implementation for getting the app running
export const categoryRouter = {
    async routeToCategory(_category) {
        return ['ebay', 'amazon']; // Return basic sources for now
    },
    async determineSearchStrategy(item) {
        return {
            category: item.category || 'general',
            sources: await this.routeToCategory(item.category || 'general'),
            strategy: 'basic'
        };
    }
};
//# sourceMappingURL=categoryRouter.js.map