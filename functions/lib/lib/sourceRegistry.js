export const MARKETPLACE_SOURCES = [
    // TIER 1 - MAJOR GENERAL MARKETPLACES
    {
        id: 'ebay',
        name: 'eBay',
        baseUrl: 'https://www.ebay.com',
        categories: ['general', 'collectibles', 'electronics', 'automotive', 'antiques'],
        adapter: 'categories/general/ebay',
        priority: 10,
        rateLimit: 100,
        hasApi: true,
        searchPattern: '/sch/i.html?_nkw={query}',
        active: true
    },
    {
        id: 'amazon_warehouse',
        name: 'Amazon Warehouse',
        baseUrl: 'https://www.amazon.com',
        categories: ['general', 'electronics', 'books', 'tools'],
        adapter: 'categories/general/amazon',
        priority: 9,
        rateLimit: 60,
        hasApi: true,
        searchPattern: '/s?k={query}&rh=p_n_condition-type:6358196011',
        active: true
    },
    {
        id: 'walmart_marketplace',
        name: 'Walmart Marketplace',
        baseUrl: 'https://www.walmart.com',
        categories: ['general', 'electronics', 'tools'],
        adapter: 'categories/general/walmart',
        priority: 8,
        rateLimit: 50,
        hasApi: false,
        searchPattern: '/search/?query={query}&cat_id=0&facet=condition:Refurbished',
        active: true
    },
    {
        id: 'mercari',
        name: 'Mercari',
        baseUrl: 'https://www.mercari.com',
        categories: ['general', 'collectibles', 'clothing', 'electronics'],
        adapter: 'categories/general/mercari',
        priority: 7,
        rateLimit: 30,
        hasApi: false,
        searchPattern: '/search/{query}',
        active: true
    },
    {
        id: 'bonanza',
        name: 'Bonanza',
        baseUrl: 'https://www.bonanza.com',
        categories: ['general', 'collectibles', 'vintage'],
        adapter: 'categories/general/bonanza',
        priority: 6,
        rateLimit: 25,
        hasApi: false,
        searchPattern: '/search?q%5Bkeyword_search%5D={query}',
        active: true
    },
    // CLOTHING & FASHION
    {
        id: 'poshmark',
        name: 'Poshmark',
        baseUrl: 'https://poshmark.com',
        categories: ['clothing', 'fashion', 'accessories'],
        adapter: 'categories/clothing/poshmark',
        priority: 9,
        rateLimit: 20,
        hasApi: false,
        searchPattern: '/search?query={query}',
        active: true
    },
    {
        id: 'depop',
        name: 'Depop',
        baseUrl: 'https://www.depop.com',
        categories: ['clothing', 'vintage', 'streetwear'],
        adapter: 'categories/clothing/depop',
        priority: 8,
        rateLimit: 15,
        hasApi: false,
        searchPattern: '/search?q={query}',
        active: true
    },
    {
        id: 'grailed',
        name: 'Grailed',
        baseUrl: 'https://www.grailed.com',
        categories: ['clothing', 'streetwear', 'designer'],
        adapter: 'categories/clothing/grailed',
        priority: 9,
        rateLimit: 20,
        hasApi: true,
        searchPattern: '/sold/{query}',
        active: true
    },
    {
        id: 'therealreal',
        name: 'The RealReal',
        baseUrl: 'https://www.therealreal.com',
        categories: ['clothing', 'luxury', 'designer', 'accessories'],
        adapter: 'categories/clothing/therealreal',
        priority: 9,
        rateLimit: 15,
        hasApi: false,
        searchPattern: '/search?keywords={query}',
        active: true
    },
    {
        id: 'vinted',
        name: 'Vinted',
        baseUrl: 'https://www.vinted.com',
        categories: ['clothing', 'accessories'],
        adapter: 'categories/clothing/vinted',
        priority: 7,
        rateLimit: 20,
        hasApi: false,
        searchPattern: '/catalog?search_text={query}',
        active: true
    },
    // ANTIQUES & COLLECTIBLES
    {
        id: 'liveauctioneers',
        name: 'LiveAuctioneers',
        baseUrl: 'https://www.liveauctioneers.com',
        categories: ['antiques', 'collectibles', 'art', 'vintage'],
        adapter: 'categories/antiques/liveauuctioneers',
        priority: 10,
        rateLimit: 100,
        hasApi: true,
        searchPattern: '/search/?keyword={query}',
        active: true
    },
    {
        id: 'invaluable',
        name: 'Invaluable',
        baseUrl: 'https://www.invaluable.com',
        categories: ['antiques', 'art', 'collectibles'],
        adapter: 'categories/antiques/invaluable',
        priority: 9,
        rateLimit: 50,
        hasApi: false,
        searchPattern: '/search?keyword={query}',
        active: true
    },
    {
        id: 'worthpoint',
        name: 'WorthPoint',
        baseUrl: 'https://www.worthpoint.com',
        categories: ['antiques', 'collectibles', 'vintage'],
        adapter: 'categories/antiques/worthpoint',
        priority: 8,
        rateLimit: 20,
        hasApi: false,
        searchPattern: '/search#/{query}',
        active: true
    },
    {
        id: 'rubylane',
        name: 'Ruby Lane',
        baseUrl: 'https://www.rubylane.com',
        categories: ['antiques', 'vintage', 'collectibles'],
        adapter: 'categories/antiques/rubylane',
        priority: 8,
        rateLimit: 25,
        hasApi: false,
        searchPattern: '/search?q={query}',
        active: true
    },
    // ELECTRONICS
    {
        id: 'swappa',
        name: 'Swappa',
        baseUrl: 'https://swappa.com',
        categories: ['electronics', 'phones', 'tablets'],
        adapter: 'categories/electronics/swappa',
        priority: 9,
        rateLimit: 40,
        hasApi: true,
        searchPattern: '/search?query={query}',
        active: true
    },
    {
        id: 'gazelle',
        name: 'Gazelle',
        baseUrl: 'https://www.gazelle.com',
        categories: ['electronics', 'phones', 'tablets'],
        adapter: 'categories/electronics/gazelle',
        priority: 8,
        rateLimit: 30,
        hasApi: false,
        searchPattern: '/search/{query}',
        active: true
    },
    // BOOKS
    {
        id: 'abebooks',
        name: 'AbeBooks',
        baseUrl: 'https://www.abebooks.com',
        categories: ['books', 'textbooks', 'rare'],
        adapter: 'categories/books/abebooks',
        priority: 10,
        rateLimit: 50,
        hasApi: true,
        searchPattern: '/servlet/SearchResults?kn={query}',
        active: true
    },
    {
        id: 'alibris',
        name: 'Alibris',
        baseUrl: 'https://www.alibris.com',
        categories: ['books', 'media'],
        adapter: 'categories/books/alibris',
        priority: 8,
        rateLimit: 30,
        hasApi: false,
        searchPattern: '/search/books/{query}',
        active: true
    },
    // AUTOMOTIVE
    {
        id: 'bringatrailer',
        name: 'Bring a Trailer',
        baseUrl: 'https://bringatrailer.com',
        categories: ['automotive', 'classic_cars', 'collectible_cars'],
        adapter: 'categories/automotive/bringatrailer',
        priority: 10,
        rateLimit: 20,
        hasApi: false,
        searchPattern: '/search/?query={query}',
        active: true
    },
    {
        id: 'carsandbids',
        name: 'Cars & Bids',
        baseUrl: 'https://carsandbids.com',
        categories: ['automotive', 'enthusiast_cars'],
        adapter: 'categories/automotive/carsandbids',
        priority: 9,
        rateLimit: 25,
        hasApi: false,
        searchPattern: '/search?q={query}',
        active: true
    },
    // LOCAL/REGIONAL SITES
    {
        id: 'craigslist',
        name: 'Craigslist',
        baseUrl: 'https://craigslist.org',
        categories: ['general', 'local', 'automotive', 'furniture'],
        adapter: 'categories/local/craigslist',
        priority: 8,
        rateLimit: 15,
        hasApi: false,
        searchPattern: '/search/sss?query={query}',
        active: true,
        region: 'US'
    },
    {
        id: 'facebook_marketplace',
        name: 'Facebook Marketplace',
        baseUrl: 'https://www.facebook.com/marketplace',
        categories: ['general', 'local'],
        adapter: 'categories/local/facebook',
        priority: 9,
        rateLimit: 10,
        hasApi: false,
        searchPattern: '/search/?query={query}',
        active: false, // Difficult to scrape
        region: 'Global'
    },
    {
        id: 'ksl',
        name: 'KSL Classifieds',
        baseUrl: 'https://classifieds.ksl.com',
        categories: ['general', 'local', 'automotive'],
        adapter: 'categories/local/ksl',
        priority: 8,
        rateLimit: 20,
        hasApi: false,
        searchPattern: '/search/{query}',
        active: true,
        region: 'Utah'
    },
    // SPECIALTY SITES
    {
        id: 'discogs',
        name: 'Discogs',
        baseUrl: 'https://www.discogs.com',
        categories: ['music', 'vinyl', 'collectibles'],
        adapter: 'categories/specialty/discogs',
        priority: 10,
        rateLimit: 60,
        hasApi: true,
        searchPattern: '/search/?q={query}&type=all',
        active: true,
        specialties: ['vinyl_records', 'music_equipment']
    },
    {
        id: 'reverb',
        name: 'Reverb',
        baseUrl: 'https://reverb.com',
        categories: ['music', 'instruments', 'audio'],
        adapter: 'categories/specialty/reverb',
        priority: 10,
        rateLimit: 40,
        hasApi: true,
        searchPattern: '/marketplace?query={query}',
        active: true,
        specialties: ['musical_instruments', 'audio_equipment']
    }
];
export function getSourcesByCategory(categories, region) {
    return MARKETPLACE_SOURCES
        .filter(source => source.active)
        .filter(source => categories.some(cat => source.categories.includes(cat)))
        .filter(source => !region || !source.region || source.region === region)
        .sort((a, b) => b.priority - a.priority);
}
export function getAllActiveSources() {
    return MARKETPLACE_SOURCES.filter(source => source.active);
}
export function getSourceById(id) {
    return MARKETPLACE_SOURCES.find(source => source.id === id);
}
export function getSourcesByPriority(minPriority) {
    return MARKETPLACE_SOURCES
        .filter(source => source.active && source.priority >= minPriority)
        .sort((a, b) => b.priority - a.priority);
}
export function getSourcesByRegion(region) {
    return MARKETPLACE_SOURCES
        .filter(source => source.active && (!source.region || source.region === region))
        .sort((a, b) => b.priority - a.priority);
}
//# sourceMappingURL=sourceRegistry.js.map