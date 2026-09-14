import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../utils/api';
import { Search, MapPin, HomeIcon, AlertCircle, Loader2, Filter, Maximize2 } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { SkeletonGrid } from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Rentals() {
  const [allFetched, setAllFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  
  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  const [filters, setFilters] = useState({
    bhk: '',
    locality: '',
    furnishing: '',
    sort: '',
    property_type: '',
    bathroom: '',
    facing_direction: '',
    min_area: '',
    max_area: '',
    is_live: ''
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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
    const fetchRentals = async () => {
      if (!hasMore) return;
      try {
        setLoading(true);
        if (offset === 0) setInitialLoading(true);
        setError('');
        
        const params = { limit: LIMIT, offset };

        const res = await api.get('/v1/rentals', { params });
        const newResults = res.data.results || [];
        
        if (offset === 0) {
          setAllFetched(newResults);
        } else {
          setAllFetched(prev => {
            const existingIds = new Set(prev.map(item => item.listing_id || item.id));
            const distinctNew = newResults.filter(item => !existingIds.has(item.listing_id || item.id));
            return [...prev, ...distinctNew];
          });
        }
        
        if (newResults.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        setError('Failed to fetch rentals.');
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchRentals();
  }, [offset]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filtered = useMemo(() => {
    let result = allFetched.filter(item => {
      if (filters.locality && (!item.locality || !item.locality.toLowerCase().includes(filters.locality.toLowerCase()))) return false;
      if (filters.bhk && parseInt(item.bedroom) !== parseInt(filters.bhk)) return false;
      if (filters.furnishing && item.furnishing !== filters.furnishing) return false;
      
      const price = parseInt(item.price) || 0;
      if (filters.minPrice !== undefined && price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice !== undefined && price > parseInt(filters.maxPrice)) return false;

      if (filters.property_type && item.property_type !== filters.property_type) return false;
      if (filters.bathroom && parseInt(item.bathroom) !== parseInt(filters.bathroom)) return false;
      if (filters.facing_direction && item.facing_direction !== filters.facing_direction) return false;
      if (filters.min_area && parseInt(item.carpet_area) < parseInt(filters.min_area)) return false;
      if (filters.max_area && parseInt(item.carpet_area) > parseInt(filters.max_area)) return false;
      if (filters.is_live) {
        const isLiveBool = filters.is_live === 'true';
        if (item.is_live !== isLiveBool) return false;
      }
      
      return true;
    });

    if (filters.sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'area_asc') {
      result.sort((a, b) => a.carpet_area - b.carpet_area);
    } else if (filters.sort === 'area_desc') {
      result.sort((a, b) => b.carpet_area - a.carpet_area);
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.posted_at) - new Date(b.posted_at));
    }

    return result;
  }, [allFetched, filters]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
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
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Rental Properties</h2>
            <p className="text-indigo-100 mt-2 font-medium">Find the perfect rental property to call your next home</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 relative z-50">
        
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Locality</label>
          <div className="relative group">
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
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Price Range: <span className="text-indigo-600 font-bold">{formatPrice(filters.minPrice)}</span> - <span className="text-indigo-600 font-bold">{(!filters.maxPrice || filters.maxPrice >= 5000000) ? 'Any' : formatPrice(filters.maxPrice)}</span>
          </label>
          <div className="px-2">
            <Slider
              range
              min={0}
              max={500000}
              step={5000}
              value={[filters.minPrice || 0, filters.maxPrice || 500000]}
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
        
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
          <CustomSelect
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            placeholder="Default"
            theme="blue"
            options={[
              { value: '', label: 'Default' },
              { value: 'price_asc', label: 'Rent: Low to High' },
              { value: 'price_desc', label: 'Rent: High to Low' },
              { value: 'area_asc', label: 'Area: Small to Large' },
              { value: 'area_desc', label: 'Area: Large to Small' },
              { value: 'newest', label: 'Time: Newest First' },
              { value: 'oldest', label: 'Time: Oldest First' }
            ]}
          />
        </div>

        <div className="md:col-span-2 flex flex-col justify-end h-full">
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 text-indigo-700 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl px-3 py-2.5 font-semibold transition-all shadow-sm"
          >
            <Filter className="h-4 w-4" />
            More
          </button>
        </div>

        {showMoreFilters && (
          <>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <CustomSelect
                name="property_type"
                value={filters.property_type}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'villa', label: 'Villa' },
                  { value: 'independent house', label: 'Independent House' },
                  { value: 'builder floor', label: 'Builder Floor' }
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
              <CustomSelect
                name="bhk"
                value={filters.bhk}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: '1', label: '1 BHK' },
                  { value: '2', label: '2 BHK' },
                  { value: '3', label: '3 BHK' },
                  { value: '4', label: '4+ BHK' }
                ]}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
              <CustomSelect
                name="furnishing"
                value={filters.furnishing}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'unfurnished', label: 'Unfurnished' },
                  { value: 'semi-furnished', label: 'Semi-furnished' },
                  { value: 'fully-furnished', label: 'Fully-furnished' }
                ]}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <CustomSelect
                name="bathroom"
                value={filters.bathroom}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4+' }
                ]}
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Facing Direction</label>
              <CustomSelect
                name="facing_direction"
                value={filters.facing_direction}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'north', label: 'North' },
                  { value: 'east', label: 'East' },
                  { value: 'south', label: 'South' },
                  { value: 'west', label: 'West' },
                  { value: 'north-east', label: 'North-East' }
                ]}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <CustomSelect
                name="is_live"
                value={filters.is_live}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="blue"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (sqft)</label>
              <input
                type="number"
                name="min_area"
                min="0"
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                value={filters.min_area}
                onChange={handleFilterChange}
                className="block w-full rounded-xl border border-slate-200/60 shadow-none bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm px-4 py-2.5 transition-all"
                placeholder="e.g. 1000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (sqft)</label>
              <input
                type="number"
                name="max_area"
                min="0"
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                value={filters.max_area}
                onChange={handleFilterChange}
                className="block w-full rounded-xl border border-slate-200/60 shadow-none bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm px-4 py-2.5 transition-all"
                placeholder="e.g. 2000"
              />
            </div>
          </>
        )}
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
          {filtered.length === 0 && !hasMore ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
              <HomeIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rentals found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, index) => {
                const isLastElement = index === filtered.length - 1;
                return (
                  <div 
                    key={`${item.listing_id}-${index}`}
                    ref={isLastElement ? lastElementRef : null}
                    className="block bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group h-full flex flex-col"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 pr-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.title || item.apartment_name}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="capitalize">{item.locality}</span>
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap ${item.is_live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_live ? 'Live' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="mb-4 mt-2">
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(item.price)}<span className="text-sm text-gray-500 font-normal">/mo</span></span>
                        <div className="text-xs text-gray-500 mt-1">Deposit: {formatPrice(item.deposit)}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Configuration</span>
                          <span className="font-medium">{item.bedroom} BHK, {item.bathroom} Bath</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Area</span>
                          <span className="font-medium">{item.carpet_area} sqft</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Furnishing</span>
                          <span className="font-medium capitalize">{item.furnishing}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Maintenance</span>
                          <span className="font-medium">{item.maintenance ? `₹${item.maintenance.toLocaleString()}/mo` : 'Included'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Type</span>
                          <span className="font-medium capitalize">{item.property_type || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Facing</span>
                          <span className="font-medium capitalize">{item.facing_direction || 'N/A'}</span>
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
