-- CREATE OR REPLACE VIEW reports."challenge" AS
WITH ranked_checkins AS (
    SELECT
        c.username,
        c.challenge_id,
        COUNT(*) AS total_checkins,
        ROW_NUMBER() OVER (PARTITION BY c.challenge_id ORDER BY COUNT(*) DESC) AS rank
    FROM reports.checkins c
    GROUP BY c.username, c.challenge_id
),
user_mais_ativo AS (
    SELECT
        username,
        challenge_id,
        total_checkins
    FROM ranked_checkins
    WHERE rank = 1
),
categorias_por_desafio AS (
    SELECT
        challenge_id,
        STRING_AGG(DISTINCT category, ', ') AS categorias_distintas
    FROM reports.checkins
    GROUP BY challenge_id
),
total_checkin_dia AS (
    SELECT
        challenge_id,
        COUNT(*) AS total_checkin_dia_unico
    FROM reports.user_dia
    GROUP BY challenge_id
),
checkin_stats AS (
    SELECT
        challenge_id,
        COUNT(*) AS total_check_ins_no_periodo,
        COUNT(*) FILTER (WHERE is_overdue) AS total_check_ins_em_atraso,
        COUNT(DISTINCT category) AS categorias_distintas_usadas,
        ROUND(
            COUNT(*)::decimal / NULLIF(COUNT(DISTINCT DATE_TRUNC('month', date)), 0),
            2
        ) AS media_checkins_por_mes,
        CASE MODE() WITHIN GROUP (ORDER BY EXTRACT(DOW FROM date))
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Segunda-feira'
            WHEN 2 THEN 'Terça-feira'
            WHEN 3 THEN 'Quarta-feira'
            WHEN 4 THEN 'Quinta-feira'
            WHEN 5 THEN 'Sexta-feira'
            WHEN 6 THEN 'Sábado'
        END AS dia_semana_mais_ativo
    FROM reports.checkins
    GROUP BY challenge_id
)
SELECT
    c.name,
    cat.categorias_distintas,
    cd.total_checkin_dia_unico,
    cs.total_check_ins_no_periodo,
    cs.total_check_ins_em_atraso,
    cs.categorias_distintas_usadas,
    cs.dia_semana_mais_ativo,
    cs.media_checkins_por_mes,
    u.username AS usuario_mais_ativo,
    u.total_checkins AS total_checkins_usuario_mais_ativo
FROM public."Challenges" c
LEFT JOIN user_mais_ativo u ON c.id = u.challenge_id
LEFT JOIN categorias_por_desafio cat ON c.id = cat.challenge_id
LEFT JOIN total_checkin_dia cd ON c.id = cd.challenge_id
LEFT JOIN checkin_stats cs ON c.id = cs.challenge_id
WHERE c.id IN (4, 5);
