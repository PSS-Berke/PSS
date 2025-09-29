'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  ChevronRight, 
  Loader2,
  Settings,
  X
} from 'lucide-react';
import type { CreateCampaignParams, LinkedInSession } from '@/lib/xano/types';

interface CampaignSidebarProps {
  className?: string;
}

// Types for the new get_chats response format
interface CategorizedChats {
  chats: {
    heading: string;
    records: LinkedInSession[];
  };
  campaigns: {
    heading: string;
    records: Array<{
      linkedin_campaigns_id: number;
      name: string;
      sessions: LinkedInSession[];
    }>;
  };
}

export function CampaignSidebar({ className }: CampaignSidebarProps) {
  const { state, createCampaign, changeChat, deleteChat, loadPages } = useLinkedIn();
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CreateCampaignParams>({
    name: '',
    additional_notes: '',
    tone: '',
    content_length: 300,
    marketing_type: '',
  });
  const [categorizedData, setCategorizedData] = useState<CategorizedChats | null>(null);

  // Function to categorize data from get_chats API
  const categorizeChatsData = (data: any): CategorizedChats => {
    // Check if data is already structured (Format 2 from API docs)
    if (data.chats && data.campaigns) {
      return {
        chats: {
          heading: "Chats",
          records: data.chats.records || []
        },
        campaigns: {
          heading: "Campaigns", 
          records: data.campaigns.records || []
        }
      };
    }

    // Handle array format (Format 1 from API docs)
    const chats: LinkedInSession[] = [];
    const campaigns: Array<{
      linkedin_campaigns_id: number;
      name: string;
      sessions: LinkedInSession[];
    }> = [];

    data.forEach((item: any) => {
      if (item.linkedin_campaigns_id === null) {
        // This is a standalone chat - parse the records if needed
        let chatRecords = item.records;
        if (typeof chatRecords === 'string') {
          try {
            chatRecords = JSON.parse(chatRecords);
          } catch (error) {
            console.error('Failed to parse chat records JSON:', error);
            chatRecords = [];
          }
        }
        if (Array.isArray(chatRecords)) {
          chats.push(...chatRecords);
        }
      } else {
        // This is a campaign - parse the records if needed and structure properly
        let sessionRecords = item.records;
        if (typeof sessionRecords === 'string') {
          try {
            sessionRecords = JSON.parse(sessionRecords);
          } catch (error) {
            console.error('Failed to parse session records JSON:', error);
            sessionRecords = [];
          }
        }
        if (Array.isArray(sessionRecords)) {
          campaigns.push({
            linkedin_campaigns_id: item.linkedin_campaigns_id,
            name: item.name,
            sessions: sessionRecords
          });
        }
      }
    });

    return {
      chats: {
        heading: "Chats",
        records: chats
      },
      campaigns: {
        heading: "Campaigns",
        records: campaigns
      }
    };
  };

  // Update categorized data when pages change
  React.useEffect(() => {
    if (state.pages.length > 0) {
      const categorized = categorizeChatsData(state.pages);
      setCategorizedData(categorized);
    }
  }, [state.pages]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name?.trim()) return;

    try {
      await createCampaign(campaignForm);
      setCampaignForm({
        name: '',
        additional_notes: '',
        tone: '',
        content_length: 300,
        marketing_type: '',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    if (state.currentSession?.session_id === sessionId) return;
    console.log('CampaignSidebar: Switching to session:', sessionId);
    await changeChat(sessionId);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      await deleteChat(sessionId);
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`w-80 border-r bg-muted/30 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            disabled={state.isCreatingCampaign}
          >
            {state.isCreatingCampaign ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {state.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading campaigns...
          </div>
        )}
      </div>

      {/* Chats and Campaigns List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {!categorizedData && !state.isLoading ? (
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chats or campaigns yet</p>
            <p className="text-xs">Create your first campaign to get started</p>
          </div>
        ) : (
          categorizedData && (
            <>
              {/* Standalone Chats Section */}
              {categorizedData.chats.records.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                    {categorizedData.chats.heading}
                  </h3>
                  <div className="space-y-1">
                    {categorizedData.chats.records.map((session) => (
                      <Card
                        key={session.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                          state.currentSession?.id === session.id
                            ? 'bg-accent border-primary'
                            : ''
                        }`}
                        onClick={() => handleSessionClick(session.session_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {session.session_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(session.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {state.currentSession?.id === session.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => handleDeleteSession(session.session_id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaigns Section */}
              {categorizedData.campaigns.records.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                    {categorizedData.campaigns.heading}
                  </h3>
                  <div className="space-y-4">
                    {categorizedData.campaigns.records.map((campaign) => (
                      <div key={campaign.linkedin_campaigns_id} className="space-y-2">
                        <h4 className="font-medium text-sm text-foreground">
                          {campaign.name}
                        </h4>
                        
                        <div className="space-y-1">
                          {campaign.sessions.map((session) => (
                            <Card
                              key={session.id}
                              className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                                state.currentSession?.id === session.id
                                  ? 'bg-accent border-primary'
                                  : ''
                              }`}
                              onClick={() => handleSessionClick(session.session_id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {session.session_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(session.created_at)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {state.currentSession?.id === session.id && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => handleDeleteSession(session.session_id, e)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when no data */}
              {categorizedData.chats.records.length === 0 && categorizedData.campaigns.records.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats or campaigns yet</p>
                  <p className="text-xs">Create your first campaign to get started</p>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="w-[80vw] max-w-[560px] max-h-[80vh] space-y-4 rounded-2xl border border-border/60 bg-background px-6 py-5 overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Enter the campaign details to start generating LinkedIn content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Name *</label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Q4 Product Launch"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Input
                value={campaignForm.tone}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, tone: e.target.value }))}
                placeholder="e.g., professional, casual, friendly"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content Length</label>
              <Input
                type="number"
                value={campaignForm.content_length}
                onChange={(e) => setCampaignForm(prev => ({ 
                  ...prev, 
                  content_length: parseInt(e.target.value) || 300 
                }))}
                placeholder="300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Marketing Type</label>
              <Input
                value={campaignForm.marketing_type}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, marketing_type: e.target.value }))}
                placeholder="e.g., product_announcement, promotional"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                value={campaignForm.additional_notes}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder="Any specific requirements or context..."
                className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!campaignForm.name?.trim() || state.isCreatingCampaign}
                className="flex-1"
              >
                {state.isCreatingCampaign ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
