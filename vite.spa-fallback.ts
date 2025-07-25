import type { Plugin } from 'vite';

export default function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Return a custom middleware to handle SPA fallback
      return () => {
        server.middlewares.use((req, res, next) => {
          // Skip if this is an API request or has a file extension
          if (
            req.url?.startsWith('/api') ||
            req.url?.includes('.') ||
            req.url === '/'
          ) {
            return next();
          }

          // Serve index.html for all other routes
          req.url = '/';
          server.middlewares.handle(req, res, next);
        });
      };
    },
  };
}
