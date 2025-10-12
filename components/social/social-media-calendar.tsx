'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { EventContentArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Linkedin, Instagram, type LucideProps } from 'lucide-react';

import type { SocialPost } from '@/lib/xano/types';
import { cn } from '@/lib/utils';
import { SocialPostDetailsDialog } from './social-post-details-dialog';

// Custom TikTok icon component (lucide-react doesn't include TikTok)
const TikTokIcon = ({ className, ...props }: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const CONTENT_COLORS: Record<SocialPost['content_type'], string> = {
  linkedin: 'bg-[#0077B5] text-white',
  instagram: 'bg-[#E4405F] text-white',
  tiktok: 'bg-black text-white',
  all: 'bg-[#C33527] text-white',
  x: 'bg-black text-white',
  pinterest: 'bg-[#E60023] text-white',
  snapchat: 'bg-[#FFFC00] text-black',
  'youtube-video': 'bg-[#FF0000] text-white',
  'youtube-short': 'bg-[#FF0000] text-white',
};

interface SocialMediaCalendarProps {
  posts: SocialPost[];
  onSelectPost?: (post: SocialPost) => void;
  onReschedulePost?: (postId: number, nextDate: string) => Promise<void>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  extendedProps: {
    contentType: SocialPost['content_type'];
    published: boolean;
    rawDate: string;
    posts: SocialPost[];
    postCount: number;
  };
}

export function SocialMediaCalendar({ posts, onSelectPost, onReschedulePost }: SocialMediaCalendarProps) {
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    posts: SocialPost[];
    platform: SocialPost['content_type'];
    date: string;
  } | null>(null);

  const getPlatformIcon = (contentType: SocialPost['content_type'], size: 'sm' | 'md' = 'sm') => {
    const iconProps = { className: size === 'sm' ? "h-2.5 w-2.5" : "h-3.5 w-3.5" };
    switch (contentType) {
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'tiktok':
        return <TikTokIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const events = useMemo<CalendarEvent[]>(() => {
    const eventMap = new Map<string, CalendarEvent>();

    posts.forEach((post) => {
      const scheduledDate = new Date(post.scheduled_date);
      const dayKey = `${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(scheduledDate.getDate()).padStart(2, '0')}`;
      const eventKey = `${dayKey}-${post.content_type}`;

      if (!eventMap.has(eventKey)) {
        eventMap.set(eventKey, {
          id: eventKey,
          title: `${post.content_type} posts`,
          start: `${dayKey}T00:00:00`,
          allDay: true,
          extendedProps: {
            contentType: post.content_type,
            published: false,
            rawDate: `${dayKey}T00:00:00`,
            posts: [],
            postCount: 0,
          },
        });
      }

      const event = eventMap.get(eventKey)!;
      event.extendedProps.posts.push(post);
      event.extendedProps.postCount = event.extendedProps.posts.length;

      // Update published status if any post is published
      if (post.published) {
        event.extendedProps.published = true;
      }
    });

    return Array.from(eventMap.values());
  }, [posts]);

  const renderEventContent = (arg: EventContentArg) => {
    const { extendedProps } = arg.event;
    const contentType = extendedProps.contentType as SocialPost['content_type'];
    const posts = extendedProps.posts as SocialPost[];
    const postCount = extendedProps.postCount as number;
    const published = Boolean(extendedProps.published);

    // Single post view - show full details
    if (postCount === 1) {
      const post = posts[0];
      const scheduled = new Date(post.scheduled_date);
      const isWeeklyView = arg.view.type === 'timeGridWeek';

      return (
        <div className="flex h-full max-h-full w-full min-h-[5.5rem] flex-col rounded-lg border border-border/60 bg-card px-3 py-2 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between min-w-0">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white truncate max-w-[80%]',
                CONTENT_COLORS[contentType]
              )}
            >
              {getPlatformIcon(contentType)}
              {contentType}
            </span>
            <span
              className={cn(
                'flex h-3 w-3 items-center justify-center rounded-full border flex-shrink-0',
                post.published
                  ? 'border-[#C33527] bg-[#C33527]'
                  : 'border-border bg-transparent'
              )}
            />
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem] break-words overflow-hidden">
            {post.post_title}
          </div>
          {!isWeeklyView ? (
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {scheduled.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          ) : null}
        </div>
      );
    }

    // Multiple posts - show grouped mini box with count
    return (
      <div className="flex h-full w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 shadow-sm cursor-pointer hover:bg-accent transition-colors">
        <div className={cn(
          'flex items-center justify-center rounded-full p-1.5 flex-shrink-0',
          CONTENT_COLORS[contentType]
        )}>
          {getPlatformIcon(contentType, 'md')}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground capitalize truncate">
            {contentType}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
        {published && (
          <span
            className="flex h-3 w-3 items-center justify-center rounded-full border border-[#C33527] bg-[#C33527] flex-shrink-0"
          />
        )}
      </div>
    );
  };

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const { extendedProps } = arg.event;
      const eventPosts = extendedProps.posts as SocialPost[];
      const postCount = extendedProps.postCount as number;

      // Single post - directly open it
      if (postCount === 1 && onSelectPost) {
        onSelectPost(eventPosts[0]);
        return;
      }

      // Multiple posts - open dialog
      if (postCount > 1) {
        const contentType = extendedProps.contentType as SocialPost['content_type'];
        const rawDate = extendedProps.rawDate as string;

        setDetailsDialog({
          open: true,
          posts: eventPosts,
          platform: contentType,
          date: rawDate,
        });
      }
    },
    [onSelectPost]
  );

  const handleEventDrop = useCallback(
    async (arg: EventDropArg) => {
      if (!onReschedulePost) {
        arg.revert();
        return;
      }

      const { extendedProps } = arg.event;
      const eventPosts = extendedProps.posts as SocialPost[];
      const postCount = extendedProps.postCount as number;

      // Disable drag-and-drop for grouped events (multiple posts)
      if (postCount > 1) {
        arg.revert();
        return;
      }

      // Single post - allow rescheduling
      const post = eventPosts[0];
      const nextStart = arg.event.start ?? (arg.event.startStr ? new Date(arg.event.startStr) : null);
      if (!nextStart || Number.isNaN(nextStart.getTime())) {
        arg.revert();
        return;
      }

      const isoDate = nextStart.toISOString();

      try {
        await onReschedulePost(post.id, isoDate);

        arg.event.setStart(nextStart);
        const shouldBeAllDay = arg.event.allDay;
        arg.event.setAllDay(shouldBeAllDay);
        arg.event.setExtendedProp('rawDate', isoDate);
      } catch (error) {
        console.error('Calendar: Failed to reschedule post', error);
        arg.revert();
      }
    },
    [onReschedulePost]
  );

  return (
    <>
      <div className="calendar-wrapper rounded-xl bg-card p-3">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,dayGridMonth',
          }}
          buttonText={{
            today: 'today',
            dayGridMonth: 'month',
            timeGridWeek: 'week',
          }}
          height="auto"
          events={events}
          eventContent={renderEventContent}
          dayMaxEvents={3}
          displayEventTime={false}
          firstDay={1}
          aspectRatio={1.75}
          eventClick={handleEventClick}
          editable={Boolean(onReschedulePost)}
          eventDrop={handleEventDrop}
          eventDurationEditable={false}
        />
      </div>

      {detailsDialog && (
        <SocialPostDetailsDialog
          open={detailsDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDetailsDialog(null);
            }
          }}
          posts={detailsDialog.posts}
          platform={detailsDialog.platform}
          date={detailsDialog.date}
          onSelectPost={onSelectPost}
        />
      )}
    </>
  );
}

