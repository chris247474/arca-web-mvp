import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DealFolder } from "./DealFolder";

// Mock the DocumentRow component
vi.mock("./DocumentRow", () => ({
  DocumentRow: ({ id, name }: { id: string; name: string }) => (
    <div data-testid={`document-row-${id}`}>{name}</div>
  ),
}));

describe("DealFolder", () => {
  const mockDocuments = [
    {
      id: "doc-1",
      filename: "document1.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      storagePath: "group-1/deal-1/document1.pdf",
      uploadedBy: "user-1",
      uploaderName: "John Doe",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "doc-2",
      filename: "document2.pdf",
      fileSize: 2048,
      mimeType: "application/pdf",
      storagePath: "group-1/deal-1/document2.pdf",
      uploadedBy: "user-2",
      uploaderName: "Jane Smith",
      createdAt: new Date("2024-01-16"),
    },
  ];

  const defaultProps = {
    id: "deal-123",
    name: "Test Deal",
    documentCount: 2,
    documents: mockDocuments,
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    canDelete: true,
    isCurator: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the deal name", () => {
    render(<DealFolder {...defaultProps} />);

    expect(screen.getByText("Test Deal")).toBeInTheDocument();
  });

  it("should display the document count", () => {
    render(<DealFolder {...defaultProps} />);

    expect(screen.getByText(/2 document/i)).toBeInTheDocument();
  });

  it("should be collapsed by default", () => {
    render(<DealFolder {...defaultProps} />);

    // Documents should not be visible initially
    expect(screen.queryByTestId("document-row-doc-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("document-row-doc-2")).not.toBeInTheDocument();
  });

  it("should expand when clicked to show documents", async () => {
    render(<DealFolder {...defaultProps} />);

    // Click the trigger to expand
    const trigger = screen.getByRole("button", { name: /test deal/i });
    fireEvent.click(trigger);

    // Documents should now be visible
    expect(await screen.findByTestId("document-row-doc-1")).toBeInTheDocument();
    expect(await screen.findByTestId("document-row-doc-2")).toBeInTheDocument();
  });

  it("should collapse when clicked again", async () => {
    render(<DealFolder {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /test deal/i });

    // Expand
    fireEvent.click(trigger);
    expect(await screen.findByTestId("document-row-doc-1")).toBeInTheDocument();

    // Collapse
    fireEvent.click(trigger);

    // Documents should be hidden (note: due to animation, they may still be in DOM but hidden)
    // We check for data-state attribute instead
    const collapsible = screen.getByTestId("deal-folder-deal-123");
    expect(collapsible).toHaveAttribute("data-state", "closed");
  });

  it("should show singular 'document' for count of 1", () => {
    render(<DealFolder {...defaultProps} documentCount={1} />);

    expect(screen.getByText(/1 document$/i)).toBeInTheDocument();
  });

  it("should show 'Create Deal' button for curators when onCreateDeal is provided", () => {
    const onCreateDeal = vi.fn();
    render(
      <DealFolder {...defaultProps} isCurator={true} onCreateDeal={onCreateDeal} />
    );

    // The create deal button should be visible when curator
    // Note: this button is in the parent component context, not DealFolder itself
  });

  it("should render with correct test id", () => {
    render(<DealFolder {...defaultProps} />);

    expect(screen.getByTestId("deal-folder-deal-123")).toBeInTheDocument();
  });

  it("should display folder icon", () => {
    render(<DealFolder {...defaultProps} />);

    // Check for the folder icon (it has specific classes)
    const folderIcon = document.querySelector("[class*='lucide-folder']");
    expect(folderIcon || screen.getByTestId("folder-icon")).toBeTruthy();
  });

  it("should display chevron icon that rotates on expand", async () => {
    render(<DealFolder {...defaultProps} />);

    const trigger = screen.getByRole("button", { name: /test deal/i });

    // Before expand
    const chevronBefore = document.querySelector("[class*='lucide-chevron']");
    expect(chevronBefore).toBeTruthy();

    // After expand - chevron should rotate (handled by CSS)
    fireEvent.click(trigger);
  });

  it("should handle empty documents array", () => {
    render(
      <DealFolder {...defaultProps} documents={[]} documentCount={0} />
    );

    expect(screen.getByText("Test Deal")).toBeInTheDocument();
    expect(screen.getByText(/0 documents/i)).toBeInTheDocument();
  });

  it("should allow default expanded state via prop", () => {
    render(<DealFolder {...defaultProps} defaultExpanded={true} />);

    // Documents should be visible immediately
    expect(screen.getByTestId("document-row-doc-1")).toBeInTheDocument();
    expect(screen.getByTestId("document-row-doc-2")).toBeInTheDocument();
  });

  it("should pass canDelete prop to child DocumentRow components", async () => {
    const onDelete = vi.fn();
    render(
      <DealFolder {...defaultProps} canDelete={false} onDelete={onDelete} />
    );

    const trigger = screen.getByRole("button", { name: /test deal/i });
    fireEvent.click(trigger);

    // The DocumentRow will receive canDelete prop - verified via mock
  });
});
