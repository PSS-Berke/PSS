'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Linkedin, Instagram, Clock, CheckCircle2, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SocialPost } from '@/lib/xano/types';

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

interface SocialPostDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posts: SocialPost[];
  platform: SocialPost['content_type'];
  date: string;
  onSelectPost?: (post: SocialPost) => void;
}

export function SocialPostDetailsDialog({
  open,
  onOpenChange,
  posts,
  platform,
  date,
  onSelectPost,
}: SocialPostDetailsDialogProps) {
  const getPlatformIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    switch (platform) {
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

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePostClick = (post: SocialPost) => {
    if (onSelectPost) {
      onSelectPost(post);
      onOpenChange(false);
    }
  };

  // Sort posts by scheduled time
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center rounded-full p-2',
              CONTENT_COLORS[platform]
            )}>
              {getPlatformIcon()}
            </div>
            <span className="capitalize">{platform}</span>
            <span className="text-muted-foreground font-normal">·</span>
            <span className="text-muted-foreground font-normal">{formatDate(date)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className={cn(
                "rounded-lg border border-border bg-card p-4 transition-colors",
                onSelectPost && "cursor-pointer hover:bg-accent hover:border-accent-foreground/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formatTime(post.scheduled_date)}
                    </span>
                    {post.published && (
                      <div className="flex items-center gap-1 text-xs text-[#C33527]">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Published</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {post.post_title}
                  </h4>
                  {(post.post_description || post.content) && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.post_description || post.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No posts scheduled
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
