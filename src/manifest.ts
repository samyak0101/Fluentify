import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Fluentify — Learn Languages While You Browse',
  version: '1.0.0',
  description:
    'Transform any webpage into a language lesson. Learn vocabulary naturally through immersion, spaced repetition, and audio.',

  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },

  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
    },
  },

  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],

  permissions: ['storage', 'activeTab', 'tts', 'alarms'],

  options_page: 'src/options/index.html',

  web_accessible_resources: [
    {
      resources: ['data/frequencies/*.json'],
      matches: ['<all_urls>'],
    },
  ],
});
