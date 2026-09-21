-- Phase 1.5 vote board: per-feature tallies and pay intent.
--
-- The modal asks two things and stores both as counters, never per person:
--   feature_votes  one row per feature, incremented by each vote
--   pay_intent     one row per answer (yes / maybe / no), incremented likewise
--
-- Nothing here identifies anyone: no IP, no session, no email. An address is
-- only ever stored when someone asks to be notified, in notify_signups
-- (20260919000000_notify_signups.sql).
--
-- Access: the Next.js route /api/votes calls public.record_probe() with the
-- secret (service-role) key. Row-level security is on with no policies, so the
-- publishable key can neither read nor write these tables. Tallies reach the
-- browser only in the response to a vote, which is why the board can keep them
-- hidden until someone has voted.

create table if not exists public.feature_votes (
  feature text primary key
    check (feature in ('backup', 'templates', 'formatting', 'equations', 'merge', 'share')),
  votes integer not null default 0 check (votes >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.pay_intent (
  answer text primary key check (answer in ('yes', 'maybe', 'no')),
  responses integer not null default 0 check (responses >= 0),
  updated_at timestamptz not null default now()
);

alter table public.feature_votes enable row level security;
alter table public.pay_intent enable row level security;
revoke all on table public.feature_votes from anon, authenticated;
revoke all on table public.pay_intent from anon, authenticated;

-- Every feature has a row from the start, so the board can show a full list
-- (including the ones nobody has voted for yet) after the first vote.
insert into public.feature_votes (feature)
values ('backup'), ('templates'), ('formatting'), ('equations'), ('merge'), ('share')
on conflict (feature) do nothing;

insert into public.pay_intent (answer)
values ('yes'), ('maybe'), ('no')
on conflict (answer) do nothing;

-- Record a vote, a pay answer, or both, and return the current tallies.
-- Either argument may be empty: the pay chips are answered after the vote, in
-- a second call.
create or replace function public.record_probe(p_features text[], p_pay text)
returns table (feature text, votes integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_features is not null and cardinality(p_features) > 0 then
    insert into public.feature_votes as fv (feature, votes)
    select f, 1 from unnest(p_features) as f
    on conflict (feature) do update
      set votes = fv.votes + 1,
          updated_at = now();
  end if;

  if p_pay is not null and p_pay <> '' then
    insert into public.pay_intent as pi (answer, responses)
    values (p_pay, 1)
    on conflict (answer) do update
      set responses = pi.responses + 1,
          updated_at = now();
  end if;

  return query
    select fv.feature, fv.votes
    from public.feature_votes fv
    order by fv.votes desc, fv.feature;
end;
$$;

revoke all on function public.record_probe(text[], text) from public, anon, authenticated;
grant execute on function public.record_probe(text[], text) to service_role;
