SELECT 
	 category,
  COUNT(*) AS total_checkins
FROM public."Checkins" che
inner join public."Challenges" cha on che."challengeId" = cha.id
WHERE 
	date >= '2025-01-01'::timestamp 
	AND date < '2025-04-01'::timestamp
	and cha."name" = 'idiomas 1º trim 2025'
GROUP BY category
ORDER BY total_checkins DESC;
