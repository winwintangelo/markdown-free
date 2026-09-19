-- Phase 1.5 "notify me" signups from the coming-features teaser.
--
-- One row per email address (stored lowercase) with every feature it asked
-- about. Nothing is emailed at signup; the launch email for a feature carries
-- a one-click unsubscribe, which sets unsubscribed_at.
--
-- Retention (privacy page): delete a row once all of its features have
-- shipped and been announced, or 12 months after updated_at, whichever comes
-- first.
--
-- Access: the Next.js route /api/notify calls public.notify_signup() with the
-- secret (service-role) key. Row-level security is on with no policies, so the
-- publishable key that the Vercel integration also exposes can neither read
-- nor write this table.

create table if not exists public.notify_signups (
  email text primary key
    check (email = lower(email) and char_length(email) between 3 and 254),
  features text[] not null
    check (
      cardinality(features) between 1 and 6
      and features <@ array['backup', 'templates', 'formatting', 'equations', 'merge', 'share']::text[]
    ),
  locale text not null
    check (locale in ('en', 'it', 'es', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'id', 'vi', 'hi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.notify_signups enable row level security;
revoke all on table public.notify_signups from anon, authenticated;

-- Insert a signup, or merge new features into the existing row. A fresh
-- signup after an unsubscribe is a new explicit request, so it re-subscribes.
create or replace function public.notify_signup(p_email text, p_features text[], p_locale text)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.notify_signups (email, features, locale)
  values (lower(p_email), p_features, p_locale)
  on conflict (email) do update
    set features = (
          select array_agg(distinct f order by f)
          from unnest(public.notify_signups.features || excluded.features) as f
        ),
        locale = excluded.locale,
        updated_at = now(),
        unsubscribed_at = null;
$$;

revoke all on function public.notify_signup(text, text[], text) from public, anon, authenticated;
grant execute on function public.notify_signup(text, text[], text) to service_role;
