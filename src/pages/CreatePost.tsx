import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { postsAPI } from "@/services/api";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPostSchema } from "@/lib/validation";

import { InferType } from "yup";

import {
  Upload,
  X,
  Image as ImageIcon,
  Tag,
  Type,
  AlignLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

type CreatePostForm =InferType<typeof createPostSchema>

const CreatePost: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostForm>({
    resolver: yupResolver(createPostSchema),
    defaultValues: {
      title: "",
      caption: "",
      tags: "",
    },
  });

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: CreatePostForm) => {
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
      formData.append("title", data.title.trim());
      formData.append("caption", data.caption.trim());
      formData.append(
        "tags",
        JSON.stringify(
          data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        )
      );
      formData.append("image", image);

      await postsAPI.publish(formData);

      toast({
        title: "Post published!",
        description: "Your creation is now live",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Publishing failed",
        description:
          error.response?.data?.message ||
          "Failed to publish post. Please try again.",
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
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Share your creativity
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Create a New Post
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 animate-fade-in-up"
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Image
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
                    className="absolute top-4 right-4 p-2 rounded-full bg-foreground/80 text-background hover:bg-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleImageChange(f);
                    setIsDragging(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3" />
                  <p>Drop your image here or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageChange(e.target.files[0])
                    }
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="w-4 h-4" /> Title
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Give your post a title"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="caption" className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Caption
              </Label>
              <Textarea
                id="caption"
                {...register("caption")}
                placeholder="Tell us more..."
                className="min-h-[120px]"
              />
              {errors.caption && (
                <p className="text-xs text-red-500">{errors.caption.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags
              </Label>
              <Input
                id="tags"
                {...register("tags")}
                placeholder="art, photography, design"
              />
              {errors.tags && (
                <p className="text-xs text-red-500">{errors.tags.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Separate with commas</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              variant="gradient"
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
