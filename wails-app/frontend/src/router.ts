import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

import CalendarPage from './pages/Calendar.vue';
import InboxPage from './pages/Inbox.vue';
import SettingsPage from './pages/Settings.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'calendar', component: CalendarPage, meta: { title: 'Calendar · Takeoff' } },
  { path: '/inbox', name: 'inbox', component: InboxPage, meta: { title: 'Inbox · Takeoff' } },
  { path: '/settings', name: 'settings', component: SettingsPage, meta: { title: 'Settings · Takeoff' } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    document.title = (to.meta?.title as string) ?? 'Takeoff';
  }
});

export default router;
