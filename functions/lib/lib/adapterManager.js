// Adapter Manager - Basic stub implementation for getting the app running
export class AdapterManager {
    static async searchSources(query, _sources) {
        return [
            {
                title: `Sample result for "${query}"`,
                price: '$25.00',
                source: 'sample-marketplace',
                url: '#'
            }
        ];
    }
    static async getAdapter(adapterPath) {
        return {
            search: async (query) => {
                return await this.searchSources(query, []);
            },
            name: adapterPath
        };
    }
}
//# sourceMappingURL=adapterManager.js.map