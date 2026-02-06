import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadDocument,
  getDocuments,
  getDocumentUrl,
  deleteDocument,
} from "./documents";

// Mock storage functions
vi.mock("@/lib/storage", () => ({
  uploadToStorage: vi.fn(),
  getSignedUrl: vi.fn(),
  deleteFromStorage: vi.fn(),
  generateStoragePath: vi.fn((groupId, dealId, filename) => `${groupId}/${dealId}/${filename}`),
}));

// Mock database
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockDelete = vi.fn();
const mockReturning = vi.fn();
const mockWhere = vi.fn();
const mockFrom = vi.fn();
const mockValues = vi.fn();

vi.mock("@/db", () => ({
  db: {
    insert: () => ({ values: mockValues }),
    select: () => ({ from: mockFrom }),
    delete: () => ({ where: mockWhere }),
  },
}));

vi.mock("@/db/schema", () => ({
  documents: { id: "id", dealId: "deal_id", filename: "filename" },
  deals: { id: "id", groupId: "group_id" },
}));

describe("documents server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chains
    mockValues.mockReturnValue({ returning: mockReturning });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning });
  });

  describe("uploadDocument", () => {
    it("should upload a document and create DB record", async () => {
      const { uploadToStorage } = await import("@/lib/storage");
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      vi.mocked(uploadToStorage).mockResolvedValue({
        data: { path: "group-123/deal-456/test.pdf" },
        error: null,
      });

      const mockDocument = {
        id: "doc-123",
        filename: "test.pdf",
        fileSize: 12,
        mimeType: "application/pdf",
        storagePath: "group-123/deal-456/test.pdf",
        dealId: "deal-456",
        uploadedBy: "user-789",
        createdAt: new Date(),
      };

      mockReturning.mockResolvedValue([mockDocument]);
      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: "deal-456", groupId: "group-123" }]),
      });

      const result = await uploadDocument(
        "deal-456",
        mockFile,
        "user-789"
      );

      expect(result).toBeDefined();
      expect(result?.filename).toBe("test.pdf");
    });

    it("should return null when dealId is empty", async () => {
      const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = await uploadDocument("", mockFile, "user-123");
      expect(result).toBeNull();
    });

    it("should return null when userId is empty", async () => {
      const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
      const result = await uploadDocument("deal-123", mockFile, "");
      expect(result).toBeNull();
    });

    it("should return null when storage upload fails", async () => {
      const { uploadToStorage } = await import("@/lib/storage");
      const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: "deal-456", groupId: "group-123" }]),
      });

      vi.mocked(uploadToStorage).mockResolvedValue({
        data: null,
        error: { message: "Upload failed" },
      });

      const result = await uploadDocument("deal-456", mockFile, "user-789");
      expect(result).toBeNull();
    });
  });

  describe("getDocuments", () => {
    it("should return all documents for a deal", async () => {
      const mockDocuments = [
        {
          id: "doc-1",
          filename: "file1.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
          dealId: "deal-456",
        },
        {
          id: "doc-2",
          filename: "file2.pdf",
          fileSize: 2048,
          mimeType: "application/pdf",
          dealId: "deal-456",
        },
      ];

      mockWhere.mockResolvedValue(mockDocuments);

      const result = await getDocuments("deal-456");

      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe("file1.pdf");
    });

    it("should return empty array for invalid dealId", async () => {
      const result = await getDocuments("");
      expect(result).toEqual([]);
    });

    it("should return empty array when no documents exist", async () => {
      mockWhere.mockResolvedValue([]);

      const result = await getDocuments("deal-456");
      expect(result).toEqual([]);
    });
  });

  describe("getDocumentUrl", () => {
    it("should return a signed URL for download", async () => {
      const { getSignedUrl } = await import("@/lib/storage");

      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([
          {
            id: "doc-123",
            storagePath: "group-123/deal-456/test.pdf",
          },
        ]),
      });

      vi.mocked(getSignedUrl).mockResolvedValue({
        data: { signedUrl: "https://example.com/signed-url" },
        error: null,
      });

      const result = await getDocumentUrl("doc-123");

      expect(result).toBe("https://example.com/signed-url");
    });

    it("should return null for invalid document id", async () => {
      const result = await getDocumentUrl("");
      expect(result).toBeNull();
    });

    it("should return null when document not found", async () => {
      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await getDocumentUrl("nonexistent-doc");
      expect(result).toBeNull();
    });

    it("should return null when signed URL generation fails", async () => {
      const { getSignedUrl } = await import("@/lib/storage");

      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([
          {
            id: "doc-123",
            storagePath: "group-123/deal-456/test.pdf",
          },
        ]),
      });

      vi.mocked(getSignedUrl).mockResolvedValue({
        data: null,
        error: { message: "Failed to generate URL" },
      });

      const result = await getDocumentUrl("doc-123");
      expect(result).toBeNull();
    });
  });

  describe("deleteDocument", () => {
    it("should delete document from storage and database", async () => {
      const { deleteFromStorage } = await import("@/lib/storage");

      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([
          {
            id: "doc-123",
            storagePath: "group-123/deal-456/test.pdf",
          },
        ]),
        returning: mockReturning,
      });

      vi.mocked(deleteFromStorage).mockResolvedValue({
        data: [{ name: "group-123/deal-456/test.pdf" }],
        error: null,
      });

      mockReturning.mockResolvedValue([{ id: "doc-123" }]);

      const result = await deleteDocument("doc-123");

      expect(result).toBe(true);
      expect(deleteFromStorage).toHaveBeenCalledWith(
        "group-123/deal-456/test.pdf"
      );
    });

    it("should return false for invalid document id", async () => {
      const result = await deleteDocument("");
      expect(result).toBe(false);
    });

    it("should return false when document not found", async () => {
      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await deleteDocument("nonexistent-doc");
      expect(result).toBe(false);
    });

    it("should still delete from database even if storage deletion fails", async () => {
      const { deleteFromStorage } = await import("@/lib/storage");

      mockWhere.mockReturnValue({
        limit: vi.fn().mockResolvedValue([
          {
            id: "doc-123",
            storagePath: "group-123/deal-456/test.pdf",
          },
        ]),
        returning: mockReturning,
      });

      vi.mocked(deleteFromStorage).mockResolvedValue({
        data: null,
        error: { message: "Storage deletion failed" },
      });

      mockReturning.mockResolvedValue([{ id: "doc-123" }]);

      // Should still return true if DB deletion succeeded
      const result = await deleteDocument("doc-123");
      expect(result).toBe(true);
    });
  });
});
