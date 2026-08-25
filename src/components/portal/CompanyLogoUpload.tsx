import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_LOGO_TYPES,
  clientLogoUrlQuery,
  removeClientLogo,
  uploadClientLogo,
} from "@/lib/member-profiles";

export function CompanyLogoUpload({
  userId,
  logoPath,
  hasProfile,
}: {
  userId: string | undefined;
  logoPath: string | null | undefined;
  hasProfile: boolean;
}) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: logoUrl } = useQuery(clientLogoUrlQuery(logoPath));

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["client-profile", userId] });
    await queryClient.invalidateQueries({ queryKey: ["client-logo"] });
  };

  const upload = useMutation({
    mutationFn: async () => {
      if (!userId || !file) throw new Error("Choose an image first");
      if (!hasProfile) throw new Error("Save your company details first, then add a logo");
      await uploadClientLogo(userId, file);
    },
    onSuccess: async () => {
      toast.success("Company logo updated");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not upload that logo"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!userId || !logoPath) return;
      await removeClientLogo(userId, logoPath);
    },
    onSuccess: async () => {
      toast.success("Logo removed");
      await refresh();
    },
    onError: () => toast.error("Could not remove that logo"),
  });

  return (
    <section className="rounded-xl border border-border bg-card p-7" aria-labelledby="logo-heading">
      <h2 id="logo-heading" className="text-lg font-semibold">
        Company logo
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        PNG, JPEG, SVG or WebP — max 2 MB. Stored privately; visible to you, kalvoteq admins, and your delivery team.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-5">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface">
          {logoUrl ? (
            <img src={logoUrl} alt="Your company logo" className="h-full w-full object-contain p-2" />
          ) : (
            <Building2 className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <form
          className="flex min-w-0 flex-1 flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            upload.mutate();
          }}
        >
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="company-logo">Choose an image</Label>
            <Input
              id="company-logo"
              ref={fileInput}
              type="file"
              accept={ACCEPTED_LOGO_TYPES.join(",")}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={!file || upload.isPending}>
            {upload.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Upload logo
          </Button>
          {logoPath ? (
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
