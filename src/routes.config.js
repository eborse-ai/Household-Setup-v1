/**
 * Single source of truth for app routes.
 * Consumed by router.js (matching, titles) and app (nav maps, nav items).
 *
 * Fields:
 *   path       - URL pattern (use :param for dynamic segments). Logical, no app prefix.
 *   component  - LWC component name (must be registered in app.js ROUTE_COMPONENTS)
 *   title      - Document title (string or (params) => string)
 *   navPage    - Id for nav active state and navigate({ page }) (omit to hide from nav)
 *   navLabel   - Label shown in nav bar and in the Console object switcher
 *   navPath    - Optional; for dynamic routes, path used in nav links (e.g. /users/42)
 *   navHighlight - Optional; nav page id to highlight when this route is active (for child routes that don't create a tab)
 */

export const routes = [
  // Bare /app prefix lands on Household Setup without a duplicate nav tab
  {
    path: '/',
    component: 'page-household-setup',
    title: 'Household Setup',
    navHighlight: 'household-setup',
    app: 'standard',
  },
  // Bare /console prefix lands on Contacts
  {
    path: '/',
    component: 'page-contacts',
    title: 'Contacts',
    navHighlight: 'contacts',
    app: 'console',
  },
  {
    path: '/contacts',
    component: 'page-contacts',
    title: 'Contacts',
    navPage: 'contacts',
    navLabel: 'Contacts',
  },
  {
    path: '/contacts/:id',
    component: 'page-contact-detail',
    title: (params) => `Contact ${params.id}`,
    navHighlight: 'contacts',
  },
  {
    path: '/household-setup',
    component: 'page-household-setup',
    title: 'Household Setup',
    navPage: 'household-setup',
    navLabel: 'Household Setup',
  },
  {
    path: '/',
    component: 'page-builder',
    title: 'Builder',
    app: 'builder',
  },
];
