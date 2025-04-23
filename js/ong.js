/**
 * Script para a página de detalhes da ONG
 */

let dadosReceitas = [];
let dadosDespesas = [];
let dadosOng = null;

// Inicializa o Swiper para a galeria mobile
let galeriaSwiper;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded iniciado");
    
    // Tentar obter o slug da ONG de várias formas
    let orgSlug = null;
    
    // 1. Verificar parâmetro na URL
    const urlParams = new URLSearchParams(window.location.search);
    orgSlug = urlParams.get('ong');
    
    // 2. Verificar se está no caminho da URL (formato: /slug)
    if (!orgSlug) {
        const path = window.location.pathname;
        const match = path.match(/\/([^\/\.]+)\/?$/);
        if (match && match[1]) {
            orgSlug = match[1];
        }
    }
    
    console.log("Slug detectado:", orgSlug);
    console.log("Hostname:", window.location.hostname);
    
    // Verificar se o slug existe
    if (!orgSlug) {
        console.log("Slug não encontrado, redirecionando...");
        window.location.href = 'index.html';
        return;
    }

    // Verificar se os dados da ONG estão disponíveis
    if (typeof dadosONGs === 'undefined') {
        console.log("Objeto dadosONGs ainda não está definido, aguardando...");
        let tentativas = 0;
        const maxTentativas = 5;
        
        const verificarDados = setInterval(() => {
            tentativas++;
            console.log(`Tentativa ${tentativas} de ${maxTentativas}`);
            
            if (typeof dadosONGs !== 'undefined' && dadosONGs[orgSlug]) {
                console.log("Dados encontrados após aguardar");
                clearInterval(verificarDados);
                inicializarComDados(orgSlug);
            } else if (tentativas >= maxTentativas) {
                console.log("Número máximo de tentativas atingido, redirecionando...");
                clearInterval(verificarDados);
                window.location.href = 'index.html';
            }
        }, 200);
        return;
    }

    if (!dadosONGs[orgSlug]) {
        console.log("Dados da ONG não encontrados");
        window.location.href = 'index.html';
        return;
    }

    inicializarComDados(orgSlug);
});

function inicializarComDados(orgSlug) {
    console.log("Iniciando com dados para:", orgSlug);
    
    // Verificar se o domínio atual corresponde à ONG solicitada
    const hostname = window.location.hostname;
    const dominioPermitido = verificarDominioPermitido(hostname, orgSlug);
    
    if (!dominioPermitido) {
        console.log("Acesso negado: domínio não autorizado para esta ONG");
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar dados da ONG
    dadosOng = organizacoes.find(org => org.slug === orgSlug);
    dadosReceitas = dadosONGs[orgSlug].receitas;
    dadosDespesas = dadosONGs[orgSlug].despesas;
    
    console.log("Dados carregados com sucesso");
    
    // Atualizar o título da página com o nome da ONG
    document.title = `PrestaConta - ${dadosOng.nome}`;
    
    // Inicialização
    inicializarPortal();
}

/**
 * Verifica se o domínio atual tem permissão para acessar os dados da ONG
 * @param {string} hostname - O hostname atual
 * @param {string} ongSlug - O slug da ONG solicitada
 * @returns {boolean} - True se o domínio tem permissão, false caso contrário
 */
function verificarDominioPermitido(hostname, ongSlug) {
    console.log("Verificando domínio:", hostname, "para ONG:", ongSlug);
    
    // Se estiver em localhost ou IP, permitir acesso (para desenvolvimento)
    if (hostname === '' || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('::1')) {
        console.log("Acesso local permitido");
        return true;
    }
    
    // Permitir acesso no GitHub Pages
    if (hostname.includes('github.io')) {
        console.log("Acesso GitHub Pages permitido");
        return true;
    }
    
    // Verificar se o domínio corresponde à ONG
    if (ongSlug === 'ampla' && (
        hostname.includes('ampla.') || 
        hostname === 'ampla.prestaconta.com' ||
        hostname === 'prestaconta-ampla.github.io'
    )) {
        console.log("Acesso AMPLA permitido");
        return true;
    }
    
    if (ongSlug === 'basquete' && (
        hostname.includes('basquete.') || 
        hostname.includes('epbe.') || 
        hostname.includes('palmitalense.')
    )) {
        console.log("Acesso Basquete permitido");
        return true;
    }
    
    console.log("Acesso negado para o domínio");
    return false;
}

/**
 * Inicializa todas as funcionalidades do portal
 */
function inicializarPortal() {
    // Adicionar classe específica da ONG ao body
    const urlParams = new URLSearchParams(window.location.search);
    const pathSlug = window.location.pathname.split('/').pop().replace('.html', '');
    const ongSlug = urlParams.get('ong') || pathSlug || 'ampla';
    
    // Remover classes existentes de ONG
    document.body.classList.remove('ong-ampla', 'ong-futuro');
    
    // Adicionar nova classe
    document.body.classList.add(`ong-${ongSlug}`);
    console.log('Classe adicionada ao body:', `ong-${ongSlug}`);
    
    // Carregar informações da ONG
    carregarInformacoesONG();
    
    // Carregar dados financeiros
    carregarReceitas();
    carregarDespesas();
    carregarLivrosContabeis();
    carregarMuralAvisos();
    atualizarResumoFinanceiro();
    
    // Configurar eventos
    configurarFiltros();
    configurarBuscas();
    configurarModais();
    
    // Mostrar efeito de entrada
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fadeIn');
    });
}

/**
 * Carrega as informações da ONG na página
 */
function carregarInformacoesONG() {
    // Verificar se o domínio atual corresponde à ONG solicitada
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const ongSlug = urlParams.get('ong') || 'ampla';
    const dominioPermitido = verificarDominioPermitido(hostname, ongSlug);
    
    if (!dominioPermitido) {
        console.log("Acesso negado: domínio não autorizado para esta ONG");
        // Redirecionar para a página inicial se o domínio não for autorizado
        window.location.href = 'index.html';
        return;
    }
    
    // Nome da ONG
    document.getElementById('ong-nome').textContent = dadosOng.nome;
    document.getElementById('footer-ong-nome').textContent = dadosOng.nome;
    document.getElementById('footer-ong-cnpj').textContent = `CNPJ: ${dadosOng.cnpj}`;
    document.title = `Portal de Transparência - ${dadosOng.nome}`;
    
    // Atualizar nome da ONG no título de boas-vindas
    const ongNomeTitulo = document.getElementById('ong-nome-titulo');
    if (ongNomeTitulo) {
        ongNomeTitulo.textContent = dadosOng.nome;
        ongNomeTitulo.classList.add('titulo-moderno');
    }
    
    // Descrição
    const descricaoElement = document.getElementById('ong-descricao');
    if (descricaoElement) {
        descricaoElement.classList.add('texto-moderno');
        descricaoElement.innerHTML = `
        <p>Este portal foi desenvolvido para garantir total transparência sobre os recursos financeiros da nossa organização.</p>
        <p>${dadosOng.descricao}</p>
    `;
    }
    
    // Contato
    const contatoContainer = document.getElementById('ong-contato');
    contatoContainer.innerHTML = `
        <li class="mb-2"><i class="bi bi-geo-alt-fill me-2"></i> ${dadosOng.contato.endereco}</li>
        <li class="mb-2"><i class="bi bi-telephone-fill me-2"></i> ${dadosOng.contato.telefone}</li>
        <li class="mb-2"><i class="bi bi-envelope-fill me-2"></i> ${dadosOng.contato.email}</li>
        <li class="mb-2"><i class="bi bi-clock-fill me-2"></i> ${dadosOng.contato.horario}</li>
    `;
    
    // Redes sociais
    const redesContainer = document.getElementById('ong-redes');
    let redesHTML = '';
    
    if (dadosOng.redesSociais.facebook) {
        redesHTML += `<a href="${dadosOng.redesSociais.facebook}" target="_blank" class="btn btn-outline-primary me-2"><i class="bi bi-facebook"></i></a>`;
    }
    
    if (dadosOng.redesSociais.instagram) {
        redesHTML += `<a href="${dadosOng.redesSociais.instagram}" target="_blank" class="btn btn-outline-primary me-2"><i class="bi bi-instagram"></i></a>`;
    }
    
    if (dadosOng.redesSociais.twitter) {
        redesHTML += `<a href="${dadosOng.redesSociais.twitter}" target="_blank" class="btn btn-outline-primary me-2"><i class="bi bi-twitter"></i></a>`;
    }
    
    if (dadosOng.redesSociais.whatsapp) {
        redesHTML += `<a href="${dadosOng.redesSociais.whatsapp}" target="_blank" class="btn btn-outline-primary"><i class="bi bi-whatsapp"></i></a>`;
    }
    
    redesContainer.innerHTML = redesHTML;
}

/**
 * Formata um valor para exibição como moeda
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Formata uma data ISO para formato brasileiro
 */
function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Carrega as receitas da ONG
 */
function carregarReceitas(filtroAno = 'todos', filtroMes = 'todos', termoBusca = '') {
    // Verificar se o domínio atual corresponde à ONG solicitada
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const ongSlug = urlParams.get('ong') || 'ampla';
    const dominioPermitido = verificarDominioPermitido(hostname, ongSlug);
    
    if (!dominioPermitido) {
        console.log("Acesso negado: domínio não autorizado para esta ONG");
        return;
    }
    
    const tabelaReceitas = document.getElementById('tabela-receitas');
    const semReceitas = document.getElementById('sem-receitas');
    
    if (!tabelaReceitas) {
        console.error('Tabela de receitas não encontrada');
        return;
    }
    
    // Limpar a tabela
    tabelaReceitas.innerHTML = '';
    
    // Verificar se existem receitas
    if (!dadosReceitas || dadosReceitas.length === 0) {
        tabelaReceitas.style.display = 'none';
        semReceitas.style.display = 'block';
        semReceitas.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="d-flex flex-column align-items-center">
                    <i class="bi bi-hourglass-split display-4 text-primary mb-3"></i>
                    <h4 class="mb-2">Em breve</h4>
                    <p class="text-muted">As receitas serão exibidas aqui em breve.</p>
                </div>
            </div>
        `;
        document.getElementById('total-receitas').textContent = 'R$ 0,00';
        return;
    }
    
    // Aplicar filtros
    let receitasFiltradas = dadosReceitas;
    
    if (filtroAno !== 'todos') {
        receitasFiltradas = receitasFiltradas.filter(receita => receita.ano === filtroAno);
    }
    
    if (filtroMes !== 'todos') {
        receitasFiltradas = receitasFiltradas.filter(receita => {
            const data = new Date(receita.data);
            return (data.getMonth() + 1).toString() === filtroMes;
        });
    }
    
    if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        receitasFiltradas = receitasFiltradas.filter(receita => 
            receita.descricao.toLowerCase().includes(termo) || 
            receita.fonte.toLowerCase().includes(termo)
        );
    }
    
    // Exibir ou ocultar a mensagem de "sem receitas"
    if (receitasFiltradas.length === 0) {
        tabelaReceitas.style.display = 'none';
        semReceitas.style.display = 'block';
        semReceitas.innerHTML = '<div class="col-12 text-center">Nenhuma receita encontrada</div>';
        document.getElementById('total-receitas').textContent = 'R$ 0,00';
        return;
    } else {
        tabelaReceitas.style.display = 'table';
        semReceitas.style.display = 'none';
    }
    
    // Calcular o total de receitas
    const totalReceitas = receitasFiltradas.reduce((total, receita) => total + parseFloat(receita.valor), 0);
    document.getElementById('total-receitas').textContent = `R$ ${totalReceitas.toFixed(2).replace('.', ',')}`;
    
    // Renderizar as receitas
    receitasFiltradas.forEach(receita => {
        const data = new Date(receita.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${receita.descricao}</td>
            <td>${receita.fonte}</td>
            <td class="text-end">R$ ${parseFloat(receita.valor).toFixed(2).replace('.', ',')}</td>
        `;
        
        tabelaReceitas.appendChild(row);
    });
}

/**
 * Carrega as despesas da ONG
 */
function carregarDespesas() {
    const container = document.getElementById('despesasContainer');
    if (!container) return;

    // Verifica o domínio
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const ongSlug = urlParams.get('ong');
    
    // Usar a função verificarDominioPermitido
    const dominioPermitido = verificarDominioPermitido(hostname, ongSlug);
    
    if (!dominioPermitido) {
        console.log('Acesso negado: domínio não autorizado');
        return;
    }

    const dadosDespesas = dadosONGs[ongSlug]?.despesas || [];
    const tbody = container.querySelector('tbody');
    const totalElement = document.getElementById('totalDespesas');
    const semDespesas = document.getElementById('semDespesas');
    const filtroAno = document.getElementById('filtroAnoDespesas');
    const filtroMes = document.getElementById('filtroMesDespesas');
    const buscaDespesas = document.getElementById('buscaDespesas');

    // Se não houver despesas, mostra a mensagem "Em breve"
    if (!dadosDespesas || dadosDespesas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-hourglass-split text-warning fs-4 d-block mb-2"></i>
                    <span class="text-muted">Em breve</span>
                </td>
            </tr>
        `;
        totalElement.textContent = 'R$ 0,00';
        semDespesas.style.display = 'none';
        return;
    }

    // Filtra as despesas
    let despesasFiltradas = [...dadosDespesas];
    const anoSelecionado = filtroAno.value;
    const mesSelecionado = filtroMes.value;
    const termoBusca = buscaDespesas.value.toLowerCase();

    if (anoSelecionado) {
        despesasFiltradas = despesasFiltradas.filter(d => d.ano === parseInt(anoSelecionado));
    }

    if (mesSelecionado) {
        despesasFiltradas = despesasFiltradas.filter(d => {
            const mes = new Date(d.data).getMonth() + 1;
            return mes === parseInt(mesSelecionado);
        });
    }

    if (termoBusca) {
        despesasFiltradas = despesasFiltradas.filter(d => 
            d.descricao.toLowerCase().includes(termoBusca) ||
            d.categoria.toLowerCase().includes(termoBusca) ||
            d.projeto.toLowerCase().includes(termoBusca)
        );
    }

    // Atualiza a tabela
    if (despesasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-search text-muted fs-4 d-block mb-2"></i>
                    <span class="text-muted">Nenhuma despesa encontrada</span>
                </td>
            </tr>
        `;
        totalElement.textContent = 'R$ 0,00';
        semDespesas.style.display = 'none';
    } else {
        tbody.innerHTML = despesasFiltradas.map(despesa => `
            <tr>
            <td>${formatarData(despesa.data)}</td>
                <td>${despesa.descricao}</td>
            <td>${despesa.categoria}</td>
            <td>${despesa.projeto}</td>
                <td class="text-end">R$ ${despesa.valor.toFixed(2)}</td>
                <td class="text-end">${despesa.ano}</td>
                <td class="text-center">
                    ${despesa.imagem ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalFoto('${despesa.imagem}', '${despesa.descricao}', '${despesa.categoria} - ${despesa.projeto}', '${formatarData(despesa.data)}')">
                            <i class="bi bi-image"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
        
        const total = despesasFiltradas.reduce((acc, curr) => acc + curr.valor, 0);
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
        semDespesas.style.display = 'table-row';
    }
}

/**
 * Atualiza o resumo financeiro no topo da página
 */
function atualizarResumoFinanceiro() {
    // Calcular total de receitas
    const totalReceitas = dadosReceitas.reduce((acc, receita) => acc + receita.valor, 0);
    
    // Calcular total de despesas
    const totalDespesas = dadosDespesas.reduce((acc, despesa) => acc + despesa.valor, 0);
    
    // Calcular saldo
    const saldo = totalReceitas - totalDespesas;
    
    // Atualizar os elementos HTML
    document.getElementById('total-receitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('total-despesas').textContent = formatarMoeda(totalDespesas);
    
    const saldoElement = document.getElementById('saldo');
    saldoElement.textContent = formatarMoeda(saldo);
    
    // Definir cor do saldo conforme valor (positivo/negativo)
    if (saldo > 0) {
        saldoElement.classList.add('text-success');
        saldoElement.classList.remove('text-danger');
    } else if (saldo < 0) {
        saldoElement.classList.add('text-danger');
        saldoElement.classList.remove('text-success');
    } else {
        saldoElement.classList.remove('text-success', 'text-danger');
    }
}

/**
 * Inicializa os filtros das tabelas
 */
function configurarFiltros() {
    // Filtro de ano para receitas
    document.getElementById('filtro-ano-receitas').addEventListener('change', function() {
        const ano = this.value;
        const mes = document.getElementById('filtro-mes-receitas').value;
        const busca = document.getElementById('busca-receitas').value;
        carregarReceitas(ano, mes, busca);
    });
    
    // Filtro de mês para receitas
    document.getElementById('filtro-mes-receitas').addEventListener('change', function() {
        const mes = this.value;
        const ano = document.getElementById('filtro-ano-receitas').value;
        const busca = document.getElementById('busca-receitas').value;
        carregarReceitas(ano, mes, busca);
    });
    
    // Filtro de ano para despesas
    document.getElementById('filtro-ano-despesas').addEventListener('change', function() {
        const ano = this.value;
        const mes = document.getElementById('filtro-mes-despesas').value;
        const busca = document.getElementById('busca-despesas').value;
        carregarDespesas(ano, mes, busca);
    });
    
    // Filtro de mês para despesas
    document.getElementById('filtro-mes-despesas').addEventListener('change', function() {
        const mes = this.value;
        const ano = document.getElementById('filtro-ano-despesas').value;
        const busca = document.getElementById('busca-despesas').value;
        carregarDespesas(ano, mes, busca);
    });
    
    // Filtro de ano para livros contábeis
    const filtroAnoLivros = document.getElementById('filtro-ano-livros');
    if (filtroAnoLivros) {
        console.log('Configurando evento change para filtro de livros contábeis');
        filtroAnoLivros.addEventListener('change', function() {
            const ano = String(this.value); // Garantir que é string
            console.log('Evento change do filtro de livros:', ano, 'Tipo:', typeof ano);
            const busca = document.getElementById('busca-livros').value;
            carregarLivrosContabeis(ano, busca);
        });
        
        // Inicializar com o valor atual para corrigir o estado inicial
        const anoInicial = String(filtroAnoLivros.value);
        console.log('Inicializando com valor:', anoInicial, 'Tipo:', typeof anoInicial);
        
        // Forçar carregamento inicial com o valor do select
        setTimeout(() => {
            if (anoInicial && anoInicial !== 'todos') {
                console.log('Carregando livros com filtro inicial:', anoInicial);
                const buscaInicial = document.getElementById('busca-livros').value;
                carregarLivrosContabeis(anoInicial, buscaInicial);
            }
        }, 500);
    } else {
        console.error('Elemento de filtro de livros não encontrado');
    }
}

/**
 * Inicializa as buscas nas tabelas
 */
function configurarBuscas() {
    // Busca para receitas
    document.getElementById('busca-receitas').addEventListener('input', function() {
        const busca = this.value;
        const ano = document.getElementById('filtro-ano-receitas').value;
        const mes = document.getElementById('filtro-mes-receitas').value;
        carregarReceitas(ano, mes, busca);
    });
    
    // Busca para despesas
    document.getElementById('busca-despesas').addEventListener('input', function() {
        const busca = this.value;
        const ano = document.getElementById('filtro-ano-despesas').value;
        const mes = document.getElementById('filtro-mes-despesas').value;
        carregarDespesas(ano, mes, busca);
    });
    
    // Busca para livros contábeis
    const buscaLivros = document.getElementById('busca-livros');
    if (buscaLivros) {
        buscaLivros.addEventListener('input', function() {
            const busca = this.value;
            const ano = document.getElementById('filtro-ano-livros').value;
            carregarLivrosContabeis(ano, busca);
        });
    }
}

/**
 * Configura o modal para exibir detalhes da despesa
 */
function configurarModais() {
    // Delegar evento de clique nos links das despesas
    document.querySelector('#tabela-despesas').addEventListener('click', function(event) {
        // Verificar se o clique foi em um link de despesa
        if (event.target.classList.contains('despesa-link')) {
            event.preventDefault();
            
            // Obter o ID da despesa
            const despesaId = parseInt(event.target.dataset.id);
            const despesa = dadosDespesas.find(d => d.id === despesaId);
            
            if (despesa) {
                // Preencher o modal com os dados
                document.getElementById('despesaModalLabel').textContent = `Despesa: ${despesa.descricao}`;
                document.getElementById('despesa-imagem').src = despesa.imagem;
                document.getElementById('despesa-titulo').textContent = despesa.descricao;
                document.getElementById('despesa-data').textContent = formatarData(despesa.data);
                document.getElementById('despesa-categoria').textContent = despesa.categoria;
                document.getElementById('despesa-projeto').textContent = despesa.projeto;
                document.getElementById('despesa-valor').textContent = formatarMoeda(despesa.valor);
                
                // Exibir o modal
                const modal = new bootstrap.Modal(document.getElementById('despesaModal'));
                modal.show();
            }
        }
    });
}

/**
 * Carrega os livros contábeis da ONG
 */
function carregarLivrosContabeis(filtroAno = 'todos', termoBusca = '') {
    // Verificar se o domínio atual corresponde à ONG solicitada
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const ongSlug = urlParams.get('ong') || 'ampla';
    const dominioPermitido = verificarDominioPermitido(hostname, ongSlug);
    
    if (!dominioPermitido) {
        console.log("Acesso negado: domínio não autorizado para esta ONG");
        return;
    }
    
    const containerLivros = document.getElementById('container-livros');
    const semLivros = document.getElementById('sem-livros');
    
    if (!containerLivros) {
        console.error('Container de livros não encontrado');
        return;
    }
    
    // Limpar o container
    containerLivros.innerHTML = '';
    
    // Verificar se existem livros
    if (!dadosOng.livrosContabeis || dadosOng.livrosContabeis.length === 0) {
        containerLivros.style.display = 'none';
        semLivros.style.display = 'block';
        semLivros.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="d-flex flex-column align-items-center">
                    <i class="bi bi-hourglass-split display-4 text-primary mb-3"></i>
                    <h4 class="mb-2">Em breve</h4>
                    <p class="text-muted">Os livros contábeis serão exibidos aqui em breve.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Aplicar filtros
    let livrosFiltrados = dadosOng.livrosContabeis;
    
    if (filtroAno !== 'todos') {
        livrosFiltrados = livrosFiltrados.filter(livro => livro.ano === filtroAno);
    }
    
    if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        livrosFiltrados = livrosFiltrados.filter(livro => 
            livro.tipo.toLowerCase().includes(termo) || 
            livro.ano.toString().includes(termo)
        );
    }
    
    // Exibir ou ocultar a mensagem de "sem livros"
    if (livrosFiltrados.length === 0) {
        containerLivros.style.display = 'none';
        semLivros.style.display = 'block';
        semLivros.innerHTML = '<div class="col-12 text-center">Nenhum livro contábil encontrado</div>';
        return;
    } else {
        containerLivros.style.display = 'grid';
        semLivros.style.display = 'none';
    }
    
    // Renderizar os livros
    livrosFiltrados.forEach(livro => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi ${livro.icone} fs-4 me-2" style="color: ${livro.cor}"></i>
                        <h5 class="card-title mb-0">${livro.tipo}</h5>
                    </div>
                    <p class="card-text">Ano: ${livro.ano}</p>
                    <a href="${livro.arquivo}" class="btn btn-primary" target="_blank">
                        <i class="bi bi-download me-2"></i>Baixar
                    </a>
                </div>
            </div>
        `;
        
        containerLivros.appendChild(card);
    });
}

/**
 * Carrega os avisos do mural
 */
function carregarMuralAvisos() {
    // Obter o slug da ONG atual
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);
    const pathSlug = window.location.pathname.split('/').pop().replace('.html', '');
    const ongSlug = urlParams.get('ong') || pathSlug || 'ampla';
    
    // Verificar se o domínio atual corresponde à ONG solicitada
    const dominioPermitido = verificarDominioPermitido(hostname, ongSlug);
    
    if (!dominioPermitido) {
        console.log("Acesso negado: domínio não autorizado para esta ONG");
        return;
    }
    
    // Obter os avisos do mural da ONG atual
    const avisos = dadosONGs[ongSlug]?.muralAvisos || [];
    
    // Verificar se existem avisos
    if (!avisos || avisos.length === 0) {
        const muralSection = document.getElementById('mural');
        if (muralSection) {
            muralSection.innerHTML = `
                <h2 class="border-bottom pb-2 mb-4">Mural de Avisos</h2>
                <div class="card">
                    <div class="card-body text-center py-5">
                        <div class="d-flex flex-column align-items-center">
                            <i class="bi bi-hourglass-split display-4 text-primary mb-3"></i>
                            <h4 class="mb-2">Em breve</h4>
                            <p class="text-muted">Os avisos serão exibidos aqui em breve.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Renderizar os avisos
    const muralSection = document.getElementById('mural');
    if (muralSection) {
        let html = `
            <h2 class="border-bottom pb-2 mb-4">Mural de Avisos</h2>
            <div class="card">
                <div class="card-body">
                    <div class="row mb-4">
        `;
        
        // Adicionar cada aviso
        avisos.forEach(aviso => {
            html += `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-dark text-white" style="background: linear-gradient(45deg, #000000, #333333) !important;">
                            <h3 class="h5 mb-0">${aviso.titulo}</h3>
                        </div>
                        <div class="card-body">
                            <p class="card-text">${aviso.descricao}</p>
                            <a href="${aviso.arquivo}" class="btn btn-primary btn-sm" target="_blank">
                                <i class="bi bi-file-earmark-pdf"></i> Ver PDF
                            </a>
                        </div>
                        <div class="card-footer text-muted">
                            Publicado em: ${formatarData(aviso.data)}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        muralSection.innerHTML = html;
    }
}

// Função para inicializar o Swiper para a galeria mobile
function inicializarGaleriaSwiper() {
    galeriaSwiper = new Swiper('.galeria-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
    });
}

// Função para carregar a galeria de fotos
function carregarGaleria() {
    const container = document.getElementById('galeria-container');
    const semFotos = document.getElementById('sem-fotos');
    const anoSelect = document.getElementById('ano-galeria');
    const mesSelect = document.getElementById('mes-galeria');
    const searchInput = document.getElementById('search-galeria');
    
    if (!container || !semFotos || !anoSelect || !mesSelect || !searchInput) return;

    const urlParams = new URLSearchParams(window.location.search);
    const ongSlug = urlParams.get('ong');
    
    if (!ongSlug || !dadosONGs[ongSlug]) {
        semFotos.style.display = 'block';
        container.style.display = 'none';
        return;
    }

    const fotos = dadosONGs[ongSlug].galeria || [];
    
    if (fotos.length === 0) {
        semFotos.style.display = 'block';
        container.style.display = 'none';
        return;
    }

    // Configurar anos e meses
    const anos = [...new Set(fotos.map(foto => foto.ano))].sort((a, b) => b - a);
    const meses = [...new Set(fotos.map(foto => foto.mes))].sort((a, b) => a - b);

    anoSelect.innerHTML = '<option value="">Todos os anos</option>' + 
        anos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
    
    mesSelect.innerHTML = '<option value="">Todos os meses</option>' + 
        meses.map(mes => `<option value="${mes}">${mes}</option>`).join('');

    // Função para filtrar fotos
    function filtrarFotos() {
        const anoSelecionado = anoSelect.value;
        const mesSelecionado = mesSelect.value;
        const termoBusca = searchInput.value.toLowerCase();

        const fotosFiltradas = fotos.filter(foto => {
            const matchAno = !anoSelecionado || foto.ano === parseInt(anoSelecionado);
            const matchMes = !mesSelecionado || foto.mes === parseInt(mesSelecionado);
            const matchBusca = !termoBusca || 
                foto.titulo.toLowerCase().includes(termoBusca) ||
                foto.descricao.toLowerCase().includes(termoBusca);

            return matchAno && matchMes && matchBusca;
        });

        if (fotosFiltradas.length === 0) {
            semFotos.style.display = 'block';
            container.style.display = 'none';
            return;
        }

        semFotos.style.display = 'none';
        container.style.display = 'block';

        // Inicializar ou atualizar o Swiper
        if (window.galeriaSwiper) {
            window.galeriaSwiper.destroy();
        }

        const swiperHtml = `
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${fotosFiltradas.map(foto => `
                        <div class="swiper-slide">
                            <img src="${foto.imagem}" alt="${foto.titulo}">
                            <div class="mt-3">
                                <h5>${foto.titulo}</h5>
                                <p class="text-muted">${foto.descricao}</p>
                                <p class="text-muted">${foto.mes}/${foto.ano}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        `;

        container.innerHTML = swiperHtml;

        window.galeriaSwiper = new Swiper('.swiper', {
            slidesPerView: 3,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            }
        });
    }

    // Adicionar event listeners
    anoSelect.addEventListener('change', filtrarFotos);
    mesSelect.addEventListener('change', filtrarFotos);
    searchInput.addEventListener('input', filtrarFotos);

    // Carregar fotos inicialmente
    filtrarFotos();
}

// Função para abrir a foto em tamanho maior
function abrirFoto(id) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('ong');
    const foto = dadosONGs[slug].fotos.find(f => f.id === id);
    
    if (!foto) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-foto';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${foto.url}" alt="${foto.titulo}">
            <div class="modal-info">
                <h3>${foto.titulo}</h3>
                <p>${foto.descricao}</p>
                <div class="modal-data">${getNomeMes(foto.mes)}/${foto.ano}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fecha o modal ao clicar no X ou fora da imagem
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Função para abrir o modal de visualização de fotos
function abrirModalFoto(foto, titulo, descricao, data) {
    const modal = document.getElementById('fotoModal');
    const modalFoto = document.getElementById('modalFoto');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalDescricao = document.getElementById('modalDescricao');
    const modalData = document.getElementById('modalData');

    modalFoto.src = foto;
    modalTitulo.textContent = titulo;
    modalDescricao.textContent = descricao;
    modalData.textContent = data;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Adicionar chamada da função no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    carregarGaleria();
    // ... existing code ...
});

function verificarUrlAmigavel() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // Se estiver em um subdomínio
    if (hostname.includes('.')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain === 'ampla' || subdomain === 'basquete') {
            return subdomain;
        }
    }
    
    // Se estiver usando URL amigável
    if (pathname.startsWith('/ong/')) {
        const slug = pathname.split('/')[2];
        if (slug === 'ampla' || slug === 'basquete') {
            return slug;
        }
    }
    
    return null;
} 