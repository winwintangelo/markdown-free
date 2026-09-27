-- Feedback v2 (2026-09-27): a one-choice vote board with new choices, private
-- typed suggestions, and "notify me" for the new features.
--
-- 1. feature_votes accepts the new choices. "backup" stays allowed so its old
--    counter keeps its history; the board no longer offers it (it was split
--    into "recover", local to the browser, and "account", stored online).
--    "other" and "nothing" count the two extra answers on the board.
-- 2. notify_signups accepts the new features.
-- 3. feature_ideas stores what people type into a feedback box: the text for
--    "Something else", the answer to "What do you do today when you need
--    this?", and "Suggest an improvement". One row per message, with no email,
--    IP or session. Retention (privacy page): delete a row 12 months after
--    created_at.
--
-- Access, as before: the Next.js routes call the functions with the secret
-- (service-role) key. Row-level security is on with no policies.

alter table public.feature_votes drop constraint if exists feature_votes_feature_check;
alter table public.feature_votes add constraint feature_votes_feature_check
  check (feature in (
    'backup', 'formatting', 'equations', 'templates', 'large', 'recover', 'account', 'merge', 'share',
    'other', 'nothing'
  ));

insert into public.feature_votes (feature)
values ('large'), ('recover'), ('account'), ('other'), ('nothing')
on conflict (feature) do nothing;

alter table public.notify_signups drop constraint if exists notify_signups_features_check;
alter table public.notify_signups add constraint notify_signups_features_check
  check (
    cardinality(features) between 1 and 16
    and features <@ array[
      'backup', 'formatting', 'equations', 'templates', 'large', 'recover', 'account', 'merge', 'share'
    ]::text[]
  );

create table if not exists public.feature_ideas (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('other', 'workaround', 'suggestion')),
  feature text check (
    feature is null
    or feature in ('formatting', 'equations', 'templates', 'large', 'recover', 'account', 'merge', 'share')
  ),
  body text not null check (char_length(body) between 1 and 200),
  locale text not null
    check (locale in ('en', 'it', 'es', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'id', 'vi', 'hi')),
  created_at timestamptz not null default now()
);

alter table public.feature_ideas enable row level security;
revoke all on table public.feature_ideas from anon, authenticated;

create or replace function public.save_idea(p_kind text, p_feature text, p_body text, p_locale text)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.feature_ideas (kind, feature, body, locale)
  values (p_kind, nullif(p_feature, ''), p_body, p_locale);
$$;

revoke all on function public.save_idea(text, text, text, text) from public, anon, authenticated;
grant execute on function public.save_idea(text, text, text, text) to service_role;
