import React from 'react';
import { Activity, Building, IndianRupee, FileText, AlertTriangle, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const stats = [
    { title: "Total Listings", value: "5,100", icon: Database, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "Unique Properties", value: "5,099", icon: Building, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Active Listings", value: "4,017", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Avg 2BHK Price/sqft", value: "₹63,105", icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" },
    { title: "Corrupt Records", value: "33", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Fake Listings", value: "95", icon: FileText, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Analytics Overview</h2>
            <p className="text-indigo-100 mt-2 font-medium">Real-time market insights and trends across our property portfolio</p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((item, index) => (
          <motion.div 
            key={item.title} 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-3xl border border-slate-200/60 p-6 relative group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-20 transition-transform group-hover:scale-110 ${item.bg}`} />
            
            <div className="flex items-center relative z-10">
              <div className={`flex-shrink-0 p-4 rounded-2xl border ${item.bg} ${item.border}`}>
                <item.icon className={`h-7 w-7 ${item.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate mb-1">{item.title}</dt>
                  <dd>
                    <div className="text-3xl font-black text-slate-900">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
              <AlertTriangle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">API Discrepancies Found</h3>
          </div>
          
          <ul className="space-y-4 text-slate-600 list-disc pl-5">
            <li><strong className="text-slate-800">Authentication:</strong> The documentation says to append the API key as a query parameter (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">?api_key=...</code>), but the server expects it in the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">X-API-Key</code> request header.</li>
            <li><strong className="text-slate-800">Pagination:</strong> The API uses <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">offset</code> instead of the documented <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">page</code>. Max limit is 50. Additionally, the metadata <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">total: 4796</code> is incorrect as complete pagination yields exactly 5,100 records.</li>
            <li><strong className="text-slate-800">Filters:</strong> <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">min_price</code>, <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">max_price</code>, and <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">furnishing</code> filters are completely ignored by the server. Furthermore, the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">project_id</code> filter is completely ignored in the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">/v1/listings</code> endpoint.</li>
            <li><strong className="text-slate-800">Sorting:</strong> <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">order=desc</code> sorts in ascending order instead of descending.</li>
            <li><strong className="text-slate-800">Live Status:</strong> <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">/v1/listings</code> returns 1,083 inactive records (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">is_live=false</code>) despite documentation claiming they are excluded server-side.</li>
            <li><strong className="text-slate-800">Favourites Endpoint:</strong> The documented <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">/v1/favourites</code> endpoint returns a 404. The actual endpoint is <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">/v1/saved</code> and requires a <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">listing_id</code> rather than an <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">id</code>.</li>
            <li><strong className="text-slate-800">Analytics Endpoint:</strong> The documented <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">/v1/analytics/summary</code> endpoint returns a 404 Not Found error.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
