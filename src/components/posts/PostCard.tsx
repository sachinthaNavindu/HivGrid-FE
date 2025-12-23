import React from 'react';
import { Post, User } from '@/services/api';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  index: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick, index }) => {
  const user = typeof post.user === 'object' ? post.user : null;

  return (
    <div 
      className="masonry-item cursor-pointer group"
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-elegant overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
         {/* Title + Caption */}
        <div className="p-3 space-y-1">
          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {post.title}
          </h3>

          {/* Caption */}
          {post.caption && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {post.caption}
            </p>
          )}
        </div>
        </div>

        {/* User info */}
        {user && (
          <div className="p-3 flex items-center gap-2">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
                <span className="text-xs font-medium text-secondary-foreground">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground font-medium truncate">
              {user.username}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
