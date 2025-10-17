'use client';

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';
import { Type, Bold, Italic, Strikethrough, Underline as UnderlineIcon } from 'lucide-react';

interface UnicodeTextFormatterProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

// Unicode text style mappings
const unicodeStyles = {
  bold: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    map: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
  },
  italic: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    map: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻',
  },
  boldItalic: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    map: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯',
  },
  monospace: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    map: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
  },
  strikethrough: {
    prefix: '',
    suffix: '',
    wrapper: (text: string) =>
      text
        .split('')
        .map((char) => char + '\u0336')
        .join(''),
  },
  underline: {
    prefix: '',
    suffix: '',
    wrapper: (text: string) =>
      text
        .split('')
        .map((char) => char + '\u0332')
        .join(''),
  },
};

const convertToUnicode = (text: string, style: keyof typeof unicodeStyles): string => {
  const styleData = unicodeStyles[style];

  if ('wrapper' in styleData && styleData.wrapper) {
    return styleData.wrapper(text);
  }

  if ('chars' in styleData && 'map' in styleData) {
    return text
      .split('')
      .map((char) => {
        const index = styleData.chars.indexOf(char);
        return index !== -1 ? styleData.map[index] : char;
      })
      .join('');
  }

  return text;
};

export function UnicodeTextFormatter({
  content,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className,
}: UnicodeTextFormatterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (style: keyof typeof unicodeStyles) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const formattedText = convertToUnicode(selectedText, style);
      const newContent = content.substring(0, start) + formattedText + content.substring(end);
      onChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
  };

  if (!editable) {
    return (
      <div
        className={cn(
          'rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap',
          className,
        )}
      >
        {content || '—'}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border border-input bg-background', className)}>
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('bold')}
          className="h-8 px-2"
          title="Bold (Unicode)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('italic')}
          className="h-8 px-2"
          title="Italic (Unicode)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('boldItalic')}
          className="h-8 px-2"
          title="Bold Italic (Unicode)"
        >
          <Type className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-8 w-px bg-border" />

        {/* Decorations */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('strikethrough')}
          className="h-8 px-2"
          title="Strikethrough (Unicode)"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('underline')}
          className="h-8 px-2"
          title="Underline (Unicode)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-8 w-px bg-border" />

        {/* Monospace */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFormatting('monospace')}
          className="h-8 px-2 font-mono"
          title="Monospace (Unicode)"
        >
          <span className="text-xs font-mono">Mono</span>
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
        rows={8}
      />
    </div>
  );
}
