import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_AVATAR_TYPES,
  avatarUrlQuery,
  initialsFrom,
  removeAvatar,
  uploadAvatar,
} from "@/lib/avatars";

export function AvatarUpload({
  userId,
  avatarPath,
  displayName,
  email,
}: {
  userId: string | undefined;
  avatarPath: string | null | undefined;
  displayName: string | null | undefined;
  email: string | null | undefined;
}) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: avatarUrl } = useQuery(avatarUrlQuery(avatarPath));

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["profile", "mine", userId] });
    await queryClient.invalidateQueries({ queryKey: ["avatar"] });
  };

  const upload = useMutation({
    mutationFn: async () => {
      if (!userId || !file) throw new Error("Choose an image first");
      await uploadAvatar(userId, file);
    },
    onSuccess: async () => {
      toast.success("Profile picture updated");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not upload that image"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!userId || !avatarPath) return;
      await removeAvatar(userId, avatarPath);
    },
    onSuccess: async () => {
      toast.success("Profile picture removed");
      await refresh();
    },
    onError: () => toast.error("Could not remove that picture"),
  });

  return (
    <section className="rounded-xl border border-border bg-card p-7" aria-labelledby="avatar-heading">
      <h2 id="avatar-heading" className="text-lg font-semibold">
        Profile picture
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        PNG, JPEG or WebP — max 5 MB. Cropped to a square automatically and stored privately.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Avatar className="h-20 w-20 border border-border">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your profile picture" /> : null}
          <AvatarFallback className="text-lg">{initialsFrom(displayName, email)}</AvatarFallback>
        </Avatar>

        <form
          className="flex min-w-0 flex-1 flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            upload.mutate();
          }}
        >
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="avatar-file">Choose an image</Label>
            <Input
              id="avatar-file"
              ref={fileInput}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={!file || upload.isPending}>
            {upload.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Upload picture
          </Button>
          {avatarPath ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Remove
            </Button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
