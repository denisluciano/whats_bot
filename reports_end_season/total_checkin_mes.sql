SELECT 
	DATE_TRUNC('month', date) AS mes,
	COUNT(*) as total_checkin
FROM public."Checkins" che
inner join public."Challenges" cha on che."challengeId" = cha.id
WHERE 
	date >= '2025-01-01'::timestamp 
	AND date < '2025-04-01'::timestamp
	and cha."name" = 'idiomas 1º trim 2025'
GROUP BY mes
ORDER BY mes;
