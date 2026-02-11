import { useEffect, useMemo, useState } from 'react';
import { getSources, searchSource } from '../services/api';
import { Search, Globe, ListFilter } from 'lucide-react';

interface SourceInfo {
  id: string;
  name: string;
  categories: string[];
  priority: number;
  region: string;
}

export default function MapPage() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSources();
        if (mounted) setSources(data.sources || []);
      } catch (e: any) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of sources) {
      (s.categories || []).forEach((c) => set.add(c));
    }
    return Array.from(set).sort();
  }, [sources]);

  const filteredSources = useMemo(() => {
    if (!categoryFilter) return sources;
    return sources.filter((s) => s.categories?.includes(categoryFilter));
  }, [sources, categoryFilter]);

  const onSearch = async () => {
    setError(null);
    setResults(null);
    if (!selectedSource) {
      setError('Please select a source');
      return;
    }
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }
    try {
      setLoading(true);
      const resp = await searchSource(selectedSource, query);
      setResults(resp.results || []);
    } catch (e: any) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Source Map</h1>
        <p className="text-gray-600">Browse available sources and run a quick search.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Globe className="w-4 h-4" />
                Sources ({sources.length})
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ListFilter className="w-4 h-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-md border px-2 py-1 text-sm"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="max-h-[420px] overflow-auto divide-y">
              {filteredSources.map((s) => {
                const active = selectedSource === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSource(s.id)}
                    className={`w-full text-left p-3 hover:bg-slate-50 ${active ? 'bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">
                          {s.categories?.join(', ') || 'Uncategorized'}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">{s.region}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 font-medium text-slate-700">Quick Search</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select a source</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex-1 flex items-center gap-2 rounded-md border px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search term..."
                  className="w-full outline-none text-sm"
                />
              </div>
              <button
                onClick={onSearch}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <div className="mt-3 text-sm text-red-600">{error}</div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 font-medium text-slate-700">Results</div>
            {!results && <div className="text-sm text-slate-500">No results yet. Run a search.</div>}
            {Array.isArray(results) && results.length === 0 && (
              <div className="text-sm text-slate-500">No items found.</div>
            )}
            {Array.isArray(results) && results.length > 0 && (
              <div className="space-y-3">
                {results.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-lg border p-3">
                    <div className="font-medium text-slate-900">{item.title || item.name || 'Item'}</div>
                    {item.price && (
                      <div className="text-sm text-slate-600">${item.price}</div>
                    )}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
