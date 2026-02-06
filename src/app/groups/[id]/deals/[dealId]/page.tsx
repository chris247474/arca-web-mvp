"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { DocumentList } from "@/components/DocumentList";
import { PDFViewer } from "@/components/PDFViewer";
import { CommentSection } from "@/components/CommentSection";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDealById, type DealWithDocuments } from "@/lib/actions/deals";
import { getDocumentUrl } from "@/lib/actions/documents";
import { getGroupById } from "@/lib/actions/groups";
import { getMembershipRole } from "@/lib/actions/memberships";

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: Date;
}

function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </header>
      <div className="flex-1 flex">
        <div className="w-64 border-r p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-[600px] w-[450px] rounded-lg" />
        </div>
        <div className="w-80 border-l p-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundPage({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-semibold text-foreground">Not Found</h1>
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isCurator: isUserCurator } = useAuth();

  const groupId = params.id as string;
  const dealId = params.dealId as string;

  const [deal, setDeal] = useState<DealWithDocuments | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);

  // Check if user is curator for this group
  const isCurator = isUserCurator || memberRole === "curator";

  // Fetch deal data
  const fetchData = useCallback(async () => {
    if (!dealId || !groupId) {
      setError("Invalid URL parameters");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [dealResult, groupResult] = await Promise.all([
        getDealById(dealId),
        getGroupById(groupId),
      ]);

      if (!dealResult) {
        setError("Deal not found");
        setIsLoading(false);
        return;
      }

      // Verify deal belongs to this group
      if (dealResult.groupId !== groupId) {
        setError("Deal not found in this group");
        setIsLoading(false);
        return;
      }

      setDeal(dealResult);
      setGroupName(groupResult?.group?.name || "");

      // Check membership role if user is logged in
      if (user?.id) {
        const role = await getMembershipRole(user.id, groupId);
        setMemberRole(role);
      }

      // Auto-select first PDF document if available
      const firstPdf = dealResult.documents.find(
        (doc) => doc.mimeType === "application/pdf"
      );
      if (firstPdf) {
        setSelectedDocument(firstPdf);
      }
    } catch (err) {
      console.error("Error fetching deal:", err);
      setError("Failed to load deal");
    } finally {
      setIsLoading(false);
    }
  }, [dealId, groupId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch document URL when selection changes
  useEffect(() => {
    async function loadDocumentUrl() {
      if (!selectedDocument) {
        setDocumentUrl(null);
        return;
      }

      try {
        const url = await getDocumentUrl(selectedDocument.id);
        setDocumentUrl(url);
      } catch (err) {
        console.error("Error fetching document URL:", err);
        setDocumentUrl(null);
      }
    }

    loadDocumentUrl();
  }, [selectedDocument]);

  const handleBack = useCallback(() => {
    router.push(`/groups/${groupId}`);
  }, [router, groupId]);

  const handleSelectDocument = useCallback((doc: Document) => {
    setSelectedDocument(doc);
  }, []);

  const handleNavigate = useCallback(
    (view: string) => {
      if (view === "dashboard") router.push("/");
      if (view === "profile") router.push("/profile");
    },
    [router]
  );

  if (isLoading) {
    return (
      <>
        <LoadingSkeleton />
        <MobileNav activeView="groups" onNavigate={handleNavigate} />
      </>
    );
  }

  if (error || !deal) {
    return (
      <>
        <NotFoundPage
          message={error || "Deal not found"}
          onBack={handleBack}
        />
        <MobileNav activeView="groups" onNavigate={handleNavigate} />
      </>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-background pb-16 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 p-2 rounded-md bg-muted">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-foreground truncate">
                    {deal.name}
                  </h1>
                  {groupName && (
                    <p className="text-sm text-muted-foreground truncate">
                      {groupName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content - 3 panel layout */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            {/* Left panel - Document list */}
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={30}
              className="border-r"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-foreground">Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    {deal.documents.length}{" "}
                    {deal.documents.length === 1 ? "file" : "files"}
                  </p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DocumentList
                    documents={deal.documents}
                    selectedDocumentId={selectedDocument?.id || null}
                    onSelectDocument={handleSelectDocument}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center panel - PDF viewer */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <PDFViewer
                url={documentUrl}
                filename={selectedDocument?.filename}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right panel - Comments */}
            <ResizablePanel
              defaultSize={30}
              minSize={20}
              maxSize={40}
              className="border-l"
            >
              <CommentSection
                dealId={dealId}
                currentUserId={user?.id || null}
                isCurator={isCurator}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <MobileNav activeView="groups" onNavigate={handleNavigate} />
    </>
  );
}
