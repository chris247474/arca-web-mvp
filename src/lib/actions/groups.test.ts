import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      groups: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      memberships: {
        findMany: vi.fn(),
      },
    },
  },
}));

import { db } from "@/db";
import {
  createGroup,
  getGroups,
  getUserGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "./groups";

describe("createGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when curatorId is not provided", async () => {
    const result = await createGroup({
      name: "Test Group",
      description: "A test group",
      curatorId: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Curator ID is required");
  });

  it("should return error when name is not provided", async () => {
    const result = await createGroup({
      name: "",
      description: "A test group",
      curatorId: "user-123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group name is required");
  });

  it("should create a group with auto-generated invite code", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "A test group",
      visibility: "private",
      inviteCode: "ABCD1234",
      curatorId: "user-123",
      sector: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMembership = {
      id: "membership-123",
      userId: "user-123",
      groupId: "group-123",
      role: "curator",
      createdAt: new Date(),
    };

    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValueOnce([mockGroup]),
      }),
    });

    const mockMembershipInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValueOnce([mockMembership]),
      }),
    });

    // First call creates group, second creates membership
    vi.mocked(db.insert)
      .mockImplementationOnce(mockInsert)
      .mockImplementationOnce(mockMembershipInsert);

    const result = await createGroup({
      name: "Test Group",
      description: "A test group",
      curatorId: "user-123",
    });

    expect(result.success).toBe(true);
    expect(result.group).toBeDefined();
    expect(result.group?.name).toBe("Test Group");
  });

  it("should create curator membership when creating a group", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "A test group",
      visibility: "private",
      inviteCode: "ABCD1234",
      curatorId: "user-123",
      sector: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMembership = {
      id: "membership-123",
      userId: "user-123",
      groupId: "group-123",
      role: "curator",
      createdAt: new Date(),
    };

    vi.mocked(db.insert).mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValueOnce([mockGroup])
          .mockResolvedValueOnce([mockMembership]),
      }),
    }) as never);

    const result = await createGroup({
      name: "Test Group",
      description: "A test group",
      curatorId: "user-123",
    });

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(2);
  });
});

describe("getGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all public groups", async () => {
    const mockGroups = [
      {
        id: "group-1",
        name: "Public Group 1",
        description: "Description 1",
        visibility: "public",
        inviteCode: "CODE1234",
        curatorId: "user-1",
        sector: "Tech",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "group-2",
        name: "Public Group 2",
        description: "Description 2",
        visibility: "public",
        inviteCode: "CODE5678",
        curatorId: "user-2",
        sector: "Finance",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.query.groups.findMany).mockResolvedValue(mockGroups as never);

    const result = await getGroups();

    expect(result.success).toBe(true);
    expect(result.groups).toHaveLength(2);
    expect(result.groups?.[0].name).toBe("Public Group 1");
  });

  it("should return empty array when no public groups exist", async () => {
    vi.mocked(db.query.groups.findMany).mockResolvedValue([] as never);

    const result = await getGroups();

    expect(result.success).toBe(true);
    expect(result.groups).toHaveLength(0);
  });
});

describe("getUserGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when userId is not provided", async () => {
    const result = await getUserGroups("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("User ID is required");
  });

  it("should return groups where user is curator or member", async () => {
    const mockMemberships = [
      {
        id: "membership-1",
        userId: "user-123",
        groupId: "group-1",
        role: "curator",
        createdAt: new Date(),
        group: {
          id: "group-1",
          name: "My Group",
          description: "Description",
          visibility: "private",
          inviteCode: "CODE1234",
          curatorId: "user-123",
          sector: "Tech",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "membership-2",
        userId: "user-123",
        groupId: "group-2",
        role: "member",
        createdAt: new Date(),
        group: {
          id: "group-2",
          name: "Another Group",
          description: "Description 2",
          visibility: "public",
          inviteCode: "CODE5678",
          curatorId: "user-456",
          sector: "Finance",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    vi.mocked(db.query.memberships.findMany).mockResolvedValue(
      mockMemberships as never
    );

    const result = await getUserGroups("user-123");

    expect(result.success).toBe(true);
    expect(result.groups).toBeDefined();
    expect(result.groups).toHaveLength(2);
  });
});

describe("getGroupById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when groupId is not provided", async () => {
    const result = await getGroupById("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group ID is required");
  });

  it("should return group with member count", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "A test group",
      visibility: "private",
      inviteCode: "CODE1234",
      curatorId: "user-123",
      sector: "Tech",
      createdAt: new Date(),
      updatedAt: new Date(),
      memberships: [
        { id: "m1", userId: "user-1", role: "curator" },
        { id: "m2", userId: "user-2", role: "member" },
        { id: "m3", userId: "user-3", role: "member" },
      ],
      curator: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);

    const result = await getGroupById("group-123");

    expect(result.success).toBe(true);
    expect(result.group).toBeDefined();
    expect(result.memberCount).toBe(3);
  });

  it("should return error when group is not found", async () => {
    vi.mocked(db.query.groups.findFirst).mockResolvedValue(null as never);

    const result = await getGroupById("nonexistent-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group not found");
  });
});

describe("updateGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when groupId is not provided", async () => {
    const result = await updateGroup("", "user-123", { name: "New Name" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group ID is required");
  });

  it("should return error when curatorId is not provided", async () => {
    const result = await updateGroup("group-123", "", { name: "New Name" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Curator ID is required");
  });

  it("should return error when user is not the curator", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      curatorId: "user-456", // Different user
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);

    const result = await updateGroup("group-123", "user-123", {
      name: "New Name",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only the curator can update this group");
  });

  it("should update group when user is curator", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      description: "Old description",
      curatorId: "user-123",
      visibility: "private",
      inviteCode: "CODE1234",
      sector: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedGroup = {
      ...mockGroup,
      name: "New Name",
      description: "New description",
      updatedAt: new Date(),
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedGroup]),
        }),
      }),
    } as never);

    const result = await updateGroup("group-123", "user-123", {
      name: "New Name",
      description: "New description",
    });

    expect(result.success).toBe(true);
    expect(result.group?.name).toBe("New Name");
  });
});

describe("deleteGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when groupId is not provided", async () => {
    const result = await deleteGroup("", "user-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Group ID is required");
  });

  it("should return error when curatorId is not provided", async () => {
    const result = await deleteGroup("group-123", "");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Curator ID is required");
  });

  it("should return error when user is not the curator", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      curatorId: "user-456", // Different user
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);

    const result = await deleteGroup("group-123", "user-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only the curator can delete this group");
  });

  it("should delete group when user is curator", async () => {
    const mockGroup = {
      id: "group-123",
      name: "Test Group",
      curatorId: "user-123",
    };

    vi.mocked(db.query.groups.findFirst).mockResolvedValue(mockGroup as never);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    const result = await deleteGroup("group-123", "user-123");

    expect(result.success).toBe(true);
  });
});
