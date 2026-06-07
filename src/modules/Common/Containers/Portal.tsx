import { ReactNode } from 'react';
import ReactDOM from 'react-dom';

type PortalProps = {
  children: ReactNode;
};
export const Portal = ({ children }: PortalProps) => {
  // Get the portal container element in the DOM
  let portalContainer = document.getElementById('portal-root');

  // Fallback: create the container if it doesn't exist (for SSR or dynamic setups)
  if (!portalContainer) {
    const div = document.createElement('div');
    div.id = 'portal-root';
    document.body.appendChild(div);
    portalContainer = div;
  }

  // Render children into the portal container
  return ReactDOM.createPortal(children, portalContainer);
};
