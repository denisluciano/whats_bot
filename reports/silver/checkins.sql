-- create or replace view reports."checkins" as
select
    u."userName" as username,
    u."userId" as user_id,
    che.category as category,
    che.date as date,
    che."isOverdue" as is_overdue,
    cha."groupId" as group_id,
    cha.name as challenge_name,
    che."challengeId" as challenge_id

FROM public."Checkins" che
INNER JOIN public."Challenges" cha ON che."challengeId" = cha.id
inner join public."Users" u on che."userId" = u."userId"