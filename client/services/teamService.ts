import { supabase } from "@/lib/supabase";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Pending" | "Inactive";
  joinedAt: string;
  lastActive: string | null;
  avatar?: string;
  permissions: string[];
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamMember["role"];
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
}

class TeamService {
  async getTeamMembers(teamId?: string): Promise<TeamMember[]> {
    try {
      // For now, we'll return mock data that looks more realistic
      // In a real app, this would fetch from the database
      const mockMembers: TeamMember[] = [
        {
          id: "1",
          email: "owner@company.com",
          name: "Team Owner",
          firstName: "Team",
          lastName: "Owner",
          role: "Owner",
          status: "Active",
          joinedAt: new Date(
            Date.now() - 180 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 6 months ago
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          permissions: ["all"],
        },
        {
          id: "2",
          email: "admin@company.com",
          name: "Sarah Johnson",
          firstName: "Sarah",
          lastName: "Johnson",
          role: "Admin",
          status: "Active",
          joinedAt: new Date(
            Date.now() - 90 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 3 months ago
          lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          permissions: ["manage_users", "manage_settings", "view_analytics"],
        },
        {
          id: "3",
          email: "member@company.com",
          name: "Mike Chen",
          firstName: "Mike",
          lastName: "Chen",
          role: "Member",
          status: "Active",
          joinedAt: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 45 days ago
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          permissions: ["create_content", "view_content"],
        },
      ];

      return mockMembers;
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      return [];
    }
  }

  async inviteTeamMember(
    email: string,
    role: TeamMember["role"],
  ): Promise<TeamInvitation> {
    try {
      // In a real app, this would send an invitation email and store in database
      const invitation: TeamInvitation = {
        id: Date.now().toString(),
        email,
        role,
        invitedBy: "current-user-id",
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: "Pending",
      };

      // Store in localStorage for demo purposes
      const existingInvitations = localStorage.getItem("teamInvitations");
      const invitations = existingInvitations
        ? JSON.parse(existingInvitations)
        : [];
      invitations.push(invitation);
      localStorage.setItem("teamInvitations", JSON.stringify(invitations));

      return invitation;
    } catch (error) {
      console.error("Failed to invite team member:", error);
      throw error;
    }
  }

  async removeTeamMember(memberId: string): Promise<void> {
    try {
      // In a real app, this would remove from database
      console.log("Removing team member:", memberId);
      // For demo purposes, we'll just log this action
    } catch (error) {
      console.error("Failed to remove team member:", error);
      throw error;
    }
  }

  async updateTeamMemberRole(
    memberId: string,
    newRole: TeamMember["role"],
  ): Promise<void> {
    try {
      // In a real app, this would update the database
      console.log("Updating team member role:", memberId, newRole);
      // For demo purposes, we'll just log this action
    } catch (error) {
      console.error("Failed to update team member role:", error);
      throw error;
    }
  }

  async getPendingInvitations(): Promise<TeamInvitation[]> {
    try {
      const existingInvitations = localStorage.getItem("teamInvitations");
      const invitations = existingInvitations
        ? JSON.parse(existingInvitations)
        : [];

      // Filter out expired invitations
      const validInvitations = invitations.filter((inv: TeamInvitation) => {
        const expiresAt = new Date(inv.expiresAt);
        return expiresAt > new Date() && inv.status === "Pending";
      });

      return validInvitations;
    } catch (error) {
      console.error("Failed to get pending invitations:", error);
      return [];
    }
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const existingInvitations = localStorage.getItem("teamInvitations");
      const invitations = existingInvitations
        ? JSON.parse(existingInvitations)
        : [];

      const updatedInvitations = invitations.filter(
        (inv: TeamInvitation) => inv.id !== invitationId,
      );
      localStorage.setItem(
        "teamInvitations",
        JSON.stringify(updatedInvitations),
      );
    } catch (error) {
      console.error("Failed to cancel invitation:", error);
      throw error;
    }
  }

  getRolePermissions(role: TeamMember["role"]): string[] {
    const permissions = {
      Owner: ["all"],
      Admin: [
        "manage_users",
        "manage_settings",
        "view_analytics",
        "create_content",
        "view_content",
      ],
      Member: ["create_content", "view_content"],
      Viewer: ["view_content"],
    };

    return permissions[role] || [];
  }

  getRoleColor(role: TeamMember["role"]): string {
    const colors = {
      Owner:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Member:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return colors[role] || colors.Viewer;
  }

  getStatusColor(status: TeamMember["status"]): string {
    const colors = {
      Active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return colors[status] || colors.Inactive;
  }
}

export const teamService = new TeamService();
