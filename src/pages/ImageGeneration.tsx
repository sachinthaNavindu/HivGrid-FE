import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { imageApi } from "@/services/imageApi";
import {
  Sparkles,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Palette,
  Zap,
  Settings,
  Copy,
  Loader2,
} from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  style: string;
}

const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const { toast } = useToast();

  const imageStyles = [
    { id: "realistic", name: "Photorealistic", icon: "📸" },
    { id: "anime", name: "Anime", icon: "🎨" },
    { id: "digital-art", name: "Digital Art", icon: "🖌️" },
    { id: "fantasy", name: "Fantasy", icon: "🧚" },
    { id: "minimal", name: "Minimalist", icon: "⚪" },
    { id: "cyberpunk", name: "Cyberpunk", icon: "🤖" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const data = await imageApi.generateImage({
        prompt,
        negativePrompt,
        style: selectedStyle,
      });

      const newImage: GeneratedImage = {
        id: data.id,
        url: data.imageUrl,
        prompt: data.prompt,
        style: data.style,
        timestamp: new Date(data.createdAt),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      setSelectedImage(newImage);

      toast({
        title: "Image generated!",
        description: "Your image is ready",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemix = (image: GeneratedImage) => {
    setPrompt(image.prompt);
    setSelectedStyle(image.style);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
  };

  const handleDownload = async (image: GeneratedImage) => {
    const res = await fetch(image.url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `image-${image.id}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <div className="pt-24 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Palette className="w-4 h-4" />
          AI Image Generator
        </div>
        <h1 className="text-4xl font-bold mb-3">Create Visual Magic</h1>
        <p className="text-muted-foreground">
          Generate AI images using real backend integration
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold flex gap-2 mb-4">
              <Zap /> Create Image
            </h2>

            <Textarea
              placeholder="Describe your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-4"
            />

            <Input
              placeholder="Negative prompt (optional)"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="mb-4"
            />

            <div className="grid grid-cols-3 gap-3 mb-6">
              {imageStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-xl border ${
                    selectedStyle === style.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl">{style.icon}</div>
                    <div className="text-sm">{style.name}</div>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12"
              variant="gradient"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* HISTORY */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Recent Generations</h2>

            {generatedImages.length === 0 ? (
              <p className="text-muted-foreground text-center">
                No images generated yet
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((img) => (
                  <div
                    key={`${img.id}-${img.timestamp.getTime()}`} // ✅ Unique key
                    className="border rounded-xl overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.prompt}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm line-clamp-2">{img.prompt}</p>
                      <div className="flex justify-between mt-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemix(img)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(img)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex gap-2">
              <ImageIcon /> Preview
            </h2>

            {selectedImage ? (
              <>
                <img
                  src={selectedImage.url}
                  className="rounded-xl mb-3"
                  alt={selectedImage.prompt}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopyPrompt(selectedImage.prompt)}
                >
                  <Copy className="mr-2" />
                  Copy Prompt
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-center">
                No image selected
              </p>
            )}
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold flex gap-2 mb-3">
              <Settings /> Tips
            </h2>
            <p className="text-sm text-muted-foreground">
              Be descriptive, try styles, and experiment with prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;
