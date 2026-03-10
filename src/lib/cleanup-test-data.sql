-- ============================================================
-- LIMPEZA DE DADOS DE TESTE — Maandhoo Club
-- Execute no Supabase SQL Editor
-- Remove TODOS os dados inseridos pelo painel admin nos testes
-- ============================================================

-- 1. Validações (depende de ingressos)
DELETE FROM validacoes;

-- 2. Cadastros (depende de ingressos)
DELETE FROM cadastros;

-- 3. Ingressos (depende de eventos/lotes)
DELETE FROM ingressos;

-- 4. Lotes (depende de eventos)
DELETE FROM lotes;

-- 5. Listas de convidados
DELETE FROM listas;

-- 6. Reservas de camarote
DELETE FROM reservas;

-- 7. Camarotes (depende de eventos)
DELETE FROM camarotes;

-- 8. Leads / contatos
DELETE FROM leads;

-- 9. Eventos (por último, pois outros dependem dele)
DELETE FROM eventos;

-- 10. Porteiros de teste (mantém se quiser, comente se preferir remover)
-- DELETE FROM porteiros;

-- Confirmar limpeza
SELECT
  'validacoes'  AS tabela, COUNT(*) AS registros FROM validacoes UNION ALL
SELECT 'cadastros',   COUNT(*) FROM cadastros   UNION ALL
SELECT 'ingressos',   COUNT(*) FROM ingressos   UNION ALL
SELECT 'lotes',       COUNT(*) FROM lotes       UNION ALL
SELECT 'listas',      COUNT(*) FROM listas      UNION ALL
SELECT 'reservas',    COUNT(*) FROM reservas    UNION ALL
SELECT 'camarotes',   COUNT(*) FROM camarotes   UNION ALL
SELECT 'leads',       COUNT(*) FROM leads       UNION ALL
SELECT 'eventos',     COUNT(*) FROM eventos;
