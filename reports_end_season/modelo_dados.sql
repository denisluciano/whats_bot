select
    u."userName",
    u."userId",
    che.category,
    che.date,
    che."isOverdue",
    cha."groupId",
    cha.name

FROM public."Checkins" che
INNER JOIN public."Challenges" cha ON che."challengeId" = cha.id
inner join public."Users" u on che."userId" = u."userId"
where
    "cha".name = 'idiomas 1º trim 2025'