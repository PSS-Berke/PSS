'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLinkedIn } from '@/lib/xano/linkedin-context';
import { linkedInApi } from '@/lib/xano/api';
import { useAuth } from '@/lib/xano/auth-context';
import {
  Plus,
  MessageSquare,
  Loader2,
  MoreVertical,
  Link2,
  Settings,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import type { CreateCampaignParams, LinkedInSession } from '@/lib/xano/types';

interface CampaignSidebarProps {
  className?: string;
  // If provided, controls collapsed state externally. If omitted, component is uncontrolled.
  isCollapsed?: boolean;
  // Notified when collapsed state changes (either via user toggle or programmatic)
  onCollapseChange?: (collapsed: boolean) => void;
}
type CampaignListItem = {
  linkedin_campaigns_id: number | null;
  name: string;
  sessions: LinkedInSession[];
  additional_notes?: string;
  marketing_type?: string;
  post_length?: number;
  tone?: string;
  created_at?: number | string;
  target_audience?: string;
};

type CampaignEditFormState = {
  name: string;
  additional_notes: string;
  marketing_type: string;
  post_length: number;
  tone: string;
  target_audience: string;
};

interface CategorizedChats {
  chats: {
    heading: string;
    records: LinkedInSession[];
  };
  campaigns: {
    heading: string;
    records: CampaignListItem[];
  };
}

// Helper function to generate random session ID
const generateSessionId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 15;
  
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const randomValues = new Uint8Array(length);
    globalThis.crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (value) => characters.charAt(value % characters.length)).join('');
  }

  let result = '';
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

export function CampaignSidebar({ className, isCollapsed: propIsCollapsed, onCollapseChange }: CampaignSidebarProps) {
  const { token } = useAuth();
  const {
    state,
    createCampaign,
    changeChat,
    deleteChat,
    editChatName,
    initiateSession,
    loadPages,
    submitCampaignUpdate,
    fetchCampaignDetails,
  } = useLinkedIn();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CreateCampaignParams>({
    name: '',
    additional_notes: '',
    tone: '',
    content_length: 300,
    marketing_type: '',
    target_audience: '',
  });
  const [categorizedData, setCategorizedData] = useState<CategorizedChats | null>(null);
  const [sessionPendingDeletion, setSessionPendingDeletion] = useState<LinkedInSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [sessionBeingEdited, setSessionBeingEdited] = useState<number | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [menuOpenForSession, setMenuOpenForSession] = useState<number | null>(null);
  const [campaignIdForNewChat, setCampaignIdForNewChat] = useState<number | null>(null);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [isStartingStandaloneChat, setIsStartingStandaloneChat] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignListItem | null>(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignFormState, setCampaignFormState] = useState<CampaignEditFormState>({
    name: '',
    additional_notes: '',
    marketing_type: '',
    post_length: 0,
    tone: '',
    target_audience: '',
  });
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [isCampaignDetailsLoading, setIsCampaignDetailsLoading] = useState(false);
  const [campaignDetailError, setCampaignDetailError] = useState<string | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);

  useEffect(() => {
    if (!categorizedData || !state.currentSession?.linkedin_campaigns_id) {
      return;
    }

    const campaignEntry = categorizedData.campaigns.records.find(
      (item) => item.linkedin_campaigns_id === state.currentSession?.linkedin_campaigns_id
    );

    if (!campaignEntry || campaignEntry.linkedin_campaigns_id === null) {
      return;
    }

    fetchCampaignDetails(campaignEntry.linkedin_campaigns_id).catch((error) => {
      console.error('Failed to refresh campaign details', error);
    });
  }, [categorizedData, state.currentSession?.linkedin_campaigns_id, fetchCampaignDetails]);

  const resetCampaignFormState = () => {
    setCampaignFormState({
      name: '',
      additional_notes: '',
      marketing_type: '',
      post_length: 0,
      tone: '',
      target_audience: '',
    });
  };

  const openCampaignModal = async (campaign: CampaignListItem) => {
    setSelectedCampaign(campaign);
    setCampaignFormState({
      name: campaign.name || '',
      additional_notes: campaign.additional_notes || '',
      marketing_type: campaign.marketing_type || '',
     tone: campaign.tone || '',
     post_length: campaign.post_length || 0,
     target_audience: campaign.target_audience || '',
    });

    setCampaignModalOpen(true);
    setIsCampaignDetailsLoading(true);
    setCampaignDetailError(null);

    if (campaign.linkedin_campaigns_id === null) {
      setCampaignDetailError('Invalid campaign ID');
      setIsCampaignDetailsLoading(false);
      return;
    }

    try {
      const details = await fetchCampaignDetails(campaign.linkedin_campaigns_id);

      const resolvedName = details?.name ?? campaign.name ?? '';
      const resolvedNotes = details?.additional_notes ?? campaign.additional_notes ?? '';
      const resolvedMarketing = details?.marketing_type ?? campaign.marketing_type ?? '';
      const resolvedTone = details?.tone ?? campaign.tone ?? '';
      const resolvedAudience = details?.target_audience ?? campaign.target_audience ?? '';
      const resolvedPostLengthRaw =
        details?.post_length ?? campaign.post_length ?? null;
      const resolvedPostLength =
        typeof resolvedPostLengthRaw === 'string'
          ? parseInt(resolvedPostLengthRaw, 10) || 0
          : typeof resolvedPostLengthRaw === 'number'
            ? resolvedPostLengthRaw
            : 0;

      setCampaignFormState({
        name: resolvedName,
        additional_notes: resolvedNotes,
        marketing_type: resolvedMarketing,
        tone: resolvedTone,
        post_length: resolvedPostLength,
        target_audience: resolvedAudience,
      });

      if (details) {
        setSelectedCampaign(prev =>
          prev
            ? {
                ...prev,
                name: resolvedName,
                additional_notes: resolvedNotes,
                marketing_type: resolvedMarketing,
                tone: resolvedTone,
                post_length: resolvedPostLength,
                target_audience: resolvedAudience,
                created_at: details.created_at ?? prev.created_at,
              }
            : prev
        );
      }
    } catch (error) {
      console.error('Failed to fetch campaign details', error);
      setCampaignDetailError('Unable to load campaign details. Please try again.');
      setCampaignFormState({
        name: campaign.name || '',
        additional_notes: campaign.additional_notes || '',
        marketing_type: campaign.marketing_type || '',
        tone: campaign.tone || '',
        post_length: campaign.post_length || 0,
        target_audience: campaign.target_audience || '',
      });
    } finally {
      setIsCampaignDetailsLoading(false);
    }
  };

  const closeCampaignModal = () => {
    if (isSavingCampaign) return;
    setCampaignModalOpen(false);
    setSelectedCampaign(null);
    resetCampaignFormState();
    setCampaignDetailError(null);
  };

  const mapCampaignRecord = (item: any): CampaignListItem => {
    const toNumberOrUndefined = (value: unknown) => {
      const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return {
      linkedin_campaigns_id: item.linkedin_campaigns_id,
      name: item.name,
      sessions: Array.isArray(item.sessions) ? item.sessions : [],
      additional_notes: item.additional_notes ?? '',
      marketing_type: item.marketing_type ?? '',
      post_length: toNumberOrUndefined(item.post_length),
      tone: item.tone ?? '',
      created_at: item.created_at,
      target_audience: item.target_audience ?? '',
    };
  };

  // Function to categorize data from get_chats API
  const categorizeChatsData = (data: any): CategorizedChats => {
    // Check if data is already structured (Format 2 from API docs)
    if (data.chats && data.campaigns) {
      return {
        chats: {
          heading: 'Chats',
          records: data.chats.records || [],
        },
        campaigns: {
          heading: 'Campaigns',
          records: (data.campaigns.records || []).map((item: any) =>
            mapCampaignRecord({
              ...item,
              sessions: item.sessions ?? item.records ?? [],
            })
          ),
        },
      };
    }

    // Handle array format (Format 1 from API docs)
    const chats: LinkedInSession[] = [];
    const campaigns: CampaignListItem[] = [];

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
          campaigns.push(
            mapCampaignRecord({
              ...item,
              sessions: sessionRecords,
            })
          );
        }
      }
    });

    return {
      chats: {
        heading: 'Chats',
        records: chats,
      },
      campaigns: {
        heading: 'Campaigns',
        records: campaigns,
      },
    };
  };

  // Update categorized data when pages change
  React.useEffect(() => {
    if (state.pages.length > 0) {
      const categorized = categorizeChatsData(state.pages);
      setCategorizedData(categorized);
    } else {
      setCategorizedData(null);
    }
  }, [state.pages]);

  const handleStartNewSession = async () => {
    if (isStartingStandaloneChat || !token) return;

    try {
      setIsStartingStandaloneChat(true);
      
      // Only call the API with the required parameters
      await linkedInApi.initiateSession(token, {
        session_id: generateSessionId(),
        linkedin_campaigns_id: null,
      });
      
      // Fetch chats after adding the new session
      await loadPages();
    } catch (error) {
      console.error('Failed to start new session', error);
    } finally {
      setIsStartingStandaloneChat(false);
    }
  };

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
        target_audience: '',
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

  const startEditingSession = (session: LinkedInSession) => {
    setSessionBeingEdited(session.id);
    setEditedName(session.session_name ?? '');
  };

  const stopEditingSession = async () => {
    if (!sessionBeingEdited) {
      return;
    }

    const targetSession = findSessionById(sessionBeingEdited);
    const trimmedName = editedName.trim();

    setSessionBeingEdited(null);

    if (!targetSession || !trimmedName || trimmedName === targetSession.session_name) {
      return;
    }

    try {
      setIsUpdatingName(true);
      await editChatName(sessionBeingEdited, trimmedName);
    } catch (error) {
      console.error('Failed to update chat name', error);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleEditBlur = async () => {
    await stopEditingSession();
  };

  const handleEditKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await stopEditingSession();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setSessionBeingEdited(null);
      setEditedName('');
    }
  };

  const handleDeleteSession = (session: LinkedInSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionPendingDeletion(session);
  };

  const handleMenuToggle = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForSession((prev) => (prev === sessionId ? null : sessionId));
  };

  const handleEditOption = (session: LinkedInSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForSession(null);
    startEditingSession(session);
  };

  const handleDeleteOption = (session: LinkedInSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenForSession(null);
    handleDeleteSession(session, e);
  };

  const findSessionById = (id: number): LinkedInSession | null => {
    if (!categorizedData) return null;

    const chat = categorizedData.chats.records.find((session) => session.id === id);
    if (chat) return chat;

    for (const campaign of categorizedData.campaigns.records) {
      const session = campaign.sessions.find((item) => item.id === id);
      if (session) return session;
    }

    return null;
  };

  const closeDeleteDialog = () => {
    if (!isDeletingSession) {
      setSessionPendingDeletion(null);
    }
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionPendingDeletion) return;

    try {
      setIsDeletingSession(true);
      await deleteChat(sessionPendingDeletion.session_id);
      setSessionPendingDeletion(null);
    } catch (error) {
      console.error('Failed to delete session', error);
    } finally {
      setIsDeletingSession(false);
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

  const handleAddChatClick = async (campaignId: number) => {
    if (isAddingChat) return;

    setCampaignIdForNewChat(campaignId);

    try {
      setIsAddingChat(true);

      const newSession = await initiateSession(campaignId);
      if (newSession) {
        await loadPages();
      }
    } catch (error) {
      console.error('Failed to add chat to campaign', error);
    } finally {
      setIsAddingChat(false);
      setCampaignIdForNewChat(null);
    }
  };

  const handleCampaignEditChange = <Key extends keyof CampaignEditFormState>(key: Key, value: CampaignEditFormState[Key]) => {
    setCampaignFormState(prev => ({
      ...prev,
      [key]: key === 'post_length' ? Number(value) || 0 : value,
    }));
  };

  const handleSaveCampaign = async () => {
    if (!selectedCampaign || selectedCampaign.linkedin_campaigns_id === null) return;

    const payload = {
      campaign_id: selectedCampaign.linkedin_campaigns_id,
      name: campaignFormState.name,
      additional_notes: campaignFormState.additional_notes,
      marketing_type: campaignFormState.marketing_type,
      post_length: campaignFormState.post_length,
      tone: campaignFormState.tone,
      target_audience: campaignFormState.target_audience,
    };

    setIsSavingCampaign(true);

    try {
      await submitCampaignUpdate(payload);
      setCampaignModalOpen(false);
      setSelectedCampaign(null);
      resetCampaignFormState();
    } catch (error) {
      console.error('Failed to update campaign', error);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const toggleCampaignExpanded = (campaignId: number) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  // determine if component is controlled by parent via prop
  const isControlled = typeof propIsCollapsed !== 'undefined';
  const isCollapsed = isControlled ? (propIsCollapsed as boolean) : internalCollapsed;

  const setCollapsed = (value: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(value);
    }
    try {
      if (typeof onCollapseChange === 'function') onCollapseChange(value);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-14' : 'w-80'} border-r bg-muted/30 flex flex-col h-full transition-all duration-300 ${className}`}>
      {/* Collapsed Toggle Button */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-4">
          <Button
            onClick={() => setCollapsed(false)}
            size="sm"
            className="bg-black hover:bg-black/80 text-white h-10 w-10 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b flex-shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Chats</h3>
            <div className="flex items-center gap-1">
              <Button
                onClick={handleStartNewSession}
                size="sm"
                disabled={isStartingStandaloneChat || state.isSwitchingSession}
              >
                {isStartingStandaloneChat || state.isSwitchingSession ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => setCollapsed(true)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Campaigns</h3>
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
        </div>
      )}

      {/* Chats and Campaigns List */}
      {!isCollapsed && (
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
                  <div
                    className="font-semibold text-sm text-foreground border-b pb-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors flex items-center justify-between"
                    onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                  >
                    <div className="flex items-center gap-1">
                      {isChatsExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h3>{categorizedData.chats.heading}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({categorizedData.chats.records.length})
                    </span>
                  </div>
                  {isChatsExpanded && (
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
                              {sessionBeingEdited === session.id ? (
                                <Input
                                  autoFocus
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  onBlur={handleEditBlur}
                                  onKeyDown={handleEditKeyDown}
                                  disabled={isUpdatingName}
                                  className="h-7 px-2 py-0 text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              ) : (
                                <p className="text-sm font-medium truncate">
                                  {session.session_name}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDate(session.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {state.currentSession?.id === session.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => handleMenuToggle(session.id, e)}
                                aria-label="Open chat actions"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                              {menuOpenForSession === session.id && (
                                <div className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background shadow-md">
                                  <button
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                    onClick={(e) => handleEditOption(session, e)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleDeleteOption(session, e)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  )}
                </div>
              )}
              {/* Campaigns Section */}
              {categorizedData.campaigns.records.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground border-b pb-2">
                    {categorizedData.campaigns.heading}
                  </h3>
                  <div className="space-y-4">
                    {categorizedData.campaigns.records.map((campaign) => {
                      if (campaign.linkedin_campaigns_id === null) return null;
                      const isExpanded = expandedCampaigns.has(campaign.linkedin_campaigns_id);
                      return (
                        <div key={campaign.linkedin_campaigns_id} className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div 
                              className="flex items-start gap-1 flex-1 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                              onClick={() => toggleCampaignExpanded(campaign.linkedin_campaigns_id as number)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              )}
                              <h4 className="font-medium text-sm text-foreground break-words flex-1 min-w-0">
                                {campaign.name}
                              </h4>
                              <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                                ({campaign.sessions.length})
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={() => openCampaignModal(campaign)}
                                aria-label={`Manage campaign ${campaign.name}`}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleAddChatClick(campaign.linkedin_campaigns_id as number)}
                                disabled={isAddingChat && campaignIdForNewChat === campaign.linkedin_campaigns_id}
                              >
                                {isAddingChat && campaignIdForNewChat === campaign.linkedin_campaigns_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Link2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="space-y-1 ml-2 pl-3 border-l-2 border-muted">
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
                                        {sessionBeingEdited === session.id ? (
                                          <Input
                                            autoFocus
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            onBlur={handleEditBlur}
                                            onKeyDown={handleEditKeyDown}
                                            disabled={isUpdatingName}
                                            className="h-7 px-2 py-0 text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                          />
                                        ) : (
                                          <p className="text-sm font-medium truncate">
                                            {session.session_name}
                                          </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(session.created_at)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      {state.currentSession?.id === session.id && (
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                      )}
                                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => handleMenuToggle(session.id, e)}
                                          aria-label="Open chat actions"
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                        {menuOpenForSession === session.id && (
                                          <div className="absolute right-0 top-7 z-20 w-32 rounded-md border border-border bg-background shadow-md">
                                            <button
                                              type="button"
                                              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                              onClick={(e) => handleEditOption(session, e)}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              type="button"
                                              className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                              onClick={(e) => handleDeleteOption(session, e)}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              )}

      {/* Create Campaign Dialog */}
      {!isCollapsed && (
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
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                value={campaignForm.target_audience}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="Who is this campaign for?"
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
      )}

      {!isCollapsed && (
        <Dialog
        open={campaignModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCampaignModal();
          }
        }}
        >
        <DialogContent className="w-[80vw] max-w-[560px] max-h-[80vh] space-y-4 rounded-2xl border border-border/60 bg-background px-6 py-5 overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>Manage Campaign</DialogTitle>
            <DialogDescription>
              View and update campaign details, or delete the campaign.
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign ? (
            <div className="space-y-6">
              {isCampaignDetailsLoading && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading campaign details...
                </div>
              )}

              {campaignDetailError && !isCampaignDetailsLoading && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {campaignDetailError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs uppercase text-muted-foreground">Campaign ID</p>
                  <p className="text-sm font-medium text-foreground">{selectedCampaign.linkedin_campaigns_id}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs uppercase text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedCampaign.created_at ? formatDate(selectedCampaign.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="campaign-name">
                    Campaign Name
                  </label>
                  <Input
                    id="campaign-name"
                    value={campaignFormState.name}
                    onChange={(event) => handleCampaignEditChange('name', event.target.value)}
                    placeholder="Campaign name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="campaign-tone">
                      Tone
                    </label>
                    <Input
                      id="campaign-tone"
                      value={campaignFormState.tone}
                      onChange={(event) => handleCampaignEditChange('tone', event.target.value)}
                      placeholder="e.g., professional, casual, friendly"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="campaign-post-length">
                      Post Length
                    </label>
                    <Input
                      id="campaign-post-length"
                      type="number"
                      value={Number.isFinite(campaignFormState.post_length) ? campaignFormState.post_length : ''}
                      onChange={(event) => handleCampaignEditChange('post_length', Number(event.target.value) || 0)}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="campaign-marketing-type">
                      Marketing Type
                    </label>
                    <Input
                      id="campaign-marketing-type"
                      value={campaignFormState.marketing_type}
                      onChange={(event) => handleCampaignEditChange('marketing_type', event.target.value)}
                      placeholder="e.g., product_announcement, promotional"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="campaign-target-audience">
                      Target Audience
                    </label>
                    <Input
                      id="campaign-target-audience"
                      value={campaignFormState.target_audience}
                      onChange={(event) => handleCampaignEditChange('target_audience', event.target.value)}
                      placeholder="Who is this campaign for?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="campaign-notes">
                    Additional Notes
                  </label>
                  <Textarea
                    id="campaign-notes"
                    value={campaignFormState.additional_notes}
                    onChange={(event) => handleCampaignEditChange('additional_notes', event.target.value)}
                    placeholder="Add any additional context or instructions for this campaign"
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              <DialogFooter className="sm:justify-between sm:items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive flex items-center gap-2"
                  onClick={() => console.log('Campaign delete requested')}
                  disabled={isSavingCampaign || isCampaignDetailsLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Campaign
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCampaignModal}
                    disabled={isSavingCampaign || isCampaignDetailsLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveCampaign}
                    disabled={
                      isSavingCampaign ||
                      isCampaignDetailsLoading ||
                      !campaignFormState.name.trim()
                    }
                    className="flex items-center gap-2"
                  >
                    {isSavingCampaign ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No campaign selected.</p>
          )}
        </DialogContent>
        </Dialog>
      )}

      {!isCollapsed && (
        <Dialog
        open={!!sessionPendingDeletion}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        >
        <DialogContent className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-background px-6 py-5">
          <DialogHeader className="space-y-2">
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The conversation
              {sessionPendingDeletion?.session_name ? ` "${sessionPendingDeletion.session_name}"` : ''} will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this chat? All generated content and history associated with this conversation will be lost.
          </p>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeletingSession}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteSession}
              disabled={isDeletingSession}
            >
              {isDeletingSession ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
