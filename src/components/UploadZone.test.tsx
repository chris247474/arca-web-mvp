import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UploadZone } from "./UploadZone";

// Mock the uploadDocument server action
const mockUploadDocument = vi.fn();

vi.mock("@/lib/actions/documents", () => ({
  uploadDocument: (...args: unknown[]) => mockUploadDocument(...args),
}));

describe("UploadZone", () => {
  const defaultProps = {
    dealId: "deal-123",
    userId: "user-456",
    groupId: "group-789",
    onUploadComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the upload zone", () => {
    render(<UploadZone {...defaultProps} />);

    expect(screen.getByText(/Drop PDF here/i)).toBeInTheDocument();
    expect(screen.getByText(/or tap to browse/i)).toBeInTheDocument();
  });

  it("should show drag state when file is dragged over", () => {
    render(<UploadZone {...defaultProps} />);

    const uploadZone = screen.getByTestId("upload-zone");
    fireEvent.dragOver(uploadZone);

    // Should show visual feedback for drag state
    expect(uploadZone).toHaveClass("border-primary");
  });

  it("should reset drag state when file is dragged out", () => {
    render(<UploadZone {...defaultProps} />);

    const uploadZone = screen.getByTestId("upload-zone");
    fireEvent.dragOver(uploadZone);
    fireEvent.dragLeave(uploadZone);

    // Should reset visual feedback
    expect(uploadZone).not.toHaveClass("border-primary");
  });

  it("should show error for non-PDF files", async () => {
    render(<UploadZone {...defaultProps} />);

    const uploadZone = screen.getByTestId("upload-zone");
    const nonPdfFile = new File(["content"], "document.txt", {
      type: "text/plain",
    });

    // Create a DataTransfer object
    const dataTransfer = {
      files: [nonPdfFile],
      types: ["Files"],
    };

    fireEvent.drop(uploadZone, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it("should accept PDF files via drag and drop", async () => {
    mockUploadDocument.mockResolvedValue({
      id: "doc-123",
      filename: "test.pdf",
    });

    render(<UploadZone {...defaultProps} />);

    const uploadZone = screen.getByTestId("upload-zone");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    const dataTransfer = {
      files: [pdfFile],
      types: ["Files"],
    };

    fireEvent.drop(uploadZone, { dataTransfer });

    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(
        "deal-123",
        expect.any(File),
        "user-456"
      );
    });
  });

  it("should accept PDF files via file input", async () => {
    mockUploadDocument.mockResolvedValue({
      id: "doc-123",
      filename: "test.pdf",
    });

    render(<UploadZone {...defaultProps} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalledWith(
        "deal-123",
        expect.any(File),
        "user-456"
      );
    });
  });

  it("should show upload progress", async () => {
    mockUploadDocument.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ id: "doc-123", filename: "test.pdf" }), 100);
        })
    );

    render(<UploadZone {...defaultProps} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });
  });

  it("should show success state after upload completes", async () => {
    mockUploadDocument.mockResolvedValue({
      id: "doc-123",
      filename: "test.pdf",
    });

    render(<UploadZone {...defaultProps} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Upload complete/i)).toBeInTheDocument();
    });
  });

  it("should call onUploadComplete callback after successful upload", async () => {
    const onUploadComplete = vi.fn();
    const mockDocument = { id: "doc-123", filename: "test.pdf" };
    mockUploadDocument.mockResolvedValue(mockDocument);

    render(<UploadZone {...defaultProps} onUploadComplete={onUploadComplete} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith(mockDocument);
    });
  });

  it("should show error state when upload fails", async () => {
    mockUploadDocument.mockResolvedValue(null);

    render(<UploadZone {...defaultProps} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  it("should allow canceling upload", async () => {
    mockUploadDocument.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ id: "doc-123", filename: "test.pdf" }), 5000);
        })
    );

    render(<UploadZone {...defaultProps} />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    // Wait for uploading state
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Should reset to idle state
    await waitFor(() => {
      expect(screen.getByText(/Drop PDF here/i)).toBeInTheDocument();
    });
  });

  it("should not upload when dealId is missing", async () => {
    render(<UploadZone {...defaultProps} dealId="" />);

    const fileInput = screen.getByTestId("input-file");
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(fileInput, "files", {
      value: [pdfFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockUploadDocument).not.toHaveBeenCalled();
    });
  });

  it("should display max file size information", () => {
    render(<UploadZone {...defaultProps} />);

    expect(screen.getByText(/PDF files only, max 50MB/i)).toBeInTheDocument();
  });
});
