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
  Linkedin,
  Instagram,
  CalendarCheck,
  Twitter,
  Youtube,
  Pin,
  Clock,
  Send,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { addDays, endOfDay, format, isToday, isWithinInterval } from 'date-fns';
import { Notification } from '../ui/Notification';
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
import { useAuth } from '@/lib/xano/auth-context';
import type { SocialPost, SocialPostPayload } from '@/lib/xano/types';
import { Textarea } from '@/components/ui/textarea';
import { SocialMediaCalendar } from './social-media-calendar';
import { UnicodeTextFormatter } from '@/components/ui/unicode-text-formatter';
import { useSearchParams } from 'next/navigation';
import { socialCopilotApi } from '@/lib/xano/api';
import toast from '../ui/toast';

type TabKey = 'calendar' | 'tasks';

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'tasks', label: 'Tasks' },
];

const CONTENT_COLORS: Record<SocialPost['content_type'], string> = {
  linkedin: 'bg-[#0077B5] text-white',
  instagram: 'bg-[#E4405F] text-white',
  tiktok: 'bg-black text-white',
  all: 'bg-[#C33527] text-white border-2 border-white',
  x: 'bg-black text-white',
  pinterest: 'bg-[#E60023] text-white',
  snapchat: 'bg-[#FFFC00] text-black',
  'youtube-video': 'bg-[#FF0000] text-white',
  'youtube-short': 'bg-[#FF0000] text-white',
};

const DEFAULT_CONTENT_TYPE: SocialPost['content_type'] = 'linkedin';

const getPlatformIcon = (contentType: SocialPost['content_type'], size: 'sm' | 'md' = 'sm') => {
  const iconProps = { className: size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5' };
  switch (contentType) {
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'tiktok':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'x':
      return <Twitter {...iconProps} />;
    case 'pinterest':
      return <Pin {...iconProps} />;
    case 'snapchat':
      return (
        <svg {...iconProps} viewBox="0 0 128 128" fill="currentColor">
          <path d="M95.918 22.002c-11.963-.087-24.145 4.54-32.031 13.717-6.995 7.405-9.636 17.901-9.284 27.868-.03 5.119.032 10.237.05 15.355-4.901-1.217-9.873-4.624-15.063-2.937-4.422 1.313-6.267 7.088-3.596 10.791 2.876 3.761 7.346 5.907 11.08 8.71 1.837 1.5 4.313 2.571 5.68 4.499-.001 4.62-2.425 8.897-4.722 12.786-5.597 8.802-14.342 15.531-23.705 20.18-2.39 1.035-4.59 4.144-2.473 6.499 3.862 3.622 9.327 4.778 14.195 6.486 2.047.64 5.078 1.34 4.886 4.084.335 2.923 2.205 6.066 5.492 6.078 7.873.91 16.289.522 23.345 4.741 6.917 4.006 14.037 8.473 22.255 8.96 8.188.767 16.623-.888 23.642-5.255 5.23-2.884 10.328-6.477 16.456-7.061 5.155-1.206 10.702-.151 15.685-2.072 3.193-1.367 2.762-5.244 4.104-7.808 2.532-1.747 5.77-1.948 8.59-3.102 3.687-1.47 8.335-2.599 10.268-6.413 1.148-3.038-2.312-4.698-4.453-5.88-11.38-5.874-21.631-14.921-26.121-27.191-.496-1.936-2.279-4.834.084-6.255 4.953-4.176 11.413-6.575 15.514-11.715 3.103-3.884.941-10.55-4.141-11.322-4.928-.78-9.525 1.893-14.152 3.127-.404-8.53.502-17.232-.776-25.746-2.429-13.808-13.514-25.157-26.813-29.124-4.521-1.401-9.266-2.037-13.996-2Z" />
        </svg>
      );
    case 'youtube-video':
      return <Youtube {...iconProps} />;
    case 'youtube-short':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 5.5L10 18.5L17 12L10 5.5Z" />
          <rect
            x="6"
            y="4"
            width="12"
            height="16"
            rx="2"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'all':
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

const formatDateTimeLocal = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

export function SocialMediaModule({
  className,
  onExpandedChange,
}: {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('calendar');
  const {
    state,
    refreshPosts,
    getPost,
    togglePublish,
    updateStatus,
    updatePost,
    deletePost,
    createPost,
  } = useSocialMedia();
  const { token, user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<SocialPost>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isScheduleChoiceModalOpen, setIsScheduleChoiceModalOpen] = useState(false);
  const [isPlatformSelectionModalOpen, setIsPlatformSelectionModalOpen] = useState(false);
  const [pendingPublishState, setPendingPublishState] = useState<boolean>(false);
  const [isPublishConfirmModalOpen, setIsPublishConfirmModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const activeFormData = React.useMemo<Partial<SocialPost>>(() => {
    if (isCreating) {
      return {
        post_title: formState.post_title ?? '',
        post_description: formState.post_description ?? '',
        rich_content_text: formState.rich_content_text ?? '',
        content: formState.content ?? '',
        rich_content_html: '',
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

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const newExpandedState = !prev;
      onExpandedChange?.(newExpandedState);
      return newExpandedState;
    });
  };

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
            : prev,
        );
        setFormState((prev) => ({ ...prev, scheduled_date: nextPublishDate }));
      }
    },
    [state.posts, updatePost, selectedPost],
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
        (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime(),
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
      setAttachedFile(null);
      setFileError(null);
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
    return <Badge variant="outline">{upcomingCount} scheduled in next 7 days</Badge>;
  };

  const renderTabButton = (
    tab: (typeof TAB_CONFIG)[number],
    activeTab: TabKey,
    setActiveTab: (key: TabKey) => void,
  ) => (
    <button
      key={tab.key}
      type="button"
      className={cn(
        'relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C33527]',
        activeTab === tab.key
          ? 'bg-[#C33527] text-white shadow'
          : 'bg-transparent text-muted-foreground hover:text-foreground',
      )}
      onClick={() => setActiveTab(tab.key)}
    >
      {tab.label}
    </button>
  );

  const handleOpenPost = async (post: SocialPost) => {
    // Fetch the latest data from the backend
    const freshPost = await getPost(post.id);

    if (freshPost) {
      setSelectedPost(freshPost);
      setFormState(freshPost);
    } else {
      // Fallback to the provided post if fetch fails
      setSelectedPost(post);
      setFormState(post);
    }

    setIsEditing(false);
    setIsCreating(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleStartCreate = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setIsScheduleChoiceModalOpen(true);
  };

  const handleScheduleChoice = (postNow: boolean) => {
    setPendingPublishState(postNow);
    setIsScheduleChoiceModalOpen(false);
    setIsPlatformSelectionModalOpen(true);
  };

  const handlePlatformSelection = (platform: SocialPost['content_type']) => {
    const now = new Date();
    setFormState({
      post_title: '',
      post_description: '',
      rich_content_text: '',
      content: '',
      rich_content_html: '',
      url_1: '',
      url_2: '',
      content_type: platform,
      scheduled_date: formatDateTimeLocal(now),
      published: pendingPublishState,
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPost(null);
    setFormError(null);
    setIsPlatformSelectionModalOpen(false);
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
      setAttachedFile(null);
      setFileError(null);
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

  const htmlToPlainTextWithNewlines = (html: string): string => {
    if (!html) return '';

    let text = html;

    // Step 1: Replace block-level closing tags with newlines
    // Each of these represents a line break or paragraph end
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/h[1-6]>/gi, '\n');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<\/tr>/gi, '\n');
    text = text.replace(/<\/td>/gi, '\t');
    text = text.replace(/<\/th>/gi, '\t');
    text = text.replace(/<\/blockquote>/gi, '\n');

    // Step 2: Replace self-closing and inline break tags
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

    // Step 3: Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Step 4: Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&#x27;/g, "'");
    text = text.replace(/&apos;/g, "'");

    // Step 5: Clean up whitespace
    // Remove leading/trailing spaces from each line
    text = text
      .split('\n')
      .map((line) => line.trim())
      .join('\n');

    // Replace multiple consecutive newlines with maximum 2
    text = text.replace(/\n{3,}/g, '\n\n');

    // Remove leading/trailing newlines from entire text
    text = text.trim();

    console.log('HTML->Text conversion:');
    console.log('Input HTML:', html);
    console.log('Output text (raw):', text);
    console.log('Output text (JSON):', JSON.stringify(text));

    return text;
  };

  // Custom trim that preserves newlines - only removes leading/trailing spaces and tabs
  const trimPreserveNewlines = (str: string): string => {
    if (!str) return str;
    // Remove leading/trailing spaces and tabs, but keep newlines
    return str.replace(/^[ \t]+|[ \t]+$/gm, '');
  };

  const handleChange = (field: keyof SocialPost, value: string | boolean) => {
    setFormError(null);
    setFormState((prev) => {
      const nextState = { ...prev, [field]: value };
      // Sync content and rich_content_text fields (both store the same plain text with Unicode formatting)
      if (field === 'content' && typeof value === 'string') {
        nextState.rich_content_text = value;
      }
      if (field === 'rich_content_text' && typeof value === 'string') {
        nextState.content = value;
      }
      return nextState;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAttachedFile(null);
      setFileError(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please select a valid image file (PNG, JPG, GIF, or WEBP)');
      setAttachedFile(null);
      return;
    }

    // Validate file size
    const maxSize = file.type === 'image/gif' ? 15 * 1024 * 1024 : 5 * 1024 * 1024; // 15MB for GIF, 5MB for others
    if (file.size > maxSize) {
      const maxSizeMB = file.type === 'image/gif' ? 15 : 5;
      setFileError(`File size must be less than ${maxSizeMB}MB`);
      setAttachedFile(null);
      return;
    }

    setAttachedFile(file);
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFileError(null);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getImageNameFromBase64 = (base64String: string | null | undefined): string => {
    if (!base64String) return 'image.png';

    // Extract MIME type from data URI (e.g., "data:image/png;base64,...")
    const match = base64String.match(/^data:image\/([a-zA-Z]+);base64,/);
    if (match && match[1]) {
      const extension = match[1].toLowerCase();
      return `image.${extension}`;
    }

    return 'image.png';
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
      const updatedContent =
        formState.content ??
        formState.rich_content_text ??
        selectedPost.content ??
        selectedPost.rich_content_text ??
        '';

      // Convert attached file to base64 if exists
      let imageBase64: string | null = null;
      if (attachedFile) {
        try {
          imageBase64 = await convertFileToBase64(attachedFile);
        } catch (error) {
          console.error('Failed to convert image to base64:', error);
          setFormError('Failed to process image. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      await updatePost(selectedPost.id, {
        post_title: formState.post_title ?? selectedPost.post_title,
        post_description:
          'post_description' in formState
            ? (formState.post_description ?? '')
            : (selectedPost.post_description ?? ''),
        rich_content_text: updatedContent,
        content: updatedContent,
        rich_content_html: '',
        url_1: formState.url_1 ?? selectedPost.url_1 ?? '',
        url_2: formState.url_2 ?? selectedPost.url_2 ?? '',
        image: imageBase64,
        content_type: formState.content_type ?? selectedPost.content_type,
        scheduled_date: isoScheduledDate as string,
        published: formState.published ?? selectedPost.published,
      });
      setIsEditing(false);
      setFormError(null);
      const resolvedContent =
        formState.content ??
        formState.rich_content_text ??
        selectedPost.content ??
        selectedPost.rich_content_text ??
        '';
      const updatedPost: SocialPost = {
        ...selectedPost,
        post_title: formState.post_title ?? selectedPost.post_title,
        post_description:
          'post_description' in formState
            ? (formState.post_description ?? '')
            : (selectedPost.post_description ?? ''),
        rich_content_text: resolvedContent,
        content: resolvedContent,
        rich_content_html: '',
        url_1: formState.url_1 ?? selectedPost.url_1,
        url_2: formState.url_2 ?? selectedPost.url_2,
        image: imageBase64,
        content_type: formState.content_type ?? selectedPost.content_type,
        scheduled_date: isoScheduledDate as string,
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

    // If content type is X (Twitter) and publishing now, show confirmation
    if (contentType === 'x' && formState.published) {
      setIsPublishConfirmModalOpen(true);
      return;
    }

    await executeCreate();
  };

  const executeCreate = async () => {
    const trimmedTitle = formState.post_title?.trim() ?? '';
    const isoScheduledDate = parseScheduledDate(formState.scheduled_date);
    const contentType = formState.content_type ?? DEFAULT_CONTENT_TYPE;

    setIsSaving(true);
    setFormError(null);
    try {
      const contentValue =
        trimPreserveNewlines(formState.content ?? '') ||
        trimPreserveNewlines(formState.rich_content_text ?? '') ||
        trimPreserveNewlines(formState.post_description ?? '') ||
        '';

      // Convert attached file to base64 if exists
      let imageBase64: string | null = null;
      if (attachedFile) {
        try {
          imageBase64 = await convertFileToBase64(attachedFile);
        } catch (error) {
          console.error('Failed to convert image to base64:', error);
          setFormError('Failed to process image. Please try again.');
          setIsSaving(false);
          return;
        }
      }

      // If publishing to X, call the tweet API directly
      if (contentType === 'x' && formState.published && token) {
        try {
          // Step 1: Publish to X (Twitter)
          const imageName = attachedFile?.name ?? null;
          const company_id = user?.company_id || 0;
          await socialCopilotApi.postToTwitter(
            company_id,
            token,
            contentValue,
            imageBase64,
            imageName,
            formState.url_1?.trim() ?? null,
          );

          // Step 2: Save to database via /post endpoint
          const postPayload = {
            post_title: trimmedTitle,
            post_description: trimPreserveNewlines(formState.post_description ?? ''),
            url_1: formState.url_1?.trim() ?? '',
            url_2: formState.url_2?.trim() ?? '',
            content_type: contentType,
            scheduled_date: new Date(isoScheduledDate as string).getTime(),
            content: contentValue,
            status: 'published',
          };

          // Call the POST endpoint directly
          const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:ydIfcjKj/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postPayload),
          });

          if (!response.ok) {
            throw new Error('Failed to save post to database');
          }

          // Step 3: Refresh posts and close modal
          await refreshPosts();
          setIsModalOpen(false);
          setIsCreating(false);
          setFormState({});
          setFormError(null);
          setAttachedFile(null);
        } catch (error) {
          console.error('Failed to publish to X:', error);
          setFormError('Failed to publish to X. Please try again.');
          return;
        }
      } else {
        // Normal create flow for other platforms - use POST endpoint
        const postPayload = {
          post_title: trimmedTitle,
          post_description: trimPreserveNewlines(formState.post_description ?? ''),
          url_1: formState.url_1?.trim() ?? '',
          url_2: formState.url_2?.trim() ?? '',
          content_type: contentType,
          scheduled_date: new Date(isoScheduledDate as string).getTime(),
          content: contentValue,
          status: formState.published ? 'published' : 'draft',
        };

        console.log('Creating post with payload:', postPayload);

        try {
          const response = await fetch('https://xnpm-iauo-ef2d.n7e.xano.io/api:ydIfcjKj/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postPayload),
          });

          if (!response.ok) {
            throw new Error('Failed to create post');
          }

          setIsModalOpen(false);
          setIsCreating(false);
          setFormState({});
          setFormError(null);
          setAttachedFile(null);
          await refreshPosts();
        } catch (error) {
          console.error('Failed to create post:', error);
          setFormError('Failed to create post. Please try again.');
        }
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

  const handleStatusChange = async (newStatus: 'draft' | 'approved' | 'published') => {
    if (!selectedPost) return;
    await updateStatus(selectedPost.id, newStatus);
    setSelectedPost((prev) =>
      prev ? { ...prev, status: newStatus, published: newStatus === 'published' } : prev,
    );
    setFormState((prev) => ({ ...prev, status: newStatus, published: newStatus === 'published' }));
  };

  const handlePublishToggle = async () => {
    if (!selectedPost) return;
    const nextStatus = !selectedPost.published;

    // If platform is X (Twitter) and we're publishing, post to Twitter
    if (selectedPost.content_type === 'x' && nextStatus && token) {
      try {
        const content =
          selectedPost.content ||
          selectedPost.rich_content_text ||
          selectedPost.post_description ||
          '';
        if (content) {
          const { socialCopilotApi } = await import('@/lib/xano/api');
          const imageName = getImageNameFromBase64(selectedPost.image);
          const company_id = user?.company_id || 0;
          await socialCopilotApi.postToTwitter(
            company_id,
            token,
            content,
            selectedPost.image ?? null,
            imageName,
            selectedPost.url_1 ?? null,
          );
        }
      } catch (error) {
        console.error('Failed to post to Twitter:', error);
        setFormError('Failed to post to Twitter. Please try again.');
        return;
      }
    }

    await togglePublish(selectedPost.id, nextStatus);
    setSelectedPost((prev) => (prev ? { ...prev, published: nextStatus } : prev));
    setFormState((prev) => ({ ...prev, published: nextStatus }));
  };

  const renderPostSummary = (post: SocialPost) => {
    const scheduledDate = new Date(post.scheduled_date);
    const isMutating = state.mutatingPostIds.includes(post.id);

    // Determine status badge styling
    const getStatusBadgeStyle = (status: string) => {
      switch (status) {
        case 'published':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'approved':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'draft':
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div
        key={post.id}
        className={cn(
          'flex flex-col gap-3 rounded-lg border border-border/70 bg-background/80 p-4 transition-colors',
          'hover:border-[#C33527] cursor-pointer',
        )}
        onClick={() => handleOpenPost(post)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold capitalize',
                  CONTENT_COLORS[post.content_type],
                )}
              >
                {getPlatformIcon(post.content_type)}
                {post.content_type}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'capitalize text-xs font-medium',
                  getStatusBadgeStyle(post.status || 'draft'),
                )}
              >
                {post.status || 'draft'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(scheduledDate, 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            <p className="truncate text-sm font-medium text-foreground">{post.post_title}</p>
            {post.post_description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{post.post_description}</p>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant={post.published ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 rounded-full border-0 px-3 text-xs font-semibold whitespace-nowrap',
                post.published ? 'bg-[#C33527] hover:bg-[#DA857C]' : '',
              )}
              onClick={async (e) => {
                e.stopPropagation();
                const nextStatus = !post.published;

                // If platform is X (Twitter) and we're publishing, post to Twitter
                if (post.content_type === 'x' && nextStatus && token) {
                  try {
                    const content =
                      post.content || post.rich_content_text || post.post_description || '';
                    if (content) {
                      const { socialCopilotApi } = await import('@/lib/xano/api');
                      const imageName = getImageNameFromBase64(post.image);
                      const company_id = user?.company_id || 0;
                      await socialCopilotApi.postToTwitter(
                        company_id,
                        token,
                        content,
                        post.image ?? null,
                        imageName,
                        post.url_1 ?? null,
                      );
                    }
                  } catch (error) {
                    toast.push(
                      <Notification type="error">
                        Failed to post to Twitter. Please try again.
                      </Notification>,
                      {
                        placement: 'top-center',

                      },
                    );
                    console.error('Failed to post to Twitter:', error);
                    return;
                  }
                }

                togglePublish(post.id, nextStatus);
              }}
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
      <div className="rounded-xl border-0 md:border md:border-border/80 bg-background/80 -mx-3 md:mx-0 p-0 md:p-4">
        <div className="mb-4 px-4 pt-4 md:px-0 md:pt-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-[#C33527]" />
            <h3 className="text-sm font-semibold text-foreground">Content calendar</h3>
          </div>
          <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
            {state.posts.length}
          </Badge>
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
                <div key={post.id} className="text-left">
                  {renderPostSummary(post)}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No posts scheduled for today.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/80 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#C33527]" />
              <h3 className="text-sm font-semibold text-foreground">All posts</h3>
            </div>
            <Badge variant="outline" className="border-[#C33527] text-[#C33527]">
              {state.posts.length}
            </Badge>
          </div>

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-2">
            {state.posts.length > 0 ? (
              state.posts.map((post) => (
                <div key={post.id} className="text-left">
                  {renderPostSummary(post)}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No scheduled posts yet.</p>
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
        isExpanded ? 'md:min-h-[80vh]' : 'md:max-h-[80vh]',
        className,
      )}
    >
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-2 md:gap-3 p-3 md:p-6"
        onClick={toggleExpanded}
      >
        {/* Left Section: Icon + Title */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="p-1.5 md:p-2 bg-[#C33527]/10 rounded-lg flex-shrink-0">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#C33527]" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm md:text-base lg:text-lg truncate">
              Social Media Copilot
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
              Plan and manage social content across platforms
            </p>
          </div>
        </div>

        {/* Right Section: Actions + Expand Button */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Mobile: Show only Add Post + Expand */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-[#C33527] hover:bg-[#DA857C] h-8 px-2"
              onClick={(event) => {
                event.stopPropagation();
                handleStartCreate();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Desktop: Full action bar */}
          <div className="hidden md:flex items-center gap-2 pr-6">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            {getStatusBadge()}
            {state.lastFetchedAt ? (
              <span className="hidden lg:block text-xs text-muted-foreground">
                {format(new Date(state.lastFetchedAt), 'MMM d')}
              </span>
            ) : null}
            <Button
              variant="default"
              size="sm"
              className="gap-1 bg-[#C33527] hover:bg-[#DA857C] px-2"
              onClick={(event) => {
                event.stopPropagation();
                handleStartCreate();
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Post</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-2"
              onClick={(event) => {
                event.stopPropagation();
                refreshPosts();
              }}
              disabled={state.isRefreshing}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4 text-muted-foreground',
                  state.isRefreshing ? 'animate-spin text-[#C33527]' : '',
                )}
              />
              <span className="hidden lg:inline">Refresh</span>
            </Button>
          </div>

          {/* Expand button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 md:h-9 md:w-9 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded ? (
        <CardContent className="space-y-5 px-3 md:px-6">
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

          <div className="h-[500px] md:h-auto md:min-h-[400px] space-y-4 overflow-y-auto pr-2">
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-2xl space-y-4 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border/60 bg-background px-4 sm:px-6 py-4 sm:py-5 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div
                className={cn(
                  'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full flex-shrink-0',
                  CONTENT_COLORS[activeFormData.content_type ?? 'linkedin'],
                )}
              >
                {getPlatformIcon(activeFormData.content_type ?? 'linkedin', 'md')}
              </div>
              <div className="flex flex-col min-w-0">
                <DialogTitle className="text-lg sm:text-xl truncate">
                  {activeFormData.content_type === 'youtube-video'
                    ? 'YouTube Video'
                    : activeFormData.content_type === 'youtube-short'
                      ? 'YouTube Short'
                      : activeFormData.content_type === 'x'
                        ? 'X (Twitter)'
                        : activeFormData.content_type === 'all'
                          ? 'All Platforms'
                          : (activeFormData.content_type || 'LinkedIn').charAt(0).toUpperCase() +
                          (activeFormData.content_type || 'LinkedIn').slice(1)}
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {isEditing
                    ? 'Edit Post'
                    : isCreating
                      ? activeFormData.published
                        ? 'Publish Now'
                        : 'Schedule Post'
                      : 'Post Details'}
                </p>
              </div>
            </div>
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
                  <Label htmlFor="content">Post Content</Label>
                  {isFormEditable ? (
                    <UnicodeTextFormatter
                      content={activeFormData.content ?? activeFormData.rich_content_text ?? ''}
                      onChange={(text) => handleChange('content', text)}
                      editable={true}
                      placeholder="Write your post content with Unicode formatting..."
                    />
                  ) : (
                    <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">
                      {selectedPost?.content || selectedPost?.rich_content_text || '—'}
                    </div>
                  )}
                </div>

                {/* File Attachment - Only show when creating/editing */}
                {isFormEditable && (
                  <div className="grid gap-2">
                    <Label htmlFor="media">Media Attachment (Optional)</Label>
                    <div className="space-y-2">
                      {!attachedFile ? (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('media-upload')?.click()}
                            className="gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Upload Image
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            PNG, JPG, GIF, WEBP (max 5MB, GIF up to 15MB)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/20 p-3">
                          <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm flex-1 truncate">{attachedFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(attachedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {fileError && <p className="text-sm text-destructive">{fileError}</p>}
                    </div>
                  </div>
                )}

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

                {/* Only show scheduled date if not publishing now */}
                {!(isCreating && activeFormData.published) && (
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
                )}

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  {!isFormEditable ? (
                    <select
                      id="status"
                      value={selectedPost?.status ?? 'draft'}
                      onChange={(e) =>
                        handleStatusChange(e.target.value as 'draft' | 'approved' | 'published')
                      }
                      disabled={isMutatingSelected}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="draft">Draft</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                    </select>
                  ) : (
                    <p className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm capitalize text-foreground">
                      {selectedPost?.status ?? 'draft'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:flex-1">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? 'Scheduling…' : 'Schedule Post'}
                  </Button>
                </>
              ) : isCreating ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isSaving}
                    className={cn(
                      'w-full sm:w-auto',
                      activeFormData.content_type === 'x' &&
                      activeFormData.published &&
                      'bg-black hover:bg-black/90',
                    )}
                  >
                    {isSaving
                      ? activeFormData.content_type === 'x' && activeFormData.published
                        ? 'Publishing to X…'
                        : 'Scheduling…'
                      : activeFormData.content_type === 'x' && activeFormData.published
                        ? 'Publish to X'
                        : 'Schedule Post'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleCloseModal} className="w-full sm:w-auto">
                  Close
                </Button>
              )}
            </div>

            {(!isFormEditable && selectedPost) || selectedPost ? (
              <div className="flex gap-2 w-full sm:w-auto">
                {!isFormEditable && selectedPost ? (
                  <Button variant="secondary" onClick={handleEdit} className="flex-1 sm:flex-none">
                    Edit
                  </Button>
                ) : null}
                {selectedPost ? (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || isCreating}
                    className="flex-1 sm:flex-none"
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheduling Choice Modal */}
      <Dialog open={isScheduleChoiceModalOpen} onOpenChange={setIsScheduleChoiceModalOpen}>
        <DialogContent className="max-w-md space-y-6 rounded-2xl border border-border/60 bg-background px-6 py-5">
          <DialogHeader>
            <DialogTitle>New Post</DialogTitle>
            <DialogDescription>Choose when you want to publish this post.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              variant="default"
              size="lg"
              className="gap-3 bg-[#C33527] hover:bg-[#DA857C] h-auto py-4 justify-start"
              onClick={() => handleScheduleChoice(true)}
            >
              <div className="p-2 bg-white/10 rounded-lg">
                <Send className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold">Post Now</span>
                <span className="text-xs font-normal opacity-90">Publish immediately</span>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-3 h-auto py-4 justify-start border-2"
              onClick={() => handleScheduleChoice(false)}
            >
              <div className="p-2 bg-[#C33527]/10 rounded-lg">
                <Clock className="h-5 w-5 text-[#C33527]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold">Schedule Post</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Choose a date and time
                </span>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsScheduleChoiceModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Modal */}
      <Dialog open={isPublishConfirmModalOpen} onOpenChange={setIsPublishConfirmModalOpen}>
        <DialogContent className="max-w-md space-y-6 rounded-2xl border border-border/60 bg-background px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <Twitter className="h-5 w-5" />
              </div>
              Publish to X?
            </DialogTitle>
            <DialogDescription>
              This will immediately publish your post to X (Twitter). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Preview:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {formState.content ||
                  formState.rich_content_text ||
                  formState.post_description ||
                  '(No content)'}
              </p>
            </div>
            {attachedFile && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached Media:</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>{attachedFile.name}</span>
                  <span className="text-xs">
                    ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPublishConfirmModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setIsPublishConfirmModalOpen(false);
                await executeCreate();
              }}
              disabled={isSaving}
              className="bg-black hover:bg-black/90"
            >
              {isSaving ? 'Publishing…' : 'Publish Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform Selection Modal */}
      <Dialog open={isPlatformSelectionModalOpen} onOpenChange={setIsPlatformSelectionModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-3xl space-y-4 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border/60 bg-background px-4 sm:px-6 py-4 sm:py-5 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Choose Platform</DialogTitle>
            <DialogDescription className="text-sm">
              Select which social media platform you want to post to
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            {/* LinkedIn */}
            <button
              onClick={() => handlePlatformSelection('linkedin')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#0077B5] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0077B5]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#0077B5] text-white transition-transform group-hover:scale-110">
                <Linkedin className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                LinkedIn
              </span>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handlePlatformSelection('instagram')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#E4405F] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E4405F]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976] text-white transition-transform group-hover:scale-110">
                <Instagram className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                Instagram
              </span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handlePlatformSelection('x')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-black hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                <Twitter className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                X (Twitter)
              </span>
            </button>

            {/* TikTok */}
            <button
              onClick={() => handlePlatformSelection('tiktok')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-black hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                <svg className="h-5 w-5 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                TikTok
              </span>
            </button>

            {/* YouTube Video */}
            <button
              onClick={() => handlePlatformSelection('youtube-video')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#FF0000] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#FF0000] text-white transition-transform group-hover:scale-110">
                <Youtube className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                YouTube Video
              </span>
            </button>

            {/* YouTube Short */}
            <button
              onClick={() => handlePlatformSelection('youtube-short')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#FF0000] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#FF0000] text-white transition-transform group-hover:scale-110">
                <svg className="h-5 w-5 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 5.5L10 18.5L17 12L10 5.5Z" />
                  <rect
                    x="6"
                    y="4"
                    width="12"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                YouTube Short
              </span>
            </button>

            {/* Pinterest */}
            <button
              onClick={() => handlePlatformSelection('pinterest')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#E60023] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#E60023] text-white transition-transform group-hover:scale-110">
                <Pin className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                Pinterest
              </span>
            </button>

            {/* Snapchat */}
            <button
              onClick={() => handlePlatformSelection('snapchat')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#FFFC00] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFFC00]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#FFFC00] text-black transition-transform group-hover:scale-110">
                <svg className="h-5 w-5 sm:h-8 sm:w-8" viewBox="0 0 128 128" fill="currentColor">
                  <path d="M95.918 22.002c-11.963-.087-24.145 4.54-32.031 13.717-6.995 7.405-9.636 17.901-9.284 27.868-.03 5.119.032 10.237.05 15.355-4.901-1.217-9.873-4.624-15.063-2.937-4.422 1.313-6.267 7.088-3.596 10.791 2.876 3.761 7.346 5.907 11.08 8.71 1.837 1.5 4.313 2.571 5.68 4.499-.001 4.62-2.425 8.897-4.722 12.786-5.597 8.802-14.342 15.531-23.705 20.18-2.39 1.035-4.59 4.144-2.473 6.499 3.862 3.622 9.327 4.778 14.195 6.486 2.047.64 5.078 1.34 4.886 4.084.335 2.923 2.205 6.066 5.492 6.078 7.873.91 16.289.522 23.345 4.741 6.917 4.006 14.037 8.473 22.255 8.96 8.188.767 16.623-.888 23.642-5.255 5.23-2.884 10.328-6.477 16.456-7.061 5.155-1.206 10.702-.151 15.685-2.072 3.193-1.367 2.762-5.244 4.104-7.808 2.532-1.747 5.77-1.948 8.59-3.102 3.687-1.47 8.335-2.599 10.268-6.413 1.148-3.038-2.312-4.698-4.453-5.88-11.38-5.874-21.631-14.921-26.121-27.191-.496-1.936-2.279-4.834.084-6.255 4.953-4.176 11.413-6.575 15.514-11.715 3.103-3.884.941-10.55-4.141-11.322-4.928-.78-9.525 1.893-14.152 3.127-.404-8.53.502-17.232-.776-25.746-2.429-13.808-13.514-25.157-26.813-29.124-4.521-1.401-9.266-2.037-13.996-2Z" />
                </svg>
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                Snapchat
              </span>
            </button>

            {/* All Platforms */}
            <button
              onClick={() => handlePlatformSelection('all')}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 border-border bg-card p-3 sm:p-6 transition-all hover:border-[#C33527] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C33527]"
            >
              <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#C33527] via-[#E4405F] to-[#0077B5] text-white transition-transform group-hover:scale-110">
                <svg
                  className="h-5 w-5 sm:h-8 sm:w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                </svg>
              </div>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">
                All Platforms
              </span>
            </button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPlatformSelectionModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
