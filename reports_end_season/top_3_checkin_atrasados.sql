SELECT 
  che."userId",
  u."userName",
  COUNT(*) FILTER (WHERE che."isOverdue" = true) AS atrasados,
  COUNT(*) AS total_checkins,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE che."isOverdue" = true) / COUNT(*),
    2
  ) AS percentual_atraso
FROM public."Checkins" che
INNER JOIN public."Challenges" cha ON che."challengeId" = cha.id
inner join public."Users" u on che."userId" = u."userId"
WHERE che.date >= '2025-01-01'::timestamp 
  AND che.date < '2025-04-01'::timestamp
  AND cha."name" = 'idiomas 1º trim 2025'
GROUP BY che."userId", u."userName"
HAVING COUNT(*) FILTER (WHERE che."isOverdue" = true) > 0
ORDER BY atrasados DESC
LIMIT 3;