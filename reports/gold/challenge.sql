-- create or replace view reports."challenge" as
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
)

SELECT
    c.challenge_id,
    c.challenge_name,

    COUNT(*) AS total_check_ins_no_periodo,

    COUNT(*) FILTER (WHERE c.is_overdue) AS total_check_ins_em_atraso,

    COUNT(DISTINCT c.category) AS categorias_distintas_usadas,

    cat.categorias_distintas,

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

    u.username AS usuario_mais_ativo,
    u.total_checkins AS total_checkins_usuario_mais_ativo

FROM reports.checkins c
LEFT JOIN user_mais_ativo u ON u.challenge_id = c.challenge_id
LEFT JOIN categorias_por_desafio cat ON cat.challenge_id = c.challenge_id
where
    c.challenge_id in (4,5)
GROUP BY
    c.challenge_id,
    c.challenge_name,
    u.username,
    u.total_checkins,
    cat.categorias_distintas
