import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="block bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-0 ring-0 shadow-none/60 overflow-hidden relative group h-full flex flex-col">
      <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-5 pr-10">
          <div className="w-full">
            <div className="h-6 bg-slate-200 rounded-md animate-pulse w-3/4 mb-3" />
            <div className="h-5 bg-slate-200 rounded-md animate-pulse w-1/2" />
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded-md animate-pulse w-1/3" />
          <div className="h-6 bg-slate-200 rounded-md animate-pulse w-16" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-600">
          <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 h-10 w-full animate-pulse" />
          <div className="flex items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 h-10 w-full animate-pulse" />
        </div>
      </div>
      <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-t border-slate-100 flex justify-between items-center">
        <div className="h-7 bg-white rounded-lg border border-slate-100 animate-pulse w-24" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
