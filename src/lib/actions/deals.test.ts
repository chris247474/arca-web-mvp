import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
} from "./deals";

// Mock database and user context
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

// Mock database return builders
const mockReturning = vi.fn();
const mockWhere = vi.fn();
const mockFrom = vi.fn();
const mockValues = vi.fn();
const mockSet = vi.fn();

vi.mock("@/db", () => ({
  db: {
    insert: () => ({ values: mockValues }),
    select: () => ({ from: mockFrom }),
    update: () => ({ set: mockSet }),
    delete: () => ({ where: mockWhere }),
  },
}));

vi.mock("@/db/schema", () => ({
  deals: { id: "id", groupId: "group_id", name: "name" },
  documents: { dealId: "deal_id" },
}));

// Mock the user context
vi.mock("./auth", () => ({
  getUserProfile: vi.fn(),
}));

describe("deals server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chains
    mockValues.mockReturnValue({ returning: mockReturning });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning });
  });

  describe("createDeal", () => {
    it("should create a new deal with valid input", async () => {
      const mockDeal = {
        id: "deal-123",
        name: "Test Deal",
        description: "Test description",
        groupId: "group-456",
        createdBy: "user-789",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReturning.mockResolvedValue([mockDeal]);

      const result = await createDeal(
        "group-456",
        "Test Deal",
        "Test description",
        "user-789"
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Deal");
      expect(result?.groupId).toBe("group-456");
    });

    it("should return null when groupId is empty", async () => {
      const result = await createDeal("", "Test Deal", "Description", "user-789");
      expect(result).toBeNull();
    });

    it("should return null when name is empty", async () => {
      const result = await createDeal("group-456", "", "Description", "user-789");
      expect(result).toBeNull();
    });

    it("should return null when userId is empty", async () => {
      const result = await createDeal("group-456", "Test Deal", "Description", "");
      expect(result).toBeNull();
    });
  });

  describe("getDeals", () => {
    it("should return all deals for a group", async () => {
      const mockDeals = [
        {
          id: "deal-1",
          name: "Deal One",
          groupId: "group-456",
          createdAt: new Date(),
        },
        {
          id: "deal-2",
          name: "Deal Two",
          groupId: "group-456",
          createdAt: new Date(),
        },
      ];

      mockWhere.mockResolvedValue(mockDeals);

      const result = await getDeals("group-456");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Deal One");
    });

    it("should return empty array for invalid groupId", async () => {
      const result = await getDeals("");
      expect(result).toEqual([]);
    });

    it("should return empty array when no deals exist", async () => {
      mockWhere.mockResolvedValue([]);

      const result = await getDeals("group-456");
      expect(result).toEqual([]);
    });
  });

  describe("getDealById", () => {
    it("should return a deal with its documents", async () => {
      const mockDeal = {
        id: "deal-123",
        name: "Test Deal",
        groupId: "group-456",
        documents: [
          { id: "doc-1", filename: "file1.pdf" },
          { id: "doc-2", filename: "file2.pdf" },
        ],
      };

      mockWhere.mockReturnValue({ limit: vi.fn().mockResolvedValue([mockDeal]) });

      const result = await getDealById("deal-123");

      expect(result).toBeDefined();
      expect(result?.id).toBe("deal-123");
    });

    it("should return null for invalid id", async () => {
      const result = await getDealById("");
      expect(result).toBeNull();
    });

    it("should return null when deal not found", async () => {
      mockWhere.mockReturnValue({ limit: vi.fn().mockResolvedValue([]) });

      const result = await getDealById("nonexistent-deal");
      expect(result).toBeNull();
    });
  });

  describe("updateDeal", () => {
    it("should update deal name and description", async () => {
      const mockUpdatedDeal = {
        id: "deal-123",
        name: "Updated Deal",
        description: "Updated description",
        groupId: "group-456",
        updatedAt: new Date(),
      };

      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([mockUpdatedDeal]);

      const result = await updateDeal("deal-123", {
        name: "Updated Deal",
        description: "Updated description",
      });

      expect(result?.name).toBe("Updated Deal");
      expect(result?.description).toBe("Updated description");
    });

    it("should return null for invalid id", async () => {
      const result = await updateDeal("", { name: "Test" });
      expect(result).toBeNull();
    });

    it("should return null when deal not found", async () => {
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([]);

      const result = await updateDeal("nonexistent-deal", { name: "Test" });
      expect(result).toBeNull();
    });
  });

  describe("deleteDeal", () => {
    it("should delete a deal successfully", async () => {
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([{ id: "deal-123" }]);

      const result = await deleteDeal("deal-123");

      expect(result).toBe(true);
    });

    it("should return false for invalid id", async () => {
      const result = await deleteDeal("");
      expect(result).toBe(false);
    });

    it("should return false when deal not found", async () => {
      mockWhere.mockReturnValue({ returning: mockReturning });
      mockReturning.mockResolvedValue([]);

      const result = await deleteDeal("nonexistent-deal");
      expect(result).toBe(false);
    });
  });
});
