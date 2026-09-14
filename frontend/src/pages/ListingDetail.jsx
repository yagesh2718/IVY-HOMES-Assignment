import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { MapPin, Home as HomeIcon, Maximize2, ArrowLeft, Loader2, Phone, Mail, Bath, Grid, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError('');

      let detailRes;
      try {
        detailRes = await api.get(`/v1/listings/${id}`);
      } catch (err) {
        throw err;
      }

      let similarRes = { data: { results: [] } };
      try {
        similarRes = await api.get(`/v1/listings/${id}/similar`);
      } catch (err) {
        console.warn('Similar endpoint failed', err);
      }

      setListing(detailRes.data);
      setSimilar(similarRes.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load listing details.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <p className="text-red-500 font-medium mb-4">{error || 'Listing not found'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
          Go Back
        </button>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      <motion.button
        variants={itemVariants}
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Listings
      </motion.button>

      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {listing.apartment_name || 'Independent Property'}
                </h1>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${listing.is_live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {listing.is_live ? 'Live' : 'Inactive'}
                </span>
                {listing.is_verified && (
                  <span className="px-3 py-1 flex items-center text-xs font-bold uppercase tracking-wider rounded-lg bg-indigo-100 text-indigo-800">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                  </span>
                )}
              </div>
              <p className="text-slate-500 flex items-center text-lg font-medium">
                <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                <span className="capitalize">{listing.locality}</span>
              </p>
            </div>

            <div className="text-left md:text-right bg-slate-50 p-5 rounded-2xl border border-slate-100 min-w-[200px]">
              <div className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                {formatPrice(listing.price)}
              </div>
              <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{listing.property_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-100 my-8">
            <div className="flex items-center group">
              <div className="bg-indigo-50 p-4 rounded-2xl mr-4 group-hover:bg-indigo-100 transition-colors">
                <HomeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Bedrooms</p>
                <p className="font-bold text-lg text-slate-900">{listing.bedroom}</p>
              </div>
            </div>
            <div className="flex items-center group">
              <div className="bg-indigo-50 p-4 rounded-2xl mr-4 group-hover:bg-indigo-100 transition-colors">
                <Bath className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Bathrooms</p>
                <p className="font-bold text-lg text-slate-900">{listing.bathroom}</p>
              </div>
            </div>
            <div className="flex items-center group">
              <div className="bg-indigo-50 p-4 rounded-2xl mr-4 group-hover:bg-indigo-100 transition-colors">
                <Maximize2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Carpet Area</p>
                <p className="font-bold text-lg text-slate-900">{listing.carpet_area} sqft</p>
              </div>
            </div>
            <div className="flex items-center group">
              <div className="bg-indigo-50 p-4 rounded-2xl mr-4 group-hover:bg-indigo-100 transition-colors">
                <Grid className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Furnishing</p>
                <p className="font-bold text-lg text-slate-900 capitalize">{listing.furnishing}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-8 h-1 bg-indigo-500 rounded-full mr-3"></span>
                  Description
                </h3>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-lg">
                  {listing.description || 'No description provided by the seller.'}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-8 h-1 bg-blue-500 rounded-full mr-3"></span>
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-8 text-base bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Super Built-up</span> <span className="font-bold text-slate-900">{listing.super_built_up_area} sqft</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Floor</span> <span className="font-bold text-slate-900">{listing.floor} of {listing.total_floors}</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Facing</span> <span className="font-bold text-slate-900 capitalize">{listing.facing_direction}</span></div>
                  <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-medium">Balconies</span> <span className="font-bold text-slate-900">{listing.balcony}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Parking</span> <span className="font-bold text-slate-900">{listing.covered_parking}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Project ID</span> <span className="font-bold text-slate-900">{listing.project_id || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Contact Seller</h3>
                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Posted By</p>
                    <div className="flex items-center text-slate-900 font-bold text-lg">
                      <span className="capitalize">{listing.posted_by_name}</span>
                      <span className="ml-2 text-xs bg-white px-2 py-1 rounded-md text-indigo-600 border border-indigo-100 capitalize">{listing.posted_by}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <div className="flex items-center text-slate-900 font-bold text-lg bg-white p-3 rounded-xl border border-slate-200">
                      <Phone className="h-5 w-5 mr-3 text-indigo-500" />
                      {listing.posted_by_contact}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-500 space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                  Posted on {formatDate(listing.posted_at)}
                </div>
                <div className="flex items-center">
                  <Grid className="h-4 w-4 mr-3 text-slate-400" />
                  Listing ID: <span className="font-mono ml-2 bg-slate-100 px-2 py-0.5 rounded">{listing.listing_id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similar Listings */}
      {similar.length > 0 && (
        <motion.div variants={itemVariants} className="pt-10 border-t border-slate-200/60 mt-10">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Similar Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((sim) => (
              <Link
                to={`/listings/${sim.listing_id}`}
                key={sim.listing_id}
                className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <h4 className="font-bold text-lg text-slate-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">{sim.apartment_name || 'Independent Property'}</h4>
                <div className="text-indigo-600 font-black text-xl mb-4">{formatPrice(sim.price)}</div>
                <div className="text-sm font-medium text-slate-500 flex gap-4">
                  <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md"><HomeIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {sim.bedroom}</span>
                  <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md"><Maximize2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {sim.carpet_area}</span>
                  <span className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md capitalize truncate"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> {sim.locality}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
