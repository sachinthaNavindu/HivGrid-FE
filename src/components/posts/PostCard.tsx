import React from 'react';
import { Post, User } from '@/services/api';
import { Edit2, Trash2 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  index: number;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  index,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const user = typeof post.user === 'object' ? post.user : null;

  return (
    <div
      className="masonry-item cursor-pointer group relative"
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-elegant overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  onEdit?.();
                }}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}

          <div className="p-3 space-y-1">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1">
              {post.title}
            </h3>

            {post.caption && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {post.caption}
              </p>
            )}
          </div>
        </div>

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
