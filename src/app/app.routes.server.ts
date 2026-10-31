import { RenderMode, ServerRoute } from '@angular/ssr';

// The session lives in sessionStorage, so route guards can only run in the browser.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
