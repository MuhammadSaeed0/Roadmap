// Production settings used by `ng build` (see fileReplacements in angular.json).
// Replace the placeholders with your project's values from
// Supabase > Project Settings > API. Only the anon (public) key goes here, never
// the service_role key.
export const environment = {
  production: true,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
};
