import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Tag, 
  Type, 
  AlignLeft,
  Loader2,
  Sparkles 
} from 'lucide-react';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post",
        variant: "destructive",
      });
      return;
    }

    if (!image) {
      toast({
        title: "Image required",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('caption', caption.trim());
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('image', image);

      await postsAPI.publish(formData);
      toast({
        title: "Post published!",
        description: "Your creation is now live",
      });
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to publish post. Please try again.";
      toast({
        title: "Publishing failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Share your creativity
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Create a New Post
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image
              </Label>
              
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden shadow-card group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-96 object-contain bg-muted"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-2 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">
                        Drop your image here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                Caption
              </Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell us more about your creation..."
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="art, photography, design (comma separated)"
                className="h-12"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
