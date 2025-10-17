'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/xano/auth-context';
import { companyApi } from '@/lib/xano/api';
import type { Company } from '@/lib/xano/types';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Trash2, Loader2, Pencil } from 'lucide-react';

export default function CompanyManagementPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === true || (user as any)?.admin === true;

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isAdmin, router]);

  // Fetch companies
  const fetchCompanies = React.useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await companyApi.getCompanies(token);
      setCompanies(data);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      // Handle 404 as empty list (endpoint might not exist yet)
      if (err.status === 404) {
        // Fallback to user's available_companies if API endpoint doesn't exist
        if (user?.available_companies && user.available_companies.length > 0) {
          setCompanies(user.available_companies);
          setError(
            'Using companies from your user profile. The full admin API endpoint is not yet created in Xano.',
          );
        } else {
          setError(
            'The companies API endpoint has not been created yet in Xano. Please create this endpoint or contact your administrator.',
          );
          setCompanies([]);
        }
      } else {
        setError(err.message || 'Failed to fetch companies');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (isAdmin && token) {
      fetchCompanies();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAdmin, token, authLoading, fetchCompanies]);

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!token) return;

    setIsCreating(true);
    setError(null);

    try {
      await companyApi.createCompany(token, {
        name: newCompanyName.trim(),
        company_code: undefined,
      });
      setIsAddCompanyDialogOpen(false);
      setNewCompanyName('');
      fetchCompanies();
    } catch (err: any) {
      console.error('Failed to create company:', err);
      setError(err.message || 'Failed to create company');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setEditCompanyName(company.company_name);
    setIsEditDialogOpen(true);
    setError(null);
  };

  const handleConfirmEdit = async () => {
    if (!editCompanyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!selectedCompany || !token) return;

    setIsEditing(true);
    setError(null);

    try {
      await companyApi.updateCompany(token, selectedCompany.company_id, editCompanyName.trim());
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setEditCompanyName('');
      fetchCompanies();
    } catch (err: any) {
      console.error('Failed to update company:', err);
      setError(err.message || 'Failed to update company');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCompany || !token) return;

    setIsDeleting(true);
    setError(null);

    try {
      await companyApi.deleteCompany(token, selectedCompany.company_id);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Failed to delete company:', err);
      setError(err.message || 'Failed to delete company');
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="w-full h-full">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#C33527]/15 p-2">
              <Building2 className="h-5 w-5 text-[#C33527]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Company Management</h1>
              <p className="mt-2 text-muted-foreground">Manage all companies in the system</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddCompanyDialogOpen(true)}
            className="bg-[#C33527] hover:bg-[#DA857C] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-[#C33527]/40 bg-[#C33527]/10">
            <CardContent className="pt-6">
              <p className="text-[#C33527]">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Companies List */}
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Companies ({companies.length})</CardTitle>
                <CardDescription>All companies registered in the system</CardDescription>
              </div>
              <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
                {companies.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-[#C33527]" />
              </div>
            ) : companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Building2 className="h-12 w-12 mb-3 opacity-50" />
                <p>No companies found</p>
                <p className="text-sm mt-1">Add your first company to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.company_id}
                    className="flex items-center justify-between p-4 border border-border/70 bg-background/80 rounded-lg hover:border-[#C33527] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-[#C33527]/10 p-2">
                        <Building2 className="h-4 w-4 text-[#C33527]" />
                      </div>
                      <div>
                        <p className="font-medium">{company.company_name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company)}
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

        {/* Add Company Dialog */}
        <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Create a new company in the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="rounded-md border border-[#C33527]/40 bg-[#C33527]/10 px-3 py-2 text-sm text-[#C33527]">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter company name"
                  value={newCompanyName}
                  onChange={(e) => {
                    setNewCompanyName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating) {
                      handleAddCompany();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddCompanyDialogOpen(false);
                  setNewCompanyName('');
                  setError(null);
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCompany}
                disabled={isCreating || !newCompanyName.trim()}
                className="bg-[#C33527] hover:bg-[#DA857C] text-white disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Company Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
              <DialogDescription>Update the company name</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="rounded-md border border-[#C33527]/40 bg-[#C33527]/10 px-3 py-2 text-sm text-[#C33527]">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-company-name">Company Name</Label>
                <Input
                  id="edit-company-name"
                  placeholder="Enter company name"
                  value={editCompanyName}
                  onChange={(e) => {
                    setEditCompanyName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isEditing) {
                      handleConfirmEdit();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCompany(null);
                  setEditCompanyName('');
                  setError(null);
                }}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={isEditing || !editCompanyName.trim()}
                className="bg-[#C33527] hover:bg-[#DA857C] text-white disabled:opacity-50"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Company Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Company</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this company? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="rounded-md border border-[#C33527]/40 bg-[#C33527]/10 px-3 py-2 text-sm text-[#C33527]">
                {error}
              </div>
            )}
            {selectedCompany && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedCompany.company_name}</p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedCompany(null);
                  setError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-[#C33527] hover:bg-[#DA857C] text-white disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Company'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
