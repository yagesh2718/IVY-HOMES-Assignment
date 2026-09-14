import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, Home as HomeIcon, Maximize2, Loader2, AlertCircle, Heart, ArrowRight, Filter } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { SkeletonGrid } from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Listings() {
  const [allFetchedListings, setAllFetchedListings] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const [offset, setOffset] = useState(0);
  const LIMIT = 50;

  // Filters
  const [filters, setFilters] = useState({
    bhk: '',
    locality: '',
    minPrice: 0,
    maxPrice: 50000000,
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

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/v1/saved');
      const favIds = new Set((res.data.results || []).map(f => f.listing_id || f.id || f.project_id));
      setFavorites(favIds);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    }
  };

  const toggleFavorite = async (e, listing) => {
    e.preventDefault();
    e.stopPropagation();
    const id = listing.listing_id || listing.project_id;
    const isFav = favorites.has(id);

    // Optimistic update
    const newFavs = new Set(favorites);
    if (isFav) {
      newFavs.delete(id);
    } else {
      newFavs.add(id);
    }
    setFavorites(newFavs);

    try {
      if (isFav) {
        await api.delete(`/v1/saved/${id}`);
      } else {
        await api.post('/v1/saved', { listing_id: id });
      }
    } catch (err) {
      // Revert on failure
      setFavorites(favorites);
      console.error('Failed to toggle favorite', err);
    }
  };


  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!hasMore) return;
      try {
        setLoading(true);
        if (offset === 0) setInitialLoading(true);
        setError('');

        const params = { limit: LIMIT, offset };

        const res = await api.get('/v1/listings', { params });
        const newResults = res.data.results || [];

        if (offset === 0) {
          setAllFetchedListings(newResults);
        } else {
          setAllFetchedListings(prev => {
            const existingIds = new Set(prev.map(item => item.listing_id));
            const distinctNew = newResults.filter(item => !existingIds.has(item.listing_id));
            return [...prev, ...distinctNew];
          });
        }

        if (newResults.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        setError('Failed to fetch listings. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchListings();
  }, [offset]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredListings = useMemo(() => {
    let result = allFetchedListings.filter(item => {
      if (filters.locality && (!item.locality || !item.locality.toLowerCase().includes(filters.locality.toLowerCase()))) return false;
      if (filters.bhk && parseInt(item.bedroom) !== parseInt(filters.bhk)) return false;
      
      const price = parseInt(item.price) || 0;
      if (filters.minPrice !== undefined && price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice !== undefined && price > parseInt(filters.maxPrice)) return false;

      if (filters.furnishing && item.furnishing !== filters.furnishing) return false;
      
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
  }, [allFetchedListings, filters]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-3xl p-8 mb-2 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] rounded-full bg-indigo-600/30 blur-[80px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[150%] rounded-full bg-blue-500/20 blur-[90px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Property Listings</h2>
            <p className="text-indigo-100 mt-2 font-medium">Discover your dream home from our exclusive collection of properties</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-0 ring-0 shadow-none/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
      >
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Locality</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
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

        <div className="lg:col-span-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">BHK</label>
          <CustomSelect
            name="bhk"
            value={filters.bhk}
            onChange={handleFilterChange}
            placeholder="Any"
            theme="indigo"
            options={[
              { value: '', label: 'Any' },
              { value: '1', label: '1 BHK' },
              { value: '2', label: '2 BHK' },
              { value: '3', label: '3 BHK' },
              { value: '4', label: '4+ BHK' }
            ]}
          />
        </div>

        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Price Range: <span className="text-indigo-600 font-bold">{(!filters.minPrice || filters.minPrice == 0) ? '0' : '₹' + (filters.minPrice / 100000) + ' L'}</span> - <span className="text-indigo-600 font-bold">{(!filters.maxPrice || filters.maxPrice >= 50000000) ? 'Any' : '₹' + (filters.maxPrice / 100000) + ' L'}</span>
          </label>
          <div className="px-2">
            <Slider
              range
              min={0}
              max={50000000}
              step={1000000}
              value={[filters.minPrice || 0, filters.maxPrice || 50000000]}
              onChange={(val) => {
                setFilters(prev => ({ ...prev, minPrice: val[0], maxPrice: val[1] }));
              }}
              styles={{
                track: { backgroundColor: '#4f46e5', height: 6 },
                handle: {
                  borderColor: '#4f46e5',
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

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Furnishing</label>
          <CustomSelect
            name="furnishing"
            value={filters.furnishing}
            onChange={handleFilterChange}
            placeholder="Any"
            theme="indigo"
            options={[
              { value: '', label: 'Any' },
              { value: 'unfurnished', label: 'Unfurnished' },
              { value: 'semi-furnished', label: 'Semi-furnished' },
              { value: 'fully-furnished', label: 'Fully-furnished' }
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort</label>
          <CustomSelect
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            placeholder="Default"
            theme="indigo"
            options={[
              { value: '', label: 'Default' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
              { value: 'area_asc', label: 'Area: Small to Large' },
              { value: 'area_desc', label: 'Area: Large to Small' },
              { value: 'newest', label: 'Time: Newest First' },
              { value: 'oldest', label: 'Time: Oldest First' }
            ]}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col justify-end h-full">
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
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Property Type</label>
              <CustomSelect
                name="property_type"
                value={filters.property_type}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="indigo"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'villa', label: 'Villa' },
                  { value: 'independent house', label: 'Independent House' },
                  { value: 'builder floor', label: 'Builder Floor' }
                ]}
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bathrooms</label>
              <CustomSelect
                name="bathroom"
                value={filters.bathroom}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="indigo"
                options={[
                  { value: '', label: 'Any' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4+' }
                ]}
              />
            </div>
            
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Facing Direction</label>
              <CustomSelect
                name="facing_direction"
                value={filters.facing_direction}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="indigo"
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
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <CustomSelect
                name="is_live"
                value={filters.is_live}
                onChange={handleFilterChange}
                placeholder="Any"
                theme="indigo"
                options={[
                  { value: '', label: 'Any' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Min Area (sqft)</label>
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
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Max Area (sqft)</label>
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
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl flex items-center text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      {/* Grid */}
      {initialLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <>
          {filteredListings.length === 0 && !hasMore ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
              <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <HomeIcon className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No listings found</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">Try adjusting your filters.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredListings.map((listing, index) => {
                const isLastElement = index === filteredListings.length - 1;
                const isFav = favorites.has(listing.listing_id);
                return (
                  <motion.div variants={itemVariants} key={`${listing.listing_id}-${index}`} ref={isLastElement ? lastElementRef : null}>
                    <Link
                      to={`/listings/${listing.listing_id}`}
                      className="block bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group h-full flex flex-col"
                    >
                      <button
                        onClick={(e) => toggleFavorite(e, listing)}
                        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 active:scale-95 transition-all duration-200"
                      >
                        <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-400'}`} />
                      </button>
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-5 pr-10">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {listing.apartment_name || 'Independent Property'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 flex items-center mt-2 bg-slate-100/80 w-fit px-2.5 py-1 rounded-md">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                              <span className="capitalize">{listing.locality}</span>
                            </p>
                          </div>
                        </div>

                          <div className="mb-5 flex items-center justify-between">
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                              {formatPrice(listing.price)}
                            </span>
                            <div className="flex gap-2">
                              {listing.is_verified && (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800">
                                  ✓ Verified
                                </span>
                              )}
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${listing.is_live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {listing.is_live ? 'Live' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-100/50">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Configuration</span>
                              <span className="font-medium text-slate-700">{listing.bedroom} BHK, {listing.bathroom} Bath</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Area</span>
                              <span className="font-medium text-slate-700">{listing.carpet_area} sqft</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Floor</span>
                              <span className="font-medium text-slate-700">{listing.floor} / {listing.total_floors}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Maintenance</span>
                              <span className="font-medium text-slate-700">{listing.maintenance ? `₹${listing.maintenance.toLocaleString()}/mo` : 'Included'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Balcony</span>
                              <span className="font-medium text-slate-700">{listing.balcony || 'None'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Parking</span>
                              <span className="font-medium text-slate-700">{listing.covered_parking ? `${listing.covered_parking} Spots` : 'None'}</span>
                            </div>
                          </div>
                      </div>
                      <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-sky-50/50 transition-colors">
                        <span className="text-xs font-bold text-slate-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.04)] truncate max-w-[120px]">
                          {listing.posted_by_name}
                        </span>
                        <div className="flex items-center gap-1.5 text-sky-600 font-bold text-sm group-hover:text-sky-700 transition-colors">
                          View Details
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {loading && !initialLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
