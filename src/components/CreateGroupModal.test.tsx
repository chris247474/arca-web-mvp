import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CreateGroupModal } from "./CreateGroupModal";

// Mock useAuth hook
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRefreshProfile = vi.fn();
let mockAuthState = {
  isAuthenticated: true,
  isLoading: false,
  user: { id: "user-123", privyId: "privy-123", name: "Test User", email: "test@example.com", role: "curator" as const, linkedinUrl: null, bio: null, createdAt: new Date(), updatedAt: new Date() },
  privyUser: null,
  login: mockLogin,
  logout: mockLogout,
  refreshProfile: mockRefreshProfile,
  hasRole: true,
  isCurator: true,
  isInvestor: false,
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockAuthState,
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock createGroup server action
const mockCreateGroup = vi.fn();
vi.mock("@/lib/actions/groups", () => ({
  createGroup: (...args: unknown[]) => mockCreateGroup(...args),
}));

describe("CreateGroupModal", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default authenticated state
    mockAuthState = {
      isAuthenticated: true,
      isLoading: false,
      user: { id: "user-123", privyId: "privy-123", name: "Test User", email: "test@example.com", role: "curator" as const, linkedinUrl: null, bio: null, createdAt: new Date(), updatedAt: new Date() },
      privyUser: null,
      login: mockLogin,
      logout: mockLogout,
      refreshProfile: mockRefreshProfile,
      hasRole: true,
      isCurator: true,
      isInvestor: false,
    };
  });

  it("should render the create group form", () => {
    render(<CreateGroupModal {...defaultProps} />);

    expect(screen.getByText("Create New Group")).toBeInTheDocument();
    expect(screen.getByTestId("input-group-name")).toBeInTheDocument();
    expect(screen.getByTestId("input-group-description")).toBeInTheDocument();
    expect(screen.getByTestId("button-create-group")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    render(<CreateGroupModal {...defaultProps} />);

    const submitButton = screen.getByTestId("button-create-group");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Group name is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
  });

  it("should successfully create a group when authenticated with profile loaded", async () => {
    mockCreateGroup.mockResolvedValue({ success: true, group: { id: "group-1", name: "Test Group" } });

    render(<CreateGroupModal {...defaultProps} />);

    const nameInput = screen.getByTestId("input-group-name");
    const descInput = screen.getByTestId("input-group-description");
    const submitButton = screen.getByTestId("button-create-group");

    fireEvent.change(nameInput, { target: { value: "Test Group" } });
    fireEvent.change(descInput, { target: { value: "A test group description" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: "Test Group",
        description: "A test group description",
        curatorId: "user-123",
        sector: undefined,
        visibility: "private",
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Group created",
        })
      );
    });
  });

  // BUG: This test verifies the fix - when authenticated but profile not yet loaded,
  // should attempt to refresh profile instead of showing "must be signed in" error
  it("should attempt to refresh profile when authenticated but user.id is missing", async () => {
    // Simulate the race condition: authenticated but profile not yet loaded
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      isLoading: false,
      user: null,
    };

    // refreshProfile resolves and sets the profile
    mockRefreshProfile.mockResolvedValue(undefined);
    mockCreateGroup.mockResolvedValue({ success: true, group: { id: "group-1", name: "Test Group" } });

    render(<CreateGroupModal {...defaultProps} />);

    const nameInput = screen.getByTestId("input-group-name");
    const descInput = screen.getByTestId("input-group-description");
    const submitButton = screen.getByTestId("button-create-group");

    fireEvent.change(nameInput, { target: { value: "Test Group" } });
    fireEvent.change(descInput, { target: { value: "A test group description" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRefreshProfile).toHaveBeenCalled();
    });

    // Should NOT show the misleading "must be signed in" error
    expect(mockToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        description: "You must be signed in to create a group",
      })
    );
  });

  it("should show profile loading error when refresh fails and profile still missing", async () => {
    // Simulate: authenticated but profile permanently unavailable
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      isLoading: false,
      user: null,
    };

    mockRefreshProfile.mockResolvedValue(undefined);

    render(<CreateGroupModal {...defaultProps} />);

    const nameInput = screen.getByTestId("input-group-name");
    const descInput = screen.getByTestId("input-group-description");
    const submitButton = screen.getByTestId("button-create-group");

    fireEvent.change(nameInput, { target: { value: "Test Group" } });
    fireEvent.change(descInput, { target: { value: "A test group description" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining("Unable to load your profile"),
          variant: "destructive",
        })
      );
    });
  });

  it("should show sign in error when not authenticated at all", async () => {
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    };

    render(<CreateGroupModal {...defaultProps} />);

    const nameInput = screen.getByTestId("input-group-name");
    const descInput = screen.getByTestId("input-group-description");
    const submitButton = screen.getByTestId("button-create-group");

    fireEvent.change(nameInput, { target: { value: "Test Group" } });
    fireEvent.change(descInput, { target: { value: "A test group description" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "You must be signed in to create a group",
          variant: "destructive",
        })
      );
    });
  });

  it("should disable submit button when auth is loading", () => {
    mockAuthState = {
      ...mockAuthState,
      isLoading: true,
      user: null,
    };

    render(<CreateGroupModal {...defaultProps} />);

    const submitButton = screen.getByTestId("button-create-group");
    expect(submitButton).toBeDisabled();
  });
});
