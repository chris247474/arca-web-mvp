import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadToStorage, getSignedUrl, deleteFromStorage } from "./storage";

// Mock createAdminClient
const mockUpload = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockRemove = vi.fn();

vi.mock("./supabase/server", () => ({
  createAdminClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
        remove: mockRemove,
      }),
    },
  }),
}));

describe("storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadToStorage", () => {
    it("should upload a file to the documents bucket", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const path = "group-123/deal-456/test.pdf";

      mockUpload.mockResolvedValue({
        data: { path },
        error: null,
      });

      const result = await uploadToStorage(mockFile, path);

      expect(mockUpload).toHaveBeenCalledWith(path, mockFile, {
        contentType: "application/pdf",
        upsert: false,
      });
      expect(result.data?.path).toBe(path);
      expect(result.error).toBeNull();
    });

    it("should return error when upload fails", async () => {
      const mockFile = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });
      const path = "group-123/deal-456/test.pdf";
      const mockError = { message: "Upload failed" };

      mockUpload.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await uploadToStorage(mockFile, path);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it("should use the correct storage path format", async () => {
      const mockFile = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });
      const groupId = "group-abc";
      const dealId = "deal-xyz";
      const filename = "document.pdf";
      const expectedPath = `${groupId}/${dealId}/${filename}`;

      mockUpload.mockResolvedValue({
        data: { path: expectedPath },
        error: null,
      });

      await uploadToStorage(mockFile, expectedPath);

      expect(mockUpload).toHaveBeenCalledWith(
        expectedPath,
        mockFile,
        expect.any(Object)
      );
    });
  });

  describe("getSignedUrl", () => {
    it("should return a signed URL for a valid path", async () => {
      const path = "group-123/deal-456/test.pdf";
      const signedUrl = "https://example.com/signed-url";

      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl },
        error: null,
      });

      const result = await getSignedUrl(path);

      expect(mockCreateSignedUrl).toHaveBeenCalledWith(path, 3600);
      expect(result.data?.signedUrl).toBe(signedUrl);
      expect(result.error).toBeNull();
    });

    it("should accept custom expiration time", async () => {
      const path = "group-123/deal-456/test.pdf";
      const expiresIn = 7200;
      const signedUrl = "https://example.com/signed-url";

      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl },
        error: null,
      });

      const result = await getSignedUrl(path, expiresIn);

      expect(mockCreateSignedUrl).toHaveBeenCalledWith(path, expiresIn);
      expect(result.data?.signedUrl).toBe(signedUrl);
    });

    it("should return error when getting signed URL fails", async () => {
      const path = "group-123/deal-456/test.pdf";
      const mockError = { message: "File not found" };

      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await getSignedUrl(path);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("deleteFromStorage", () => {
    it("should delete a file from storage", async () => {
      const path = "group-123/deal-456/test.pdf";

      mockRemove.mockResolvedValue({
        data: [{ name: path }],
        error: null,
      });

      const result = await deleteFromStorage(path);

      expect(mockRemove).toHaveBeenCalledWith([path]);
      expect(result.error).toBeNull();
    });

    it("should return error when deletion fails", async () => {
      const path = "group-123/deal-456/test.pdf";
      const mockError = { message: "Deletion failed" };

      mockRemove.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await deleteFromStorage(path);

      expect(result.error).toEqual(mockError);
    });
  });
});
