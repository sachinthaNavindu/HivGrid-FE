import React from 'react';

const PostSkeleton: React.FC = () => {
  // Generate random heights for masonry effect
  const heights = [200, 280, 180, 320, 240, 200, 300, 220, 260, 180];
  
  return (
    <div className="masonry-grid">
      {heights.map((height, index) => (
        <div key={index} className="masonry-item">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Image skeleton */}
            <div 
              className="bg-muted animate-pulse-soft relative overflow-hidden"
              style={{ height: `${height}px` }}
            >
              <div className="absolute inset-0 bg-shimmer-gradient animate-shimmer" />
            </div>
            
            {/* User info skeleton */}
            <div className="p-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-muted animate-pulse-soft" />
              <div className="h-3 w-20 rounded-full bg-muted animate-pulse-soft" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton;
