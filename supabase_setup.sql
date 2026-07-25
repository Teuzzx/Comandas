-- ============================================
-- CONFIGURACAO DO SUPABASE - Rode no SQL Editor
-- ============================================

-- Apaga as tabelas se existirem (pra recomecar)
DROP TABLE IF EXISTS app_data;
DROP TABLE IF EXISTS users;

-- Cria tabela de dados da aplicacao (chave-valor JSON)
CREATE TABLE app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Cria tabela de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Garcom',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRIA POLICIES DE ACESSO PUBLICO (anon key)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_data_all" ON app_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "users_all" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- DADOS INICIAIS

-- Admin padrao: admin@admin.com / admin123
INSERT INTO users (username, password, name, role)
VALUES ('admin@admin.com', 'admin123', 'Administrador', 'Gerente');

-- 12 mesas
INSERT INTO app_data (key, value)
VALUES ('mesas', (
  SELECT jsonb_agg(
    jsonb_build_object('id', i, 'status', 'livre', 'total', 0, 'pedidos', '[]'::jsonb)
  )
  FROM generate_series(1, 12) AS i
));

-- Produtos
INSERT INTO app_data (key, value)
VALUES ('produtos', '[
  {"id": 1, "nome": "Pizza Calabresa", "preco": 45.00},
  {"id": 2, "nome": "Pizza 4 Queijos", "preco": 55.00},
  {"id": 3, "nome": "X-Burger", "preco": 32.00},
  {"id": 4, "nome": "Batata Frita", "preco": 15.00},
  {"id": 5, "nome": "Coca-Cola", "preco": 8.00}
]'::jsonb);

-- Estoque
INSERT INTO app_data (key, value)
VALUES ('estoque', '[
  {"id": 1, "nome": "Massa de Pizza", "qtd": 50, "min": 10, "unidade": "un"},
  {"id": 2, "nome": "Queijo Mucarela", "qtd": 20, "min": 5, "unidade": "kg"},
  {"id": 3, "nome": "Molho de Tomate", "qtd": 15, "min": 3, "unidade": "L"},
  {"id": 4, "nome": "Calabresa", "qtd": 10, "min": 2, "unidade": "kg"},
  {"id": 5, "nome": "Pao de Hamburguer", "qtd": 40, "min": 10, "unidade": "un"},
  {"id": 6, "nome": "Carne (Blend)", "qtd": 15, "min": 5, "unidade": "kg"}
]'::jsonb);

-- Arrays vazios
INSERT INTO app_data (key, value) VALUES ('vendas', '[]'::jsonb);
INSERT INTO app_data (key, value) VALUES ('pedidos', '[]'::jsonb);
INSERT INTO app_data (key, value) VALUES ('funcionarios', '[]'::jsonb);
INSERT INTO app_data (key, value) VALUES ('audit_logs', '[]'::jsonb);
INSERT INTO app_data (key, value) VALUES ('estoque_movimentos', '[]'::jsonb);
