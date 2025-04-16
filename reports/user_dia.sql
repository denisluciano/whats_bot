-- CREATE OR REPLACE VIEW reports.user_dia AS
CREATE OR REPLACE VIEW reports.user_dia AS
SELECT
    username,
    user_id,
    challenge_id,
    challenge_name,
    group_id,
    (date AT TIME ZONE 'America/Sao_Paulo')::date AS date,

    MIN(category) AS category, -- pode ser qualquer uma do dia
    MAX(is_overdue::int)::boolean AS is_overdue, -- se teve algum em atraso, conta como true
    count(*) as numero_categorias_distintas

FROM reports.checkins
GROUP BY
    username,
    user_id,
    challenge_id,
    challenge_name,
    group_id,
    (date AT TIME ZONE 'America/Sao_Paulo')::date
