import { createFileRoute } from '@tanstack/react-router';
import { envConfigs } from '@/config';

export const Route = createFileRoute('/manifest.webmanifest')({
  server: {
    handlers: {
      GET: () => {
        const manifest = {
          id: '/',
          name: envConfigs.app_name,
          short_name: envConfigs.app_name,
          description: envConfigs.app_description,
          lang: 'en',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '',
          theme_color: '',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            // {
            //   src: '/icons/icon-maskable-512.png',
            //   sizes: '512x512',
            //   type: 'image/png',
            //   purpose: 'maskable',
            // },
          ],
        };
        return new Response(JSON.stringify(manifest), {
          headers: {
            'content-type': 'application/manifest+json; charset=utf-8',
          },
        });
      },
    },
  },
});
