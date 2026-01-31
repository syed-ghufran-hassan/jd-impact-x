export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

export function ShimmerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden border-white/5">
      <div className="h-48 bg-white/5 relative overflow-hidden">
        <ShimmerSkeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-5 space-y-4">
        <ShimmerSkeleton className="h-6 w-3/4" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-2/3" />
        
        <ShimmerSkeleton className="h-3 w-full rounded-full mt-2" />
        
        <div className="flex justify-between items-center pt-2">
          <ShimmerSkeleton className="h-5 w-20" />
          <ShimmerSkeleton className="h-4 w-16" />
        </div>
        
        <div className="flex justify-between pt-4 border-t border-white/5">
          <ShimmerSkeleton className="h-4 w-20" />
          <ShimmerSkeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CampaignDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Image */}
      <div className="h-64 md:h-96 rounded-2xl bg-white/5 relative overflow-hidden">
        <ShimmerSkeleton className="absolute inset-0 rounded-none" />
      </div>
      
      {/* Title and Meta */}
      <div className="space-y-4">
        <ShimmerSkeleton className="h-10 w-3/4" />
        <div className="flex gap-4">
          <ShimmerSkeleton className="h-6 w-32" />
          <ShimmerSkeleton className="h-6 w-24" />
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex justify-between">
          <ShimmerSkeleton className="h-8 w-32" />
          <ShimmerSkeleton className="h-8 w-24" />
        </div>
        <ShimmerSkeleton className="h-4 w-full rounded-full" />
        <div className="flex justify-between">
          <ShimmerSkeleton className="h-5 w-20" />
          <ShimmerSkeleton className="h-5 w-20" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}