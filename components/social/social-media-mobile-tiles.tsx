'use client';

import React, { useMemo, useState } from 'react';
import { addDays, format, isToday, startOfDay, isSameDay } from 'date-fns';
import { Linkedin, Instagram, CalendarCheck, ChevronLeft, ChevronRight, type LucideProps } from 'lucide-react';
import type { SocialPost } from '@/lib/xano/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SocialPostDetailsDialog } from './social-post-details-dialog';

// Custom TikTok icon component
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

const PLATFORM_CONFIG: Record<SocialPost['content_type'], {
  color: string;
  bgColor: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
}> = {
  linkedin: {
    color: 'text-white',
    bgColor: 'bg-[#0077B5]',
    icon: Linkedin,
    label: 'LinkedIn'
  },
  instagram: {
    color: 'text-white',
    bgColor: 'bg-[#E4405F]',
    icon: Instagram,
    label: 'Instagram'
  },
  tiktok: {
    color: 'text-white',
    bgColor: 'bg-black',
    icon: TikTokIcon,
    label: 'TikTok'
  },
  all: {
    color: 'text-white',
    bgColor: 'bg-[#C33527]',
    icon: CalendarCheck,
    label: 'All'
  },
  x: {
    color: 'text-white',
    bgColor: 'bg-black',
    icon: Instagram,
    label: 'X'
  },
  pinterest: {
    color: 'text-white',
    bgColor: 'bg-[#E60023]',
    icon: Instagram,
    label: 'Pinterest'
  },
  snapchat: {
    color: 'text-black',
    bgColor: 'bg-[#FFFC00]',
    icon: Instagram,
    label: 'Snap'
  },
  'youtube-video': {
    color: 'text-white',
    bgColor: 'bg-[#FF0000]',
    icon: Instagram,
    label: 'YouTube'
  },
  'youtube-short': {
    color: 'text-white',
    bgColor: 'bg-[#FF0000]',
    icon: Instagram,
    label: 'YT Short'
  },
};

interface PostGroup {
  platform: SocialPost['content_type'];
  posts: SocialPost[];
  count: number;
  hasPublished: boolean;
}

interface DayColumn {
  date: Date;
  isToday: boolean;
  dayLabel: string;
  dateLabel: string;
  postGroups: PostGroup[];
}

interface SocialMediaMobileTilesProps {
  posts: SocialPost[];
  onSelectPost?: (post: SocialPost) => void;
}

export function SocialMediaMobileTiles({ posts, onSelectPost }: SocialMediaMobileTilesProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupDialog, setGroupDialog] = useState<{
    open: boolean;
    posts: SocialPost[];
    platform: SocialPost['content_type'];
    date: string;
  } | null>(null);

  // Calculate day columns - always 3 days with grouped posts
  const dayColumns = useMemo<DayColumn[]>(() => {
    const numDays = 3;
    const baseDate = startOfDay(currentDate);

    return Array.from({ length: numDays }, (_, i) => {
      const date = addDays(baseDate, i);
      const dayPosts = posts.filter(post =>
        isSameDay(new Date(post.scheduled_date), date)
      );

      // Group posts by platform (content_type)
      const platformGroups = new Map<SocialPost['content_type'], PostGroup>();

      dayPosts.forEach(post => {
        const key = post.content_type;
        if (!platformGroups.has(key)) {
          platformGroups.set(key, {
            platform: post.content_type,
            posts: [],
            count: 0,
            hasPublished: false
          });
        }
        const group = platformGroups.get(key)!;
        group.posts.push(post);
        group.count++;
        if (post.published) {
          group.hasPublished = true;
        }
      });

      // Convert to array and sort groups by earliest post time
      const sortedGroups = Array.from(platformGroups.values()).sort((a, b) =>
        new Date(a.posts[0].scheduled_date).getTime() -
        new Date(b.posts[0].scheduled_date).getTime()
      );

      // Sort posts within each group by time
      sortedGroups.forEach(group => {
        group.posts.sort((a, b) =>
          new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        );
      });

      const isTodayDate = isToday(date);
      const dayLabel = isTodayDate ? 'Today' : format(date, 'EEEE');

      return {
        date,
        isToday: isTodayDate,
        dayLabel,
        dateLabel: format(date, 'MMM d'),
        postGroups: sortedGroups
      };
    });
  }, [currentDate, posts]);

  // Navigation handlers
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    setCurrentDate(addDays(currentDate, -3));
  };
  const goToNext = () => {
    setCurrentDate(addDays(currentDate, 3));
  };

  // Check if we're viewing today
  const isViewingToday = dayColumns.some(col => col.isToday);

  // Handle post click
  const handlePostClick = (post: SocialPost) => {
    if (onSelectPost) {
      onSelectPost(post);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Navigation Header - Full Width */}
      <div className="relative flex items-center justify-center py-4 bg-muted/30 border-b w-full">
        {/* Left: Previous button - positioned at left edge */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="absolute left-0 h-full w-16 rounded-none hover:bg-muted/50"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Center: Today button - larger and centered */}
        <div className="flex items-center gap-3">
          <Button
            variant={isViewingToday ? "ghost" : "default"}
            size="lg"
            onClick={goToToday}
            className="h-10 px-6 text-sm font-semibold"
            disabled={isViewingToday}
          >
            Today
          </Button>

          {/* Month label */}
          <span className="text-sm font-medium text-muted-foreground">
            {format(currentDate, 'MMM yyyy')}
          </span>
        </div>

        {/* Right: Next button - positioned at right edge */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="absolute right-0 h-full w-16 rounded-none hover:bg-muted/50"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Calendar Grid - Always 3 days */}
      <div className="grid grid-cols-3 gap-2 px-3 py-3">
        {dayColumns.map((column) => (
          <div
            key={format(column.date, 'yyyy-MM-dd')}
            className="flex flex-col min-w-0"
          >
            {/* Day Header */}
            <div className={cn(
              "text-center py-3 border-b mb-3",
              column.isToday && "bg-primary/10 rounded-t-md"
            )}>
              <div className={cn(
                "text-sm font-medium",
                column.isToday
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
              )}>
                {column.dayLabel}
              </div>
              <div className={cn(
                "text-lg font-bold mt-1",
                column.isToday && "text-primary"
              )}>
                {format(column.date, 'd')}
              </div>
            </div>

            {/* Posts Column */}
            <div className="space-y-3 flex-1">
              {column.postGroups.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarCheck className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <span className="text-xs text-muted-foreground">
                    No posts
                  </span>
                </div>
              ) : (
                // Post Groups
                column.postGroups.map((group) => {
                  const config = PLATFORM_CONFIG[group.platform];
                  const Icon = config.icon;

                  // Single post in group - show full details
                  if (group.count === 1) {
                    const post = group.posts[0];
                    const scheduledDate = new Date(post.scheduled_date);

                    return (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="w-full p-3 gap-2.5 min-h-[110px] rounded-lg border border-border bg-card shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left flex flex-col"
                      >
                        {/* Platform Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <div className={cn(
                            'inline-flex items-center justify-center rounded-full p-1.5',
                            config.bgColor,
                            config.color
                          )}>
                            <Icon className="h-4 w-4 flex-shrink-0" />
                          </div>

                          {/* Status Dot */}
                          <div
                            className={cn(
                              'flex h-2.5 w-2.5 items-center justify-center rounded-full border flex-shrink-0',
                              post.published
                                ? 'border-[#C33527] bg-[#C33527]'
                                : 'border-border bg-transparent'
                            )}
                          />
                        </div>

                        {/* Post Title */}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground line-clamp-2 break-words overflow-hidden leading-snug">
                            {post.post_title}
                          </h4>
                        </div>

                        {/* Time */}
                        <div className="text-xs text-muted-foreground truncate">
                          {format(scheduledDate, 'h:mm a')}
                        </div>
                      </button>
                    );
                  }

                  // Multiple posts - show consolidated card (simplified)
                  return (
                    <button
                      key={`${format(column.date, 'yyyy-MM-dd')}-${group.platform}`}
                      onClick={() => setGroupDialog({
                        open: true,
                        posts: group.posts,
                        platform: group.platform,
                        date: format(column.date, 'yyyy-MM-dd')
                      })}
                      className="w-full p-4 min-h-[90px] rounded-lg border border-border bg-card shadow-sm hover:shadow-md hover:bg-accent/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      {/* Platform Icon Circle */}
                      <div className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0',
                        config.bgColor,
                        config.color
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Post Count */}
                      <div className="text-2xl font-bold text-foreground">
                        {group.count}
                      </div>

                      {/* Published Indicator */}
                      {group.hasPublished && (
                        <div className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full border border-[#C33527] bg-[#C33527]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Group Dialog for Multiple Posts */}
      {groupDialog && (
        <SocialPostDetailsDialog
          open={groupDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setGroupDialog(null);
            }
          }}
          posts={groupDialog.posts}
          platform={groupDialog.platform}
          date={groupDialog.date}
          onSelectPost={onSelectPost}
        />
      )}
    </div>
  );
}
