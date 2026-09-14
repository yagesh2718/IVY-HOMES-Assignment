import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../utils/api';
import { Search, MapPin, Building, AlertCircle, Loader2, Filter, Calendar } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { SkeletonGrid } from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Projects() {
  const [allFetched, setAllFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const [filters, setFilters] = useState({
    locality: '',
    project_status: '',
    developer_name: '',
    sort: '',
    minPrice: 0,
    maxPrice: 50,
    is_live: ''
  });


  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + LIMIT);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);


  useEffect(() => {
    const fetchProjects = async () => {
      if (!hasMore) return;
      try {
        setLoading(true);
        if (offset === 0) setInitialLoading(true);
        setError('');

        const params = { limit: LIMIT, offset };

        const res = await api.get('/v1/projects', { params });
        const newResults = res.data.results || [];

        if (offset === 0) {
          setAllFetched(newResults);
        } else {
          setAllFetched(prev => {
            const existingIds = new Set(prev.map(item => item.project_id));
            const distinctNew = newResults.filter(item => !existingIds.has(item.project_id));
            return [...prev, ...distinctNew];
          });
        }

        if (newResults.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        setError('Failed to fetch projects.');
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProjects();
  }, [offset]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filtered = React.useMemo(() => {
    let result = allFetched.filter(item => {
      if (filters.locality && (!item.locality || !item.locality.toLowerCase().includes(filters.locality.toLowerCase()))) return false;
      if (filters.project_status && item.project_status !== filters.project_status) return false;
      if (filters.developer_name && (!item.developer_name || !item.developer_name.toLowerCase().includes(filters.developer_name.toLowerCase()))) return false;
      
      const priceMin = parseFloat(item.price_min) || 0;
      if (filters.minPrice && priceMin < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && priceMin > parseFloat(filters.maxPrice)) return false;

      return true;
    });

    if (filters.sort === 'price_asc') {
      result.sort((a, b) => a.price_min - b.price_min);
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => b.price_min - a.price_min);
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }

    return result;
  }, [allFetched, filters]);
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price) || price === 0 || price === '0') return '0';
    return `₹ ${price} Cr`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 rounded-3xl p-8 mb-2 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] rounded-full bg-indigo-600/30 blur-[80px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[150%] rounded-full bg-blue-500/20 blur-[90px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Developer Projects</h2>
            <p className="text-indigo-100 mt-2 font-medium">Explore premium new developments and upcoming real estate projects</p>
          </div>
        </div>
      </div>

      <div className="relative z-50 bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Locality</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="locality"
              value={filters.locality}
              onChange={handleFilterChange}
              className="pl-10 block w-full rounded-xl border border-slate-200/60 shadow-none bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm py-2.5 transition-all"
              placeholder="Search locality..."
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <CustomSelect
            name="project_status"
            value={filters.project_status}
            onChange={handleFilterChange}
            placeholder="Any"
            theme="blue"
            options={[
              { value: '', label: 'Any' },
              { value: 'under construction', label: 'Under Construction' },
              { value: 'ready to move', label: 'Ready to Move' },
              { value: 'new launch', label: 'New Launch' }
            ]}
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Price Range: <span className="text-indigo-600 font-bold">{formatPrice(filters.minPrice)}</span> - <span className="text-indigo-600 font-bold">{(!filters.maxPrice || filters.maxPrice >= 50) ? 'Any' : formatPrice(filters.maxPrice)}</span>
          </label>
          <div className="px-2">
            <Slider
              range
              min={0}
              max={50}
              step={0.5}
              value={[filters.minPrice || 0, filters.maxPrice || 50]}
              onChange={(val) => {
                setFilters(prev => ({ ...prev, minPrice: val[0], maxPrice: val[1] }));
              }}
              styles={{
                track: { backgroundColor: '#3b82f6', height: 6 },
                handle: {
                  borderColor: '#3b82f6',
                  height: 20,
                  width: 20,
                  marginTop: -7,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                },
                rail: { backgroundColor: '#e2e8f0', height: 6 }
              }}
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Sort</label>
          <CustomSelect
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            placeholder="Default"
            theme="blue"
            options={[
              { value: '', label: 'Default' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
              { value: 'newest', label: 'Time: Newest First' },
              { value: 'oldest', label: 'Time: Oldest First' }
            ]}
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Developer Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="developer_name"
              value={filters.developer_name}
              onChange={handleFilterChange}
              className="pl-10 block w-full rounded-xl border border-slate-200/60 shadow-none bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm py-2.5 transition-all"
              placeholder="e.g. Prestige, Sobha..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {initialLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <>
          {allFetched.length === 0 && !hasMore ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
              <Building className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, index) => {
                const isLastElement = index === filtered.length - 1;
                return (
                  <div
                    key={`${item.project_id}-${index}`}
                    ref={isLastElement ? lastElementRef : null}
                    className="block bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group h-full flex flex-col"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.apartment_name}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="capitalize">{item.locality}</span>
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 capitalize whitespace-nowrap">
                          {item.project_status}
                        </span>
                      </div>

                      <div className="mb-4 mt-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price_min)} - {formatPrice(item.price_max)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Developer</span>
                          <span className="font-medium truncate">{item.developer_name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Units</span>
                          <span className="font-medium">{item.total_units}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Towers</span>
                          <span className="font-medium truncate">{item.total_towers || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Floors</span>
                          <span className="font-medium truncate">{item.total_floors || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Possession</span>
                          <span className="font-medium truncate">{item.possession_date ? new Date(item.possession_date).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">RERA ID</span>
                          <span className="font-medium truncate">{item.rera_number || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {loading && !initialLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
