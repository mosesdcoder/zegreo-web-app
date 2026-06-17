"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import { documentsApi } from "@/lib/api/documents";
import { DocRow } from "@/components/brand/doc-row";
import { Banner } from "@/components/brand/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { Document } from "@/lib/types";

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [uploadDoc, setUploadDoc] = useState<Document | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: appList, isLoading: appsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.list(),
  });
  const app = Array.isArray(appList) ? appList[0] : (appList as any)?.[0];

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", app?.id],
    queryFn: () => documentsApi.list(app!.id),
    enabled: !!app?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) =>
      documentsApi.upload(app!.id, uploadDoc!.type, file),
    onSuccess: () => {
      toast.success("Document uploaded!");
      qc.invalidateQueries({ queryKey: ["documents", app?.id] });
      setUploadDoc(null);
    },
    onError: (e: any) => toast.error(e.apiError ?? "Upload failed"),
  });

  if (appsLoading || docsLoading) {
    return (
      <div className="p-4 md:p-6 md:ml-56 space-y-3 max-w-xl">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-4 md:p-6 md:ml-56 max-w-xl">
        <Banner variant="info">Start an application first to upload documents.</Banner>
      </div>
    );
  }

  const mandatory = docs?.filter((d) => d.isMandatory) ?? [];
  const optional = docs?.filter((d) => !d.isMandatory) ?? [];
  const allVerified = mandatory.every((d) => d.status === "VERIFIED");
  const hasPending = mandatory.some((d) => d.status === "NOT_UPLOADED" || d.status === "REJECTED");

  return (
    <div className="p-4 md:p-6 md:ml-56 max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink mb-1">Documents</h1>
        <p className="text-sm text-muted-foreground">Upload the required documents for your application.</p>
      </div>

      {allVerified && (
        <Banner variant="offer" title="All documents verified!">
          Your documents have been verified by our team.
        </Banner>
      )}
      {hasPending && (
        <Banner variant="warning" title="Action required">
          Some mandatory documents are missing or need to be re-uploaded.
        </Banner>
      )}

      {mandatory.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required Documents</h2>
          {mandatory.map((doc) => (
            <DocRow key={doc.id} doc={doc} onUpload={setUploadDoc} />
          ))}
        </section>
      )}

      {optional.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optional Documents</h2>
          {optional.map((doc) => (
            <DocRow key={doc.id} doc={doc} onUpload={setUploadDoc} />
          ))}
        </section>
      )}

      {/* Upload dialog */}
      <Dialog open={!!uploadDoc} onOpenChange={(o) => !o && setUploadDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadDoc?.label}</DialogTitle>
            <DialogDescription>Select a clear, readable file (PDF, JPG, or PNG, max 5 MB).</DialogDescription>
          </DialogHeader>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate({ file });
            }}
          />
          <Button
            variant="gold"
            className="w-full"
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? "Uploading…" : "Choose File"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
