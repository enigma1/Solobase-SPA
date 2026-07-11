import { useRef, useEffect } from 'react';
import { SqlTypes } from '>/types';
import JSONEditor, { type JSONEditorMode } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

type JsonEditorOptions = {
  collapseAll?: boolean;
  mainMenuBar?: boolean;
  mode?: JSONEditorMode;
};

type JsonEditorProps = {
  value: SqlTypes;
  onChange: (v: SqlTypes) => void;
  options?: JsonEditorOptions;
};

export const JsonEditor = ({ value, onChange, options }: JsonEditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const editor = new JSONEditor(containerRef.current!, {
      mode: options?.mode,
      mainMenuBar: options?.mainMenuBar ?? false,
      onChangeJSON: (json: SqlTypes) => {
        onChange(json);
      },
      onChangeText: (text: string) => {
        try {
          onChange(JSON.parse(text));
        } catch {
          onChange(text);
        }
      },
    });

    editor.set(value ?? null);

    if (options?.collapseAll) {
      editor.collapseAll();
    }

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  // sync external value → editor
  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.update(value ?? null);
  }, [value]);

  return <div ref={containerRef} className='h-full' />;
};
