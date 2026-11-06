# Tonight in Sports

A responsive personal sports dashboard with daily cached context, saved favorites, league filters, a top-five mini scoreboard, YouTube TV multiview recommendations, and close-finish alerts. No AI API calls or paid sports keys.

## Hosting layout

- `docs/`: static frontend for GitHub Pages.
- `supabase/functions/tonight-in-sports-icehogs/`: read-only public schedule bridge for Rockford IceHogs.
- GitHub Pages publishes the `docs/` folder from the main branch.

No Supabase database, user table or authentication is required for this version. Favorites remain browser-local. Accounts or cross-device preference sync can be added later.

## Deployment steps

1. Use a dedicated GitHub repository. Free GitHub Pages requires a public repository. This makes the website and its source publicly readable; saved browser preferences are never committed.
2. Deploy the Supabase `tonight-in-sports-icehogs` Edge Function with JWT verification enabled, as declared in `supabase/config.toml`. The function serves public sports data only and accepts no arbitrary upstream URL. It uses a one-minute cache in each running instance.
3. Set `docs/config.js` to the returned function URL. The legacy anon key in config.js is intended public browser configuration for gateway authentication. Never include a service-role key or database password.
4. Set repository Pages source to Deploy from a branch, select main and /docs, and save. Confirm a successful deployment before sharing its returned URL.

ESPN requests go directly to its public scoreboards. Live mode defaults OFF; when ON it refreshes only while the tab is visible, at most once a minute. Pregame context stays cached. Free upstream feeds may change or fail; missing data is labeled, and no mock results are substituted.

The Supabase function currently allows the account's GitHub Pages origin `https://zlarson630-cmyk.github.io` plus local preview origins. Update the allowlist if hosting elsewhere.
