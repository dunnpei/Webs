import React, { useState, useEffect, useMemo } from 'react';
import { fetchVendors } from './services/sheetService';
import { Vendor, FilterState, VendorCategory } from './types';
import VendorCard from './components/VendorCard';
import FilterBar from './components/FilterBar';
import { Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    category: VendorCategory.ALL,
    city: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchVendors();
        setVendors(data);
        setError(null);
      } catch (err: any) {
        console.error("Load data error:", err);
        setError(err.message || '無法載入廠商資料，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Unique cities for filter
  const cities = useMemo(() => {
    return Array.from(new Set(vendors.map(v => v.city))).sort();
  }, [vendors]);

  // Filtering Logic
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchKeyword =
        vendor.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        vendor.services.some(s => s.toLowerCase().includes(filters.keyword.toLowerCase()));

      const matchCategory = filters.category === VendorCategory.ALL || vendor.category === filters.category;

      const matchCity = filters.city === '' || vendor.city === filters.city;

      return matchKeyword && matchCategory && matchCity;
    });
  }, [vendors, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const currentVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">

      {/* Header removed as requested */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">

        {/* Intro */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight leading-tight">
            高雄大學城哈佛大樓
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-medium">
            特約廠商優惠資訊
          </p>
        </section>

        {/* Filter */}
        <FilterBar
          filters={filters}
          cities={cities}
          onFilterChange={handleFilterChange}
          totalResults={filteredVendors.length}
        />

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary-500" size={48} />
            <span className="ml-3 text-slate-500 font-medium">資料載入中...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center">
            <AlertCircle className="mr-2" />
            {error}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 mb-2">找不到符合條件的廠商</p>
            <button
              onClick={() => setFilters({ keyword: '', category: VendorCategory.ALL, city: '' })}
              className="text-primary-600 font-medium hover:underline"
            >
              清除所有篩選條件
            </button>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {currentVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-white hover:border-primary-300 transition-colors"
            >
              上一頁
            </button>
            <span className="px-4 py-2 text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-white hover:border-primary-300 transition-colors"
            >
              下一頁
            </button>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="text-xl md:text-3xl font-bold tracking-wider text-center">
            &copy; {new Date().getFullYear()} 高雄大學城哈佛大樓
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;