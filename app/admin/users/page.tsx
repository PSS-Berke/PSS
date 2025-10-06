'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Pencil, Trash2, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
  id?: number;
  email: string;
  name?: string;
  role?: boolean;
  admin?: boolean;
  company?: string;
  company_id?: number;
  invite_accepted?: boolean;
  created_at?: string;
}

interface GetUsersResponse {
  users?: AdminUser[];
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const isAdmin = user?.role === true || (user as any)?.admin === true;
    console.log('Admin page access check:', { user, isAdmin, role: user?.role, admin: (user as any)?.admin });
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch users
  const fetchUsers = async (search = '') => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build URL with search query parameter if provided
      const url = search 
        ? `https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf/get_users?search_term=${encodeURIComponent(search)}`
        : 'https://xnpm-iauo-ef2d.n7e.xano.io/api:iChl_6jf/get_users';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist (404), show a helpful message
        if (response.status === 404) {
          setError('The get_users API endpoint has not been created yet in Xano. Please create this endpoint or contact your administrator.');
          setUsers([]);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle both array response and object with users property
      const usersArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersArray);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = user?.role === true || (user as any)?.admin === true;
    if (isAdmin && token) {
      fetchUsers();
    }
  }, [user, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    // TODO: Implement update API call
    console.log('Update user:', selectedUser);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    // Refresh users list
    fetchUsers(searchTerm);
  };

  const handleSendInvite = async () => {
    if (!newUserEmail || !newUserName) {
      setError('Please enter both name and email');
      return;
    }

    setIsSendingInvite(true);
    setError(null);

    try {
      // TODO: Implement invite API call
      console.log('Sending invite to:', { name: newUserName, email: newUserEmail });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close dialog and reset form
      setIsAddUserDialogOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      
      // Refresh users list
      fetchUsers(searchTerm);
    } catch (err) {
      console.error('Failed to send invite:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleConfirmDelete = async () => {
    // TODO: Implement delete API call
    console.log('Delete user:', selectedUser);
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Show loading state while checking auth
  if (authLoading || !user) {
    return (
      <main className="w-full h-full">
        <div className="w-full p-6 space-y-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  // Only render if user is admin
  const isAdmin = user.role === true || (user as any).admin === true;
  if (!isAdmin) {
    return null;
  }

  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="mt-2 text-muted-foreground">
              Manage all users in the system
            </p>
          </div>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              All registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div
                    key={user.id || user.email || index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {(user.role || user.admin) && (
                          <Badge variant="default">Admin</Badge>
                        )}
                        {user.invite_accepted === false && (
                          <Badge variant="secondary">Pending Invite</Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {user.created_at && (
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        )}
                        {!user.created_at && user.invite_accepted !== undefined && (
                          <span>Status: {user.invite_accepted ? 'Active' : 'Invited'}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name || ''}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-admin"
                      checked={selectedUser.admin || selectedUser.role || false}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, admin: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-admin" className="cursor-pointer font-normal">
                      Admin privileges
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Admins can manage users and access admin features</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.name || 'No name'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an email invitation to add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Name</Label>
                <Input
                  id="new-user-name"
                  placeholder="Enter user's full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="Enter user's email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Email Invitation</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    An invitation email will be sent to this address with instructions to set up their account.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddUserDialogOpen(false);
                  setNewUserName('');
                  setNewUserEmail('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvite}
                disabled={isSendingInvite || !newUserName || !newUserEmail}
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
