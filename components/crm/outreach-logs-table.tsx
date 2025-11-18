'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, Mail, Phone as PhoneIcon, Video, Linkedin } from 'lucide-react';
import { CrmOutreachLog } from '@/@types/crm';
import { useCrm } from '@/lib/xano/crm-context';
import { EditOutreachLogDialog } from './edit-outreach-log-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OutreachLogsTableProps {
  logs: CrmOutreachLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function OutreachLogsTable({ logs, isLoading, onRefresh }: OutreachLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLog, setEditingLog] = useState<CrmOutreachLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<CrmOutreachLog | null>(null);
  const { deleteOutreachLog } = useCrm();

  const filteredLogs = logs.filter((log) => {
    const search = searchQuery.toLowerCase();
    return (
      log.name?.toLowerCase().includes(search) ||
      log.company?.toLowerCase().includes(search) ||
      log.subject.toLowerCase().includes(search) ||
      log.notes.toLowerCase().includes(search)
    );
  });

  const handleDelete = async () => {
    if (!deletingLog) return;
    try {
      await deleteOutreachLog(deletingLog.id);
      onRefresh();
      setDeletingLog(null);
    } catch (error) {
      console.error('Failed to delete outreach log:', error);
    }
  };

  const getOutreachTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <PhoneIcon className="h-4 w-4" />;
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'connected':
        return 'bg-green-500';
      case 'no_answer':
        return 'bg-yellow-500';
      case 'left_voicemail':
        return 'bg-blue-500';
      case 'scheduled_followup':
        return 'bg-purple-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatOutcome = (outcome: string) => {
    return outcome.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading outreach logs...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by contact, company, subject, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery
                      ? 'No outreach logs found matching your search.'
                      : 'No outreach logs yet. Add your first log entry!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOutreachTypeIcon(log.outreach_type)}
                        <span className="capitalize">{log.outreach_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.name || 'Unknown'}</span>
                        <span className="text-sm text-muted-foreground">{log.company || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{log.subject}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.direction === 'outbound' ? 'default' : 'secondary'}>
                        {log.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(log.time)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getOutcomeColor(log.outcome)}>
                        {formatOutcome(log.outcome)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingLog(log)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingLog(log)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Outreach Log Dialog */}
      {editingLog && (
        <EditOutreachLogDialog
          open={!!editingLog}
          onClose={() => setEditingLog(null)}
          log={editingLog}
          onSuccess={() => {
            onRefresh();
            setEditingLog(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLog} onOpenChange={() => setDeletingLog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outreach Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this outreach log entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

