-- ================================================
-- TABELA: demo_leads
-- Leads capturados pela demo interativa Creativ AI
-- Execute no SQL Editor do Supabase
-- ================================================

CREATE TABLE IF NOT EXISTS public.demo_leads (
    id                              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at                      TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Dados de contato
    nome                            TEXT,
    email                           TEXT,
    empresa                         TEXT,

    -- Perfil da operação
    setor                           TEXT,   -- logistica, mineracao, utilities, sucroenergetico, florestal, construcao
    tipo_veiculo                    TEXT,   -- caminhao_pesado, maquinario_pesado, frota_leve, vuc
    quantidade_veiculos             INTEGER,
    km_por_mes                      INTEGER,
    turnos                          INTEGER,

    -- Maturidade e desafio
    usa_telemetria                  TEXT,   -- nao, basico, avancado
    acidentes_6meses                TEXT,   -- nenhum, 1_a_5, 6_a_15, mais_de_15
    desafio_principal               TEXT,   -- acidentes, combustivel, compliance, produtividade

    -- Contexto comercial
    regiao                          TEXT,   -- Sudeste, Sul, Centro-Oeste, Norte, Nordeste
    frota_propria                   TEXT,   -- propria, terceirizada, propria_e_terceirizada
    tem_meta_acidentes              TEXT,   -- sim, nao

    -- Scores calculados (0-100)
    score_risco                     INTEGER,
    score_eficiencia                INTEGER,
    score_compliance                INTEGER,
    score_produtividade             INTEGER,

    -- Estimativas geradas pela IA
    economia_estimada_mes           NUMERIC(12,2),
    reducao_acidentes_estimada_pct  INTEGER,

    -- Rastreamento
    fonte                           TEXT DEFAULT 'demo-creativ-ia'
);

-- Índices para consultas do painel de vendas
CREATE INDEX IF NOT EXISTS idx_demo_leads_setor      ON public.demo_leads(setor);
CREATE INDEX IF NOT EXISTS idx_demo_leads_score      ON public.demo_leads(score_risco DESC);
CREATE INDEX IF NOT EXISTS idx_demo_leads_created    ON public.demo_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_leads_empresa    ON public.demo_leads(empresa);

-- Segurança: somente backend acessa (service role key)
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- ⚠️ IMPORTANTE: Esta policy permite que a demo insira leads via ANON key
-- (necessário para a demo estática funcionar без backend)
CREATE POLICY "Allow anonymous inserts on demo_leads"
    ON public.demo_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);
