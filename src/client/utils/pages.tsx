export const Pages = {
  INDEX: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNTS: '/accounts',
  STORE_SETTINGS: '/store-settings',
};

export const AuthenticatedPages: { [key: string]: string } = {
  DASHBOARD: '/dashboard',
  INDEX: '/',
  STORE_SETTINGS: '/store-settings',
};

export const Titles: { [key: string]: string } = {
  HOME: 'Sales Tracker',
  '/': 'Sales Dashboard',
  '/dashboard': 'Sales Dashboard',
  '/login': 'Login',
  register: 'Register',
  '/store-settings': 'Online Store Settings',
};
