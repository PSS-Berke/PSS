'use client';

import React, { useCallback, useMemo } from 'react';
import type { EventContentArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import type { SocialPost } from '@/lib/xano/types';
import { cn } from '@/lib/utils';

const CONTENT_COLORS: Record<SocialPost['content_type'], string> = {
  linkedin: 'bg-[#0077B5] text-white',
  instagram: 'bg-[#E4405F] text-white',
  tiktok: 'bg-black text-white',
  all: 'bg-[#C33527] text-white',
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
  };
}

export function SocialMediaCalendar({ posts, onSelectPost, onReschedulePost }: SocialMediaCalendarProps) {
  const events = useMemo<CalendarEvent[]>(() => {
    return posts.map((post) => {
      const scheduledDate = new Date(post.scheduled_date);
      const hour = scheduledDate.getHours();
      const isOutsideBusinessHours = hour < 9 || hour >= 19;

      return {
        id: post.id.toString(),
        title: post.post_title,
        start: post.scheduled_date,
        allDay: isOutsideBusinessHours,
        extendedProps: {
          contentType: post.content_type,
          published: post.published,
          rawDate: post.scheduled_date,
        },
      };
    });
  }, [posts]);

  const renderEventContent = (arg: EventContentArg) => {
    const { extendedProps, title } = arg.event;
    const contentType = extendedProps.contentType as SocialPost['content_type'];
    const published = Boolean(extendedProps.published);
    const scheduled = new Date(extendedProps.rawDate as string);

    return (
      <div className="flex h-full flex-col rounded-lg border border-border/60 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white',
              CONTENT_COLORS[contentType]
            )}
          >
            {contentType}
          </span>
          <span
            className={cn(
              'flex h-3 w-3 items-center justify-center rounded-full border',
              published
                ? 'border-[#C33527] bg-[#C33527]'
                : 'border-border bg-transparent'
            )}
          />
        </div>
        <div className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
          {title}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {scheduled.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    );
  };

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      if (!onSelectPost) return;
      const postId = Number(arg.event.id);
      const post = posts.find((item) => item.id === postId);
      if (post) {
        onSelectPost(post);
      }
    },
    [posts, onSelectPost]
  );

  const handleEventDrop = useCallback(
    async (arg: EventDropArg) => {
      if (!onReschedulePost) return;

      const postId = Number(arg.event.id);
      if (Number.isNaN(postId)) {
        arg.revert();
        return;
      }

      const nextStart = arg.event.start ?? (arg.event.startStr ? new Date(arg.event.startStr) : null);
      if (!nextStart || Number.isNaN(nextStart.getTime())) {
        arg.revert();
        return;
      }

      const isoDate = nextStart.toISOString();

      try {
        await onReschedulePost(postId, isoDate);

        const hour = nextStart.getHours();
        const isOutsideBusinessHours = hour < 9 || hour >= 19;
        arg.event.setAllDay(isOutsideBusinessHours);
        arg.event.setExtendedProp('rawDate', isoDate);
      } catch (error) {
        console.error('Calendar: Failed to reschedule post', error);
        arg.revert();
      }
    },
    [onReschedulePost]
  );

  return (
    <div className="calendar-wrapper rounded-xl border border-border/60 bg-white p-3">
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
  );
}

