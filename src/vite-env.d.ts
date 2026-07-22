/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_BACKEND_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg?react' {
  import * as React from 'react';

  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
