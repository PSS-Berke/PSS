'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Delta, Sources } from 'quill';
import type { UnprivilegedEditor } from 'react-quill-new';

import { cn } from '@/lib/utils';

import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[180px] items-center justify-center rounded-md border border-border/60 bg-muted/30 text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link'],
  ['clean'],
];

export function RichTextEditor({ value, onChange, readOnly, placeholder, className, id }: RichTextEditorProps) {
  const modules = React.useMemo(() => ({
    toolbar: readOnly ? false : toolbarOptions,
    clipboard: {
      matchVisual: false,
    },
  }), [readOnly]);

  const formats = React.useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'bullet',
      'indent',
      'link',
      'color',
      'background',
      'align',
    ],
    []
  );

  return (
    <ReactQuill
      id={id}
      theme="snow"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      className={cn('rounded-md border border-border/60 bg-background [&_.ql-container]:min-h-[180px]', className)}
    />
  );
}


