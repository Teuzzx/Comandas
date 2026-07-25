/**
 * Core Application - SPA Router & Initialization
 */
window.PAGE_TEMPLATES = {
    dashboard: `<div class="fade-in">
    <header class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Bem-vindo de volta! Aqui está o resumo de hoje.</p>
    </header>
    <div class="card dashboard-toolbar">
        <div class="dashboard-filters">
            <span class="dashboard-filter-label">Per\u00edodo:</span>
            <input type="date" id="filterFrom">
            <input type="date" id="filterTo">
            <button class="btn" id="btnToday">Hoje</button>
            <button class="btn" id="btn7Days">7 Dias</button>
            <button class="btn" id="btn30Days">30 Dias</button>
        </div>
        <div class="dashboard-actions">
            <div id="lowStockAlert" class="dashboard-alert">
                <i class="fas fa-bell"></i>
                <span id="lowStockCount" class="dashboard-alert-count">0</span>
            </div>
            <button class="btn-primary" id="btnRefreshDashboard">Atualizar</button>
        </div>
    </div>
    <div class="stats-grid">
        <div class="card stat-card" data-aos="fade-up" data-aos-delay="100">
            <div class="stat-icon" style="background: rgba(46, 204, 113, 0.1); color: var(--success);"><i class="fas fa-dollar-sign"></i></div>
            <div class="stat-info"><h3>Faturamento do Dia</h3><p class="stat-value" id="statFaturamento">R$ 0,00</p></div>
        </div>
        <div class="card stat-card" data-aos="fade-up" data-aos-delay="200">
            <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: var(--info);"><i class="fas fa-shopping-cart"></i></div>
            <div class="stat-info"><h3>Pedidos Ativos</h3><p class="stat-value" id="statPedidos">0</p></div>
        </div>
        <div class="card stat-card" data-aos="fade-up" data-aos-delay="300">
            <div class="stat-icon" style="background: rgba(241, 196, 15, 0.1); color: var(--warning);"><i class="fas fa-chair"></i></div>
            <div class="stat-info"><h3>Mesas Ocupadas</h3><p class="stat-value" id="statMesas">0 / 0</p></div>
        </div>
        <div class="card stat-card" data-aos="fade-up" data-aos-delay="400">
            <div class="stat-icon" style="background: rgba(231, 76, 60, 0.1); color: var(--danger);"><i class="fas fa-fire"></i></div>
            <div class="stat-info"><h3>Em Preparo</h3><p class="stat-value" id="statPreparo">0</p></div>
        </div>
    </div>
    <div class="charts-grid">
        <div class="card chart-container" data-aos="fade-right">
            <div class="chart-header"><h3>Vendas por Dia</h3></div>
            <canvas id="vendasChart"></canvas>
        </div>
        <div class="card chart-container" data-aos="fade-left">
            <div class="chart-header"><h3>Produtos Mais Vendidos</h3></div>
            <canvas id="produtosChart"></canvas>
        </div>
    </div>
    <div class="card" data-aos="fade-up">
        <div class="chart-header flex-between"><h3>\u00daltimos Pedidos</h3><button class="btn-primary" onclick="App.loadPage('pedidos')">Ver Todos</button></div>
        <div class="table-responsive">
            <table class="dashboard-table"><thead><tr><th>ID</th><th>Mesa</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead><tbody id="recentOrdersTable"></tbody></table>
        </div>
    </div>
</div>`,

    comandas: `<div class="fade-in">
    <header class="flex-between" style="margin-bottom: 30px;">
        <div><h1 class="dashboard-title">Mapa de Mesas</h1><p class="dashboard-subtitle">Gerencie as mesas e comandas em tempo real.</p></div>
        <div class="flex-center" style="gap: 15px;">
            <div class="flex-center" style="gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: var(--success);"></span><span style="font-size: 0.8rem; color: var(--text-muted);">Livre</span></div>
            <div class="flex-center" style="gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: var(--danger);"></span><span style="font-size: 0.8rem; color: var(--text-muted);">Ocupada</span></div>
            <div class="flex-center" style="gap: 8px;"><span style="width: 12px; height: 12px; border-radius: 50%; background: var(--warning);"></span><span style="font-size: 0.8rem; color: var(--text-muted);">Pedindo Conta</span></div>
        </div>
    </header>
    <div class="mesas-grid" id="mesasGrid"></div>
    <div class="modal" id="mesaModal">
        <div class="modal-content glass">
            <div class="modal-header"><h2><i class="fas fa-utensils"></i> <span id="modalMesaTitle">Mesa</span></h2><button class="modal-close" onclick="Comandas.fecharModal()">&times;</button></div>
            <div id="modalMesaBody">
                    <div class="form-group">
                        <label>Adicionar Produto</label>
                        <div style="display:flex;gap:10px">
                            <select id="selectProduto" style="flex:1"><option value="">Carregando...</option></select>
                            <button class="btn-primary" onclick="Comandas.addItem()"><i class="fas fa-plus"></i> Adicionar</button>
                        </div>
                        <div style="margin-top:8px">
                            <input id="itemObservacao" placeholder="Observa\u00e7\u00e3o (ex: Sem cebola, ponto mal passado...)" style="width:100%;padding:10px 14px;border-radius:10px;background:var(--bg-input);border:1px solid var(--glass-border);color:#fff;font-size:0.85rem">
                        </div>
                        <div id="bordaSection" style="display:none;margin-top:10px;padding:14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--glass-border)">
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                                <input type="checkbox" id="itemBordaCheck" onchange="Comandas.toggleBorda()" style="width:18px;height:18px;accent-color:var(--primary-color)">
                                <label for="itemBordaCheck" style="font-size:0.85rem;font-weight:600;cursor:pointer">Borda Recheada</label>
                            </div>
                            <div id="bordaFlavorSection" style="display:none">
                                <label style="font-size:0.78rem;color:var(--text-muted);display:block;margin-bottom:4px">Sabor da Borda</label>
                                <select id="itemBordaSabor" style="width:100%;padding:10px 14px;border-radius:10px;background:var(--bg-input);border:1px solid var(--glass-border);color:#fff;font-size:0.85rem">
                                    <option value="catupiry">Catupiry</option>
                                    <option value="cheddar">Cheddar</option>
                                    <option value="cream cheese">Cream Cheese</option>
                                    <option value="requeijao">Requeij\u00e3o</option>
                                    <option value="provolone">Provolone</option>
                                    <option value="chocolate">Chocolate</option>
                                </select>
                            </div>
                        </div>
                    </div>
                <div style="margin:16px 0;max-height:300px;overflow-y:auto" id="orderItemsList"></div>
                <div style="background:var(--bg-input);border-radius:12px;padding:16px;margin-top:8px">
                    <div class="flex-between" style="margin-bottom:8px"><span style="font-size:1rem;font-weight:600;color:var(--text-muted)">Total da Mesa</span><span id="modalTotal" style="font-size:1.5rem;font-weight:800;color:var(--success)">R$ 0,00</span></div>
                </div>
                <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
                    <button class="btn-primary" style="flex:1;min-width:140px;background:var(--info)" onclick="Comandas.enviarCozinha()"><i class="fas fa-fire"></i> Enviar Cozinha</button>
                    <button class="btn-primary" style="flex:1;min-width:140px;background:var(--warning);color:var(--text-dark)" onclick="Comandas.pedirConta()"><i class="fas fa-receipt"></i> Pedir Conta</button>
                    <button class="btn-primary" style="flex:1;min-width:140px;background:var(--danger)" onclick="Comandas.limparMesa()"><i class="fas fa-trash"></i> Limpar</button>
                </div>
            </div>
        </div>
    </div>
</div>`,

    pedidos: `<div class="fade-in">
    <header class="dashboard-header"><h1 class="dashboard-title">Pedidos</h1><p class="dashboard-subtitle">Lista completa de todos os pedidos realizados.</p></header>
    <div id="pedidosList"></div>
</div>`,

    produtos: `<div class="fade-in">
    <header class="flex-between" style="margin-bottom: 30px;">
        <div><h1 class="dashboard-title">Card\u00e1pio</h1><p class="dashboard-subtitle">Gerencie os produtos do seu card\u00e1pio.</p></div>
        <div style="display:flex;align-items:center;gap:10px">
            <button class="btn-primary" onclick="Produtos.abrirModal()"><i class="fas fa-plus"></i> Novo Produto</button>
        </div>
    </header>
    <div class="card">
        <table style="width:100%;border-collapse:collapse">
            <thead><tr style="text-align:left;color:var(--text-muted);border-bottom:1px solid var(--glass-border)">
                <th style="padding:15px;">Produto</th><th style="padding:15px;">Categoria</th><th style="padding:15px;">Pre\u00e7o</th><th style="padding:15px;">Descri\u00e7\u00e3o</th><th style="padding:15px;">A\u00e7\u00f5es</th>
            </tr></thead>
            <tbody id="produtosTable"></tbody>
        </table>
    </div>
    <div id="produtoModal" class="modal" style="display:none;">
        <div class="modal-content glass">
            <div class="modal-header"><h2 id="produtoModalTitle">Novo Produto</h2><button class="modal-close" onclick="Produtos.fecharModal()">&times;</button></div>
            <form id="produtoForm">
                <input type="hidden" id="produtoId">
                <div class="form-group"><label>Nome do Produto</label><input id="produtoNome" required placeholder="Ex: Pizza Calabresa"></div>
                <div class="form-group"><label>Pre\u00e7o (R$)</label><input id="produtoPreco" type="number" step="0.01" required placeholder="0.00"></div>
                <div class="form-group"><label>Categoria</label>
                    <select id="produtoCategoria">
                        <option value="pizza">Pizza</option>
                        <option value="lanche">Lanche</option>
                        <option value="porcao">Por\u00e7\u00e3o</option>
                        <option value="bebida">Bebida</option>
                        <option value="principal">Principal</option>
                        <option value="sobremesa">Sobremesa</option>
                    </select>
                </div>
                <div class="form-group"><label>Descri\u00e7\u00e3o</label><textarea id="produtoDesc" rows="2" placeholder="Ex: Molho especial, calabresa, cebola e mussarela."></textarea></div>
                <div class="modal-footer">
                    <button type="button" class="btn" onclick="Produtos.fecharModal()">Cancelar</button>
                    <button type="button" class="btn-primary" onclick="Produtos.salvar()">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</div>`,
    cozinha: `<div class="fade-in">
    <header class="flex-between" style="margin-bottom: 30px;">
        <div><h1 class="dashboard-title">Cozinha</h1><p class="dashboard-subtitle">Gerenciamento de pedidos em tempo real.</p></div>
        <div class="flex-center" style="gap: 10px;"><span id="pedidoCount" class="badge" style="background: var(--primary-color); padding: 8px 15px; border-radius: 20px;">3 Pedidos Ativos</span></div>
    </header>
    <div class="cozinha-grid" id="cozinhaGrid"></div>
</div>`,

    caixa: `<div class="fade-in">
    <header class="dashboard-header"><h1 class="dashboard-title">Caixa</h1><p class="dashboard-subtitle">Fechamento de contas e recebimentos.</p></header>
    <div id="resumoCaixa"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <div>
            <div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:16px"><i class="fas fa-list"></i> Contas Pendentes</h3><div id="caixaList"></div></div>
        </div>
        <div class="card checkout-card glass" id="checkoutArea" style="display:none">
            <h3 style="margin-bottom:16px"><i class="fas fa-cash-register"></i> <span id="checkoutTitle">Finalizar Venda</span></h3>
            <div id="checkoutDetails"></div>
            <div style="margin-top:16px">
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-muted);margin-bottom:8px">Forma de Pagamento</label>
                <div class="payment-methods">
                    <button class="payment-btn active" data-method="pix" onclick="Caixa.setPayment('pix')"><i class="fas fa-qrcode"></i> PIX</button>
                    <button class="payment-btn" data-method="dinheiro" onclick="Caixa.setPayment('dinheiro')"><i class="fas fa-money-bill-wave"></i> Dinheiro</button>
                    <button class="payment-btn" data-method="cartao" onclick="Caixa.setPayment('cartao')"><i class="fas fa-credit-card"></i> Cart\u00e3o</button>
                    <button class="payment-btn" data-method="debito" onclick="Caixa.setPayment('debito')"><i class="fas fa-credit-card"></i> D\u00e9bito</button>
                </div>
            </div>
            <div class="form-group"><label>Desconto (R$)</label><input type="number" id="inputDesconto" value="0" oninput="Caixa.calculateTotal()" style="width:120px"></div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--glass-border)">
                <div class="flex-between" style="margin-bottom:8px;font-size:0.9rem"><span style="color:var(--text-muted)">Subtotal</span><span id="checkoutSubtotal">R$ 0,00</span></div>
                <div class="flex-between" style="margin-bottom:16px;font-size:1.3rem;font-weight:800"><span>Total</span><span id="checkoutTotal" style="color:var(--success)">R$ 0,00</span></div>
                <button class="btn-success" style="width:100%;padding:14px" onclick="Caixa.finalizarVenda()"><i class="fas fa-check"></i> Finalizar Venda</button>
            </div>
        </div>
    </div>
</div>`,

    estoque: `<div class="fade-in">
    <header class="flex-between" style="margin-bottom: 30px; gap: 12px;">
        <div><h1 class="dashboard-title">Estoque</h1><p class="dashboard-subtitle">Controle de insumos e mercadorias.</p></div>
        <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn" onclick="Estoque.exportToExcel()">Exportar Excel</button>
            <button class="btn" onclick="Estoque.exportToPDF()">Exportar PDF</button>
            <button class="btn-primary" onclick="Estoque.openModal()">+ Novo Item</button>
        </div>
    </header>
    <div class="card">
        <table style="width: 100%; border-collapse: collapse;">
            <thead><tr style="text-align: left; color: var(--text-muted); border-bottom: 1px solid var(--glass-border);">
                <th style="padding: 15px;">Item</th><th style="padding: 15px;">Qtd Atual</th><th style="padding: 15px;">Qtd M\u00ednima</th><th style="padding: 15px;">Fornecedor</th><th style="padding: 15px;">Status</th><th style="padding: 15px;">A\u00e7\u00f5es</th>
            </tr></thead>
            <tbody id="estoqueTable"></tbody>
        </table>
    </div>
    <div id="estoqueModal" class="modal" style="display:none;">
        <div class="modal-content glass">
            <h3 id="modalTitle">Novo Item</h3>
            <form id="estoqueForm">
                <input type="hidden" id="itemId">
                <div style="margin-top:10px;"><label>Nome do item</label><input id="itemNome" required placeholder="Ex: Queijo Mu\u00e7arela"></div>
                <div style="display:flex; gap:8px; margin-top:10px;">
                    <div style="flex:1;"><label>Quantidade</label><input id="itemQtd" type="number" step="any" required></div>
                    <div style="width:120px;"><label>Unidade</label><input id="itemUnidade" placeholder="un"></div>
                    <div style="width:160px;"><label>Qtd M\u00ednima</label><input id="itemMin" type="number" step="any" required></div>
                </div>
                <div style="margin-top:10px;"><label>Fornecedor</label><input id="itemFornecedor" placeholder="Ex: Distribuidora ABC"></div>
                <div style="display:flex; gap:8px; margin-top:16px; justify-content:flex-end;">
                    <button type="button" class="btn" onclick="Estoque.closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar</button>
                </div>
            </form>
        </div>
    </div>
    <div id="baixaModal" class="modal" style="display:none;">
        <div class="modal-content glass">
            <h3>Dar Baixa</h3>
            <div><label>Quantidade usada</label><input id="baixaQtd" type="number" step="any" value="1"></div>
            <div style="display:flex; gap:8px; margin-top:12px; justify-content:flex-end;">
                <button class="btn" onclick="Estoque.closeBaixa()">Cancelar</button>
                <button class="btn-primary" onclick="Estoque.confirmBaixa()">Confirmar</button>
            </div>
        </div>
    </div>
</div>`,

    funcionarios: `<div class="fade-in">
    <header class="flex-between" style="margin-bottom: 30px;">
        <div><h1 class="dashboard-title">Funcion\u00e1rios</h1><p class="dashboard-subtitle">Gest\u00e3o de equipe e permiss\u00f5es.</p></div>
        <button class="btn-primary" onclick="Funcionarios.openModal()">+ Novo Funcion\u00e1rio</button>
    </header>
    <div id="funcionariosList" class="stats-grid"></div>
</div>`,

    relatorios: `<div class="fade-in">
    <div class="report-header flex-between" style="margin-bottom: 30px; gap: 15px; flex-wrap: wrap;">
        <div><h1 class="dashboard-title">Relat\u00f3rios</h1><p class="dashboard-subtitle">An\u00e1lise de desempenho e vendas.</p></div>
        <div class="export-buttons">
            <button class="btn-primary" onclick="Relatorios.export('excel')"><i class="fas fa-file-excel"></i> Exportar Excel</button>
            <button class="btn-primary btn-danger" onclick="Relatorios.export('pdf')"><i class="fas fa-file-pdf"></i> Exportar PDF</button>
        </div>
    </div>
    <div class="report-kpis stats-grid">
        <div class="card stat-card"><h3>Total de Vendas</h3><p class="stat-value" id="relatorioTotalVendas">R$ 0,00</p></div>
        <div class="card stat-card"><h3>Ticket M\u00e9dio</h3><p class="stat-value" id="relatorioTicketMedio">R$ 0,00</p></div>
        <div class="card stat-card"><h3>Pedidos Registrados</h3><p class="stat-value" id="relatorioTotalPedidos">0</p></div>
        <div class="card stat-card"><h3>Produtos Vendidos</h3><p class="stat-value" id="relatorioProdutosVendidos">0</p></div>
    </div>
    <div class="report-grid">
        <div class="card"><div class="flex-between" style="margin-bottom: 20px;"><h3>Vendas por Dia</h3></div><canvas id="salesChart"></canvas></div>
        <div class="card"><div class="flex-between" style="margin-bottom: 20px;"><h3>Top Produtos</h3></div><canvas id="prodChart"></canvas></div>
    </div>
    <div class="card">
        <div class="flex-between" style="margin-bottom: 20px;"><h3>Hist\u00f3rico de Vendas</h3></div>
        <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr><th>Data</th><th>Mesa</th><th>Pagamento</th><th>Itens</th><th>Total</th></tr></thead>
                <tbody id="vendasTable"></tbody>
            </table>
        </div>
    </div>
    <div class="card" style="margin-top:20px;">
        <div class="flex-between" style="margin-bottom:10px;"><h3>Movimenta\u00e7\u00f5es de Estoque</h3></div>
        <table style="width:100%; border-collapse:collapse;">
            <thead><tr><th>Data</th><th>Item</th><th>Qtd</th><th>Tipo</th><th>Usu\u00e1rio</th></tr></thead>
            <tbody id="movimentosTable"></tbody>
        </table>
    </div>
</div>`,

    analytics: `<div class="fade-in">
    <header class="dashboard-header">
        <h1 class="dashboard-title">Analytics</h1>
        <p class="dashboard-subtitle">Vis\u00e3o detalhada do desempenho do neg\u00f3cio.</p>
    </header>
    <div id="analyticsResumo"></div>
    <div class="charts-grid" style="margin-top:20px">
        <div class="card chart-container" data-aos="fade-right">
            <div class="chart-header"><h3>Top Produtos Mais Vendidos</h3></div>
            <div id="analyticsTopProdutos"></div>
        </div>
        <div class="card chart-container" data-aos="fade-left">
            <div class="chart-header"><h3>Movimento Di\u00e1rio (\u00faltimos 14 dias)</h3></div>
            <div id="analyticsMovimento"></div>
        </div>
    </div>
    <div class="card" style="margin-top:20px">
        <div class="chart-header"><h3>Produtos Vendidos (Geral)</h3></div>
        <div id="analyticsProdutosVendidos"></div>
    </div>
</div>`,

    configuracoes: `<div class="fade-in">
    <header class="dashboard-header"><h1 class="dashboard-title">Configura\u00e7\u00f5es</h1><p class="dashboard-subtitle">Personalize o sistema de acordo com sua necessidade.</p></header>
    <div class="card config-card">
        <div class="section-title">Empresa</div>
        <div class="form-group"><label>Nome da Empresa</label><input type="text" id="configNome" value=""></div>
        <div class="form-group"><label>CNPJ</label><input type="text" id="configCnpj" value=""></div>
        <div class="form-group"><label>Endere\u00e7o</label><input type="text" id="configEndereco" value=""></div>
        <div class="form-group"><label>Telefone</label><input type="text" id="configTelefone" value=""></div>
        <div class="form-group"><label>Taxa de Servi\u00e7o (%)</label><input type="number" id="configTaxa" value="0"></div>
        <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="Configuracoes.salvarEmpresa()"><i class="fas fa-save"></i> Salvar Altera\u00e7\u00f5es</button>
    </div>
    <div class="card config-card" style="margin-top:20px;">
        <div class="section-title">Backup & Restaurar</div>
        <p>Fa\u00e7a backup completo dos dados ou importe um arquivo JSON.</p>
        <div class="field-row" style="margin-top:10px;">
            <button class="btn-primary" id="exportDbBtn">Exportar Backup (JSON)</button>
            <label class="btn" style="background:#2d2d2d;">Importar Backup<input type="file" id="importDbFile" accept="application/json" style="display:none;"></label>
        </div>
    </div>
    <div class="card config-card" style="margin-top:20px;">
        <div id="mesasConfig"></div>
    </div>
    <div class="card config-card" style="margin-top:20px;">
        <div class="section-title">Usu\u00e1rios & Permiss\u00f5es</div>
        <div id="usersList" style="margin-top:8px;"></div>
        <hr style="margin:12px 0; border-color:var(--glass-border);">
        <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn-primary" id="addUserBtn"><i class="fas fa-plus"></i> Novo Usu\u00e1rio</button>
        </div>
    </div>
    <div class="card config-card" style="margin-top:20px;">
        <div class="section-title">Logs de Auditoria</div>
        <div class="field-row" style="margin-top:8px;">
            <button class="btn" id="btnShowAudits">Ver Logs</button>
            <button class="btn" id="btnExportAudits">Exportar Logs</button>
            <button class="btn" id="btnClearAudits">Limpar Logs</button>
        </div>
        <div id="auditLogs" style="margin-top:12px; max-height:300px; overflow:auto;"></div>
    </div>
</div>`
};

window.App = {
    _initialized: false,

    async init() {
        console.log('App.init() called');
        if (this._initialized) { console.log('App.init() - already initialized, returning'); return; }
        this._initialized = true;
        console.log('App.init() - initializing...');
        
        console.log('App.init() - calling Sidebar.init()');
        Sidebar.init();
        console.log('App.init() - Sidebar.init() done');
        
        console.log('App.init() - calling loadPage(dashboard)');
        this.loadPage('dashboard');
        console.log('App.init() - loadPage(dashboard) done');

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                App._initialized = false;
                localStorage.removeItem('app_user');
                document.body.classList.remove('authenticated');
                var u = document.getElementById('username');
                var p = document.getElementById('password');
                if (u) u.value = '';
                if (p) p.value = '';
                var loginError = document.getElementById('loginError');
                if (loginError) loginError.style.display = 'none';
            });
            console.log('App.init() - logout button handler attached');
        }
        console.log('App.init() - complete');
    },

    loadPage(page) {
        var mainContent = document.getElementById('mainContent');
        var html = PAGE_TEMPLATES[page] || '<h2>Pagina ' + page + ' em desenvolvimento...</h2>';
        mainContent.innerHTML = html;
        this.initPageLogic(page);
        if (window.AOS) AOS.refresh();
    },

    initPageLogic(page) {
        try {
            switch(page) {
                case 'dashboard':
                    if (typeof Dashboard !== 'undefined') Dashboard.init();
                    break;
                case 'comandas':
                    if (typeof Comandas !== 'undefined') Comandas.init();
                    break;
                case 'pedidos':
                    if (typeof Pedidos !== 'undefined') Pedidos.init();
                    break;
                case 'cozinha':
                    if (typeof Cozinha !== 'undefined') Cozinha.init();
                    break;
                case 'caixa':
                    if (typeof Caixa !== 'undefined') Caixa.init();
                    break;
                case 'estoque':
                    if (typeof Estoque !== 'undefined') Estoque.init();
                    break;
                case 'relatorios':
                    if (typeof Relatorios !== 'undefined') Relatorios.init();
                    break;
                case 'funcionarios':
                    if (typeof Funcionarios !== 'undefined') Funcionarios.init();
                    break;
                case 'produtos':
                    if (typeof Produtos !== 'undefined') Produtos.init();
                    break;
                case 'analytics':
                    if (typeof Analytics !== 'undefined') Analytics.init();
                    break;
                case 'configuracoes':
                    if (typeof Configuracoes !== 'undefined') Configuracoes.init();
                    break;
            }
        } catch (e) {
            console.error('Erro em initPageLogic(' + page + '):', e);
        }
    }
};


