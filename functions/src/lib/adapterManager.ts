// Adapter Manager - Basic stub implementation for getting the app running
export class AdapterManager {
  static async searchSources(query: string, _sources: string[]): Promise<any[]> {
    return [
      {
        title: `Sample result for "${query}"`,
        price: '$25.00',
        source: 'sample-marketplace',
        url: '#'
      }
    ];
  }
  
  static async getAdapter(adapterPath: string): Promise<any> {
    return {
      search: async (query: string) => {
        return await this.searchSources(query, []);
      },
      name: adapterPath
    };
  }
}