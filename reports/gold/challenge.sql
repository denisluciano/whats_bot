create or replace view reports."challenge" as
SELECT
    c.challenge_id,
    c.challenge_name,
    
    COUNT(*) AS total_check_ins,

    COUNT(*) FILTER (WHERE c.is_overdue) AS total_check_ins_em_atraso,

    COUNT(DISTINCT c.category) AS categorias_distintas_usadas,

    -- Dia da semana mais ativo (segunda, terça, etc)
    CASE MODE() WITHIN GROUP (ORDER BY EXTRACT(DOW FROM c.date))
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END AS dia_semana_mais_ativo,

    -- Média de check-ins por mês
    ROUND(
        COUNT(*)::decimal / COUNT(DISTINCT DATE_TRUNC('month', c.date)),
        2
    ) AS media_checkins_por_mes,

    -- Usuário com mais check-ins
    (
        SELECT c2.username
        FROM reports.checkins c2
        WHERE c2.challenge_id = c.challenge_id
        GROUP BY c2.username
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) AS user_mais_ativo,

    (
        SELECT COUNT(*)
        FROM reports.checkins c2
        WHERE c2.challenge_id = c.challenge_id
        GROUP BY c2.username
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ) AS total_user_mais_ativo

FROM reports.checkins c
GROUP BY c.challenge_id, c.challenge_name
ORDER BY total_check_ins DESC;
