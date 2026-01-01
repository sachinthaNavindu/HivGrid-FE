import React from 'react';
import { Post } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X, Edit2, Trash2, Tag } from 'lucide-react';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;  
}

const PostModal: React.FC<PostModalProps> = ({
  post,
  onClose,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const { user: currentUser } = useAuth();

  const postUser =
    typeof post.user === 'object' ? post.user : null;

  const isOwner =
    !!currentUser &&
    !!postUser &&
    (currentUser.email === postUser.email ||
      currentUser.username === postUser.username);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          <div className="md:w-1/2 bg-muted flex items-center justify-center">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-contain max-h-[50vh] md:max-h-[90vh]"
            />
          </div>

          <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {postUser?.imageUrl ? (
                  <img
                    src={postUser.imageUrl}
                    alt={postUser.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
                    <span className="text-lg font-medium text-secondary-foreground">
                      {postUser?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                <div>
                  <p className="font-medium text-foreground">
                    {postUser?.username || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {postUser?.email}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              {post.title}
            </h2>

            {post.caption && (
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {post.caption}
              </p>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={`${post._id}-${tag}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1" />

            {isOwner && showActions && ( 
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={onEdit}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Post
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
