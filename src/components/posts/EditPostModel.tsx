import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/services/api";

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onSave: (data: {
    title: string;
    caption: string;
    tags: string[];
  }) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  open,
  onClose,
  post,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCaption(post.caption || "");
      setTags(post.tags || []);
    }
  }, [post]);

  const handleSave = () => {
    onSave({
      title,
      caption,
      tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
          />

          <Input
            value={tags.join(",")}
            onChange={(e) =>
              setTags(
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Tags (comma separated)"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
