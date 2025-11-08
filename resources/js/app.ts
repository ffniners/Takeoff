import './bootstrap';
import '../css/app.css';

import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { createPinia } from 'pinia';

const appName = 'Takeoff Scheduler';

createInertiaApp({
  title: (title) => (title ? `${title} • ${appName}` : appName),
  resolve: async (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue');
    const importPage = pages[`./Pages/${name}.vue`];
    if (!importPage) {
      throw new Error(`Page not found: ${name}`);
    }
    const page = await importPage();
    return page.default;
  },
  setup({ el, App, props, plugin }) {
    const pinia = createPinia();
    const vueApp = createApp({ render: () => h(App, props) });

    vueApp.use(plugin);
    vueApp.use(pinia);

    vueApp.mount(el);
  },
  progress: {
    color: '#6366f1',
  },
});
