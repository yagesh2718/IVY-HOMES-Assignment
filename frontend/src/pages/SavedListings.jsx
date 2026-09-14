import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, MapPin, Home as HomeIcon, Maximize2, Loader2, AlertCircle, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/saved');
      setListings(res.data.results || []);
    } catch (err) {
      setError('Failed to fetch saved listings.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    const prev = [...listings];
    setListings(prev.filter(item => item.listing_id !== id));

    try {
      await api.delete(`/v1/saved/${id}`);
    } catch (err) {
      setListings(prev);
      console.error('Failed to remove favorite', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-blue-800 tracking-tight">Saved Listings</h2>
          <p className="text-slate-500 mt-2 font-medium">Your favorite properties</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl flex items-center text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60">
          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-rose-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved listings</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">You haven't favorited any properties yet.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {listings.map((listing) => (
              <motion.div
                key={listing.listing_id}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                layout
              >
                <Link
                  to={`/listings/${listing.listing_id}`}
                  className="block bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group h-full relative flex flex-col"
                >
                  <button
                    onClick={(e) => removeFavorite(e, listing.listing_id)}
                    className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white shadow-sm hover:bg-rose-50 transition-colors group/btn border border-slate-100"
                    title="Remove from favorites"
                  >
                    <Heart className="h-5 w-5 fill-rose-500 text-rose-500 group-hover/btn:fill-slate-300 group-hover/btn:text-slate-300 transition-colors" />
                  </button>
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-5 pr-14">
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

                    <div className="mb-5 flex flex-col justify-between">
                      <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                        {formatPrice(listing.price)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-600">
                      <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <HomeIcon className="h-4 w-4 mr-2.5 text-indigo-400" />
                        <span>{listing.bedroom} BHK</span>
                      </div>
                      <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Maximize2 className="h-4 w-4 mr-2.5 text-indigo-400" />
                        <span>{listing.carpet_area} sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                    <span className="text-xs text-slate-400 font-semibold truncate w-24 tracking-wider">ID: {listing.listing_id}</span>
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm group-hover:text-indigo-700 transition-colors">
                      View Details
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
