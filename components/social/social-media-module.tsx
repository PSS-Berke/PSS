
'use client';

const defaultContentType: SocialPost['content_type'] = 'linkedin';

import React, { useCallback, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RefreshCw,
  Tag,
  Timer,
} from 'lucide-react';
import { addDays, endOfDay, format, isToday, isWithinInterval } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocialMedia } from '@/lib/xano/social-media-context';
import type { SocialPost, SocialPostPayload } from '@/lib/xano/types';
import { Textarea } from '@/components/ui/textarea';
import { SocialMediaCalendar } from './social-media-calendar';

type TabKey = 'calendar' | 'tasks';

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'tasks', label: 'Tasks' },
];

const CONTENT_COLORS: Record<SocialPost['content_type'], string> = {
  linkedin: 'bg-[#0077B5] text-white',
  instagram: 'bg-[#E4405F] text-white',
  tiktok: 'bg-black text-white',
  all: 'bg-[#C33527] text-white',
};

const DEFAULT_CONTENT_TYPE: SocialPost['content_type'] = 'linkedin';

const formatDateTimeLocal = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

export function SocialMediaModule({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('calendar');
  const { state, refreshPosts, togglePublish, updatePost, deletePost, createPost } =
    useSocialMedia();
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<SocialPost>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const activeFormData = React.useMemo<Partial<SocialPost>>(() => {
    if (isCreating) {
      return {
        post_title: formState.post_title ?? '',
        post_description: formState.post_description ?? '',
        rich_content_text: formState.rich_content_text ?? '',
        content: formState.content ?? '',
        rich_content_html: formState.rich_content_html ?? '',
        url_1: formState.url_1 ?? '',
        url_2: formState.url_2 ?? '',
        content_type: formState.content_type ?? DEFAULT_CONTENT_TYPE,
        scheduled_date: formState.scheduled_date ?? formatDateTimeLocal(new Date()),
        published: formState.published ?? false,
      } satisfies Partial<SocialPost>;
    }

    if (selectedPost) {
      return { ...selectedPost, ...formState } as Partial<SocialPost>;
    }

    return formState;
  }, [formState, isCreating, selectedPost]);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const handleReschedulePost = useCallback(
    async (postId: number, nextDate: string) => {
      const targetPost = state.posts.find((post) => post.id === postId);
      if (!targetPost) {
        throw new Error('Post not found');
      }

      const nextPublishDate = new Date(nextDate).toISOString();

      const contentValue = targetPost.content ?? targetPost.rich_content_text ?? '';

      await updatePost(postId, {
        post_title: targetPost.post_title,
        post_description: targetPost.post_description ?? '',
        rich_content_text: targetPost.rich_content_text ?? contentValue,
        content: contentValue,
        rich_content_html: targetPost.rich_content_html ?? '',
        url_1: targetPost.url_1 ?? '',
        url_2: targetPost.url_2 ?? '',
        content_type: targetPost.content_type,
        scheduled_date: nextPublishDate,
        published: targetPost.published,
      });

      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                scheduled_date: nextPublishDate,
              }
            : prev
        );
        setFormState((prev) => ({ ...prev, scheduled_date: nextPublishDate }));
      }
    },
    [state.posts, updatePost, selectedPost]
  );

  const upcomingSevenDays = useMemo(() => {
    const now = new Date();
    const intervalEnd = endOfDay(addDays(now, 7));
    return state.posts.filter((post) => {
      const scheduled = new Date(post.scheduled_date);
      return isWithinInterval(scheduled, { start: now, end: intervalEnd });
    });
  }, [state.posts]);

  const todaysPosts = useMemo(() => {
    return state.posts.filter((post) => isToday(new Date(post.scheduled_date)));
  }, [state.posts]);

  const nextScheduledPost = useMemo(() => {
    return state.posts
      .slice()
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime()
      )[0];
  }, [state.posts]);

  const isMutatingSelected = selectedPost ? state.mutatingPostIds.includes(selectedPost.id) : false;

  React.useEffect(() => {
    if (!isModalOpen) {
      setSelectedPost(null);
      setIsEditing(false);
      setFormState({});
      setIsCreating(false);
      setFormError(null);
    }
  }, [isModalOpen]);

  const getStatusBadge = () => {
    if (state.isLoading) {
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading
        </Badge>
      );
    }

    if (state.posts.length === 0) {
      return <Badge variant="secondary">No posts scheduled</Badge>;
    }

    const upcomingCount = upcomingSevenDays.length;
    return (
      <Badge variant="outline">
        {upcomingCount} scheduled in next 7 days
      </Badge>
    );
  };

const renderTabButton = (
  tab: (typeof TAB_CONFIG)[number],
  activeTab: TabKey,
  setActiveTab: (key: TabKey) => void
) => (
    <button
      key={tab.key}
      type="button"
      className={cn(
        'relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C33527]',
        activeTab === tab.key
          ? 'bg-[#C33527] text-white shadow'
          : 'bg-transparent text-muted-foreground hover:text-foreground'
      )}
      onClick={() => setActiveTab(tab.key)}
    >
      {tab.label}
    </button>
  );

  const handleOpenPost = (post: SocialPost) => {
    setSelectedPost(post);
    setFormState(post);
    setIsEditing(false);
    setIsCreating(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleStartCreate = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    const now = new Date();
    setFormState({
      post_title: '',
      post_description: '',
      rich_content_text: '',
      content: '',
      rich_content_html: '',
      url_1: '',
      url_2: '',
      content_type: DEFAULT_CONTENT_TYPE,
      scheduled_date: formatDateTimeLocal(now),
      published: false,
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPost(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving || isDeleting) return;
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
      setIsEditing(false);
      setFormState({});
      setIsCreating(false);
      setFormError(null);
    }, 150);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    if (!selectedPost) return;
    setFormState(selectedPost);
    setIsEditing(false);
    setFormError(null);
  };

  const handleChange = (field: keyof SocialPost, value: string | boolean) => {
    setFormError(null);
    setFormState((prev) => {
      const nextState = { ...prev, [field]: value };
      if (field === 'rich_content_text' && typeof value === 'string') {
        nextState.content = value;
      }
      if (field === 'content' && typeof value === 'string') {
        nextState.rich_content_text = value;
      }
      return nextState;
    });
  };

  const parseScheduledDate = (value?: string) => {
    if (!value) return null;
    // If the value is already an ISO string, new Date handles it as UTC
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const handleSave = async () => {
    if (!selectedPost) return;
    const isoScheduledDate = parseScheduledDate(formState.scheduled_date);
    if (!isoScheduledDate) {
      setFormError('Please provide a valid scheduled date.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedContent = formState.content ?? formState.rich_content_text ?? selectedPost.content ?? selectedPost.rich_content_text ?? '';
      await updatePost(selectedPost.id, {
        post_title: formState.post_title ?? selectedPost.post_title,
        post_description: formState.post_description ?? selectedPost.post_description ?? '',
        rich_content_text:
          formState.rich_content_text ?? selectedPost.rich_content_text ?? updatedContent,
        content: updatedContent,
        rich_content_html: formState.rich_content_html ?? selectedPost.rich_content_html ?? '',
        url_1: formState.url_1 ?? selectedPost.url_1 ?? '',
        url_2: formState.url_2 ?? selectedPost.url_2 ?? '',
        content_type: formState.content_type ?? selectedPost.content_type,
        scheduled_date: isoScheduledDate,
        published: formState.published ?? selectedPost.published,
      });
      setIsEditing(false);
      setFormError(null);
      const resolvedContent =
        formState.content ?? formState.rich_content_text ?? selectedPost.content ?? selectedPost.rich_content_text ?? '';
      const updatedPost: SocialPost = {
        ...selectedPost,
        post_title: formState.post_title ?? selectedPost.post_title,
        post_description: formState.post_description ?? selectedPost.post_description,
        rich_content_text: formState.rich_content_text ?? selectedPost.rich_content_text ?? resolvedContent,
        content: resolvedContent,
        rich_content_html: formState.rich_content_html ?? selectedPost.rich_content_html,
        url_1: formState.url_1 ?? selectedPost.url_1,
        url_2: formState.url_2 ?? selectedPost.url_2,
        content_type: formState.content_type ?? selectedPost.content_type,
        scheduled_date: isoScheduledDate,
        published: formState.published ?? selectedPost.published,
      };
      setSelectedPost(updatedPost);
      setFormState(updatedPost);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const trimmedTitle = formState.post_title?.trim() ?? '';
    const isoScheduledDate = parseScheduledDate(formState.scheduled_date);
    if (!trimmedTitle || !isoScheduledDate) {
      setFormError('Please provide a title and valid scheduled date.');
      return;
    }

    const contentType = formState.content_type ?? DEFAULT_CONTENT_TYPE;

    setIsSaving(true);
    setFormError(null);
    try {
      const contentValue =
        formState.content?.trim() ?? formState.rich_content_text?.trim() ?? formState.post_description?.trim() ?? '';

      const payload = {
        post_title: trimmedTitle,
        post_description: formState.post_description?.trim() ?? '',
        rich_content_text: formState.rich_content_text?.trim() ?? contentValue,
        content: contentValue,
        rich_content_html: formState.rich_content_html?.trim() ?? '',
        url_1: formState.url_1?.trim() ?? '',
        url_2: formState.url_2?.trim() ?? '',
        content_type: contentType,
        scheduled_date: isoScheduledDate,
        published: formState.published ?? false,
      } as const satisfies SocialPostPayload;

      const created = await createPost(payload);

      if (created) {
        setIsModalOpen(false);
        setIsCreating(false);
        setFormState({});
        setFormError(null);
        await refreshPosts();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id);
      handleCloseModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!selectedPost) return;
    const nextStatus = !selectedPost.published;
    await togglePublish(selectedPost.id, nextStatus);
    setSelectedPost((prev) => (prev ? { ...prev, published: nextStatus } : prev));
    setFormState((prev) => ({ ...prev, published: nextStatus }));
  };

  const renderPostSummary = (post: SocialPost) => {
    const scheduledDate = new Date(post.scheduled_date);
    const isMutating = state.mutatingPostIds.includes(post.id);

    return (
      <div
        key={post.id}
        className={cn(
          'flex flex-col gap-3 rounded-lg border border-border/70 bg-background/80 p-4 transition-colors',
          'hover:border-[#C33527]'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex flex-1 flex-col gap-1 cursor-pointer"
            onClick={() => handleOpenPost(post)}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize',
                  CONTENT_COLORS[post.content_type]
                )}
              >
                {post.content_type}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(scheduledDate, 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            <p className="truncate text-sm font-medium text-foreground">
              {post.post_title}
            </p>
            {post.post_description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {post.post_description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant={post.published ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 rounded-full border-0 px-3 text-xs font-semibold',
                post.published ? 'bg-[#C33527] hover:bg-[#DA857C]' : ''
              )}
              onClick={() => togglePublish(post.id, !post.published)}
              disabled={isMutating}
            >
              {isMutating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : post.published ? (
                'Published'
              ) : (
                'Publish'
              )}
            </Button>
            <div className="text-xs text-muted-foreground">
              Updated {format(new Date(post.updated_at), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
        {post.rich_content_text ? (
          <div className="rounded-md border border-dashed border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
            {post.rich_content_text.slice(0, 240)}
            {post.rich_content_text.length > 240 ? '…' : ''}
          </div>
        ) : null}
      </div>
    );
  };

  const renderCalendarTab = () => {
    if (state.posts.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No scheduled posts yet. Create a post to populate your social media calendar.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border/80 bg-background/80 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[#C33527]" />
            <h3 className="text-sm font-semibold text-foreground">Content calendar</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
              {state.posts.length}
            </Badge>
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-[#C33527] hover:bg-[#DA857C]"
              onClick={handleStartCreate}
            >
              <Plus className="h-4 w-4" />
              Add Post
            </Button>
          </div>
        </div>

        <SocialMediaCalendar
          posts={state.posts}
          onSelectPost={handleOpenPost}
          onReschedulePost={handleReschedulePost}
        />
      </div>
    );
  };

  const renderTasksTab = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-background/80 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#C33527]" />
              <h3 className="text-sm font-semibold text-foreground">Today</h3>
            </div>
            <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
              {todaysPosts.length}
            </Badge>
          </div>

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-2">
            {todaysPosts.length > 0 ? (
              todaysPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="text-left"
                  onClick={() => handleOpenPost(post)}
                >
                  {renderPostSummary(post)}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No posts scheduled for today.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/80 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#C33527]" />
              <h3 className="text-sm font-semibold text-foreground">All posts</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
                {state.posts.length}
              </Badge>
              <Button
                variant="default"
                size="sm"
                className="gap-1 bg-[#C33527] hover:bg-[#DA857C]"
                onClick={handleStartCreate}
              >
                <Plus className="h-4 w-4" />
                Add Post
              </Button>
            </div>
          </div>

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-2">
            {state.posts.length > 0 ? (
              state.posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  className="text-left"
                  onClick={() => handleOpenPost(post)}
                >
                  {renderPostSummary(post)}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No scheduled posts yet.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const scheduledInputValue = React.useMemo(() => {
    const rawValue = formState.scheduled_date ?? selectedPost?.scheduled_date;
    if (!rawValue) return '';

    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  }, [formState.scheduled_date, selectedPost]);

  const isFormEditable = isEditing || isCreating;

  return (
    <Card
      className={cn(
        'w-full flex flex-col',
        isExpanded ? 'min-h-[80vh]' : 'max-h-[80vh]',
        className
      )}
    >
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#C33527]/15 p-2">
              <Calendar className="h-5 w-5 text-[#C33527]" />
            </div>
            <div>
              <CardTitle className="text-lg">Social Media Copilot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Plan and manage social content across platforms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {state.lastFetchedAt ? (
              <span className="text-xs text-muted-foreground">
                Updated {format(new Date(state.lastFetchedAt), 'MMM d, h:mm a')}
              </span>
            ) : null}
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-[#C33527] hover:bg-[#DA857C]"
              onClick={(event) => {
                event.stopPropagation();
                handleStartCreate();
              }}
            >
              <Plus className="h-4 w-4" />
              Add Post
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={(event) => {
                event.stopPropagation();
                refreshPosts();
              }}
              disabled={state.isRefreshing}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 text-muted-foreground',
                  state.isRefreshing ? 'animate-spin text-[#C33527]' : ''
                )}
              />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background/90 p-1">
              {TAB_CONFIG.map((tab) => renderTabButton(tab, activeTab, setActiveTab))}
            </div>
            {state.error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            ) : null}
          </div>

          <div className="min-h-[400px] space-y-4 overflow-y-auto pr-2">
            {state.isLoading && state.posts.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading posts…
                </div>
              </div>
            ) : activeTab === 'calendar' ? (
              renderCalendarTab()
            ) : (
              renderTasksTab()
            )}
          </div>
        </CardContent>
      ) : null}

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl space-y-6 rounded-2xl border border-border/60 bg-background px-6 py-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Post' : isCreating ? 'Create Post' : 'Post Details'}</DialogTitle>
            <DialogDescription>
              {isCreating
                ? 'Fill out the details below to schedule a new social media post.'
                : 'Review and manage the selected post.'}
            </DialogDescription>
          </DialogHeader>

          {selectedPost || isCreating ? (
            <div className="space-y-6">
              {formError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              ) : null}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="post_title">Post Title</Label>
                  {isFormEditable ? (
                    <Input
                      id="post_title"
                      value={activeFormData.post_title ?? ''}
                      onChange={(event) => handleChange('post_title', event.target.value)}
                      required
                    />
                  ) : (
                    <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                      {selectedPost?.post_title || '—'}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="post_description">Post Description</Label>
                  {isFormEditable ? (
                    <Textarea
                      id="post_description"
                      value={activeFormData.post_description ?? ''}
                      onChange={(event) => handleChange('post_description', event.target.value)}
                      rows={3}
                    />
                  ) : (
                    <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                      {selectedPost?.post_description || '—'}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rich_content_text">Post Content</Label>
                  {isFormEditable ? (
                    <Textarea
                      id="rich_content_text"
                      value={activeFormData.rich_content_text ?? ''}
                      onChange={(event) => handleChange('rich_content_text', event.target.value)}
                      rows={6}
                    />
                  ) : (
                    <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-foreground">
                      {selectedPost?.rich_content_text || '—'}
                    </div>
                  )}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="url_1">URL 1</Label>
                    {isFormEditable ? (
                      <Input
                        id="url_1"
                        value={activeFormData.url_1 ?? ''}
                        onChange={(event) => handleChange('url_1', event.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                        {selectedPost?.url_1 || '—'}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url_2">URL 2</Label>
                    {isFormEditable ? (
                      <Input
                        id="url_2"
                        value={activeFormData.url_2 ?? ''}
                        onChange={(event) => handleChange('url_2', event.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                        {selectedPost?.url_2 || '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="content_type">Content Type</Label>
                    {isFormEditable ? (
                      <Input
                        id="content_type"
                        value={activeFormData.content_type ?? DEFAULT_CONTENT_TYPE}
                        onChange={(event) => handleChange('content_type', event.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm capitalize text-foreground">
                        {selectedPost?.content_type || '—'}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                    {isFormEditable ? (
                      <Input
                        id="scheduled_date"
                        type="datetime-local"
                        value={scheduledInputValue}
                        onChange={(event) => handleChange('scheduled_date', event.target.value)}
                      />
                    ) : (
                      <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                        {selectedPost
                          ? format(new Date(selectedPost.scheduled_date), 'MMM d, yyyy • h:mm a')
                          : '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={selectedPost?.published ? 'default' : 'outline'}
                      className={selectedPost?.published ? 'bg-[#C33527]' : ''}
                    >
                      {selectedPost?.published ? 'Published' : 'Draft'}
                    </Badge>
                    {!isFormEditable && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePublishToggle}
                        disabled={isMutatingSelected}
                      >
                        {selectedPost?.published ? 'Unpublish' : 'Publish'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:space-x-3">
            <div className="flex flex-1 flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving…' : 'Save'}
                    </Button>
                  </>
                ) : isCreating ? (
                  <>
                    <Button variant="outline" onClick={handleCloseModal} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isSaving}>
                      {isSaving ? 'Creating…' : 'Create'}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleCloseModal}>
                    Close
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {!isFormEditable && selectedPost ? (
                  <Button variant="secondary" onClick={handleEdit}>
                    Edit
                  </Button>
                ) : null}
                {selectedPost ? (
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isCreating}>
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </Button>
                ) : null}
                {!isFormEditable && selectedPost ? (
                  <Button onClick={handlePublishToggle} disabled={isMutatingSelected}>
                    {selectedPost?.published ? 'Unpublish' : 'Publish'}
                  </Button>
                ) : null}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

