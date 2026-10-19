import { defineConfig } from '@neon/config/v1';

export default defineConfig({
  buckets: {
    'car-images': { access: 'public_read' },
  },
});
