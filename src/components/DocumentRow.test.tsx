import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DocumentRow } from "./DocumentRow";

describe("DocumentRow", () => {
  const defaultProps = {
    id: "doc-123",
    name: "test-document.pdf",
    uploaderName: "John Doe",
    uploaderInitials: "JD",
    uploadedAt: "Jan 15, 2024",
    fileSize: "1.5 MB",
    onView: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    canDelete: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render document name", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByText("test-document.pdf")).toBeInTheDocument();
  });

  it("should render uploader name", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render uploader initials in avatar", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should render upload date", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("should render file size", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByText("1.5 MB")).toBeInTheDocument();
  });

  it("should call onView when row is clicked", () => {
    const onView = vi.fn();
    render(<DocumentRow {...defaultProps} onView={onView} />);

    const row = screen.getByTestId("row-document-doc-123");
    fireEvent.click(row);

    expect(onView).toHaveBeenCalled();
  });

  it("should call onDownload when download button is clicked", () => {
    const onDownload = vi.fn();
    render(<DocumentRow {...defaultProps} onDownload={onDownload} />);

    const downloadButton = screen.getByTestId("button-download-doc-123");
    fireEvent.click(downloadButton);

    expect(onDownload).toHaveBeenCalled();
  });

  it("should render with correct test id", () => {
    render(<DocumentRow {...defaultProps} />);

    expect(screen.getByTestId("row-document-doc-123")).toBeInTheDocument();
  });

  it("should display PDF icon", () => {
    render(<DocumentRow {...defaultProps} />);

    // The FileText icon should be present
    const icon = document.querySelector(".lucide-file-text");
    expect(icon).toBeTruthy();
  });

  it("should not propagate click when clicking download button", () => {
    const onView = vi.fn();
    const onDownload = vi.fn();
    render(
      <DocumentRow {...defaultProps} onView={onView} onDownload={onDownload} />
    );

    const downloadButton = screen.getByTestId("button-download-doc-123");
    fireEvent.click(downloadButton);

    expect(onDownload).toHaveBeenCalled();
    expect(onView).not.toHaveBeenCalled();
  });

  it("should not propagate click when clicking menu button", () => {
    const onView = vi.fn();
    render(<DocumentRow {...defaultProps} onView={onView} />);

    const menuButton = screen.getByTestId("button-menu-doc-123");
    fireEvent.click(menuButton);

    expect(onView).not.toHaveBeenCalled();
  });

  it("should render menu trigger button", () => {
    render(<DocumentRow {...defaultProps} />);

    const menuButton = screen.getByTestId("button-menu-doc-123");
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-haspopup", "menu");
  });

  it("should have download button accessible", () => {
    render(<DocumentRow {...defaultProps} />);

    const downloadButton = screen.getByTestId("button-download-doc-123");
    expect(downloadButton).toBeInTheDocument();
  });

  it("should render with truncate class for long names", () => {
    render(<DocumentRow {...defaultProps} name="very-long-document-name-that-should-be-truncated.pdf" />);

    const nameElement = screen.getByText("very-long-document-name-that-should-be-truncated.pdf");
    expect(nameElement).toHaveClass("truncate");
  });
});
