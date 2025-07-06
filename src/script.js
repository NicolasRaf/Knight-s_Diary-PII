/* =================================================================   */
/* ================ 1. DEFINIÇÃO DA CLASSE E DADOS GLOBAIS =========   */
/* =================================================================   */
// Define a estrutura de uma 'Tarefa' e o array principal que armazena todas as tarefas.

// Classe para representar uma tarefa
class Tarefa {

    constructor(id, descricao) {
        this.id = id;
        this.descricao = descricao;
        this.dataInicio = new Date();
        this.dataConclusao = null;
        this.concluida = false;
        this.detalhes = '';
    }

    /** Marca a tarefa como concluída. */
    concluir() {
        if (!this.concluida) {
            this.concluida = true;
            this.dataConclusao = new Date();
        }
    }

    /** Reabre uma tarefa que estava concluída. */
    reabrir() {
        if (this.concluida) {
            this.concluida = false;
            this.dataConclusao = null;
        }
    }

    /** Retorna a data de início formatada. */
    getDataInicioFormatada() {
        return this.dataInicio.toLocaleDateString();
    }

    /** Retorna o status atual da tarefa. */
    getStatusOuDataConclusao() {
        if (this.concluida && this.dataConclusao) {
            return this.dataConclusao.toLocaleDateString();
        }
        return 'Em andamento';
    }
}

// Variável global para controlar o estado da aplicação
const listaDeTarefas = []; // Array para armazenar os OBJETOS Tarefa


/* =================================================================   */
/* ================ 2. FUNÇÕES DE MANIPULAÇÃO DO DOM E UI ==========   */
/* =================================================================   */
// Funções que criam, atualizam e gerenciam os elementos visuais na tela.

/** Atualiza a visibilidade da mensagem "Nenhuma memória registrada". */
function updateNoTasksMessage() {
    const noTasksMessage = document.getElementById('noTasksMessage');
    noTasksMessage.style.display = listaDeTarefas.length === 0 ? 'block' : 'none';
}

/** Adiciona uma nova tarefa (memória) à lista e à interface. */
async function adicionarTarefa() {
    const descricaoInput = document.getElementById('descricaoTarefa');
    const descricao = descricaoInput.value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (descricao === '') {
        errorMessage.innerText = 'Por favor, insira uma descrição para a memória.';
        await new Promise(resolve => setTimeout(resolve, 2000));
        errorMessage.innerText = '';
        return;
    }

    let id = (listaDeTarefas.length > 0) ?  Math.max(...listaDeTarefas.map(tarefa => tarefa.id)) + 1 : 1;
    const novaTarefa = new Tarefa(id, descricao);
    listaDeTarefas.push(novaTarefa);
    criarLinhaDeTarefaNaTabela(novaTarefa);

    descricaoInput.value = '';
    updateNoTasksMessage();
}

/** Atualiza o visual de uma linha da tabela com base no estado da tarefa. */
function atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir) {
    tdDataConclusao.innerText = tarefa.getStatusOuDataConclusao();

    if (tarefa.concluida) {
        // --- ESTADO: CONCLUÍDA ---
        tdDataConclusao.style.color = '#90ee90';
        tr.classList.add('completed-task');
        botaoConcluir.style.display = 'none';
        botaoReabrir.style.display = 'inline-block';
    } else {
        // --- ESTADO: EM ANDAMENTO / REABERTA ---
        tdDataConclusao.style.color = '';
        tr.classList.remove('completed-task');
        const completedIcon = tdDescricao.querySelector('.completed-icon');
        if (completedIcon) {
            completedIcon.remove();
        }
        botaoConcluir.style.display = 'inline-block';
        botaoConcluir.disabled = false;
        botaoReabrir.style.display = 'none';
    }
}

/** Exibe uma janela modal de confirmação para o usuário. */
function mostrarConfirmacao(message) {
    return new Promise(resolve => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        const messageP = document.createElement('p');
        messageP.innerText = message;
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'modal-buttons';
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-btn modal-btn-confirm';
        confirmBtn.innerText = 'Confirmar';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn modal-btn-cancel';
        cancelBtn.innerText = 'Cancelar';

        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modalContent.appendChild(messageP);
        modalContent.appendChild(buttonsDiv);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };

        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve(true);
        });

        cancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(false);
        });
    });
}

/* Cria e exibe uma janela modal para ver e editar os detalhes de uma tarefa. */
function mostrarModalDetalhes(tarefa) {
    // --- CRIAÇÃO DOS ELEMENTOS ---
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    // Usamos uma nova classe para poder estilizar esta modal de forma diferente
    modalContent.className = 'modal-content modal-content-detalhes'; 

    // Título da memória
    const modalTitle = document.createElement('h2');
    modalTitle.innerText = tarefa.descricao;

    // Área de texto para as anotações
    const modalTextarea = document.createElement('textarea');
    modalTextarea.className = 'modal-textarea';
    modalTextarea.placeholder = 'Escreva aqui os detalhes da sua memória...';
    modalTextarea.value = tarefa.detalhes; // Preenche com os detalhes já salvos

    // Container para os botões
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'modal-buttons';

    // Botão de Salvar
    const saveBtn = document.createElement('button');
    saveBtn.className = 'modal-btn modal-btn-save'; // Nova classe para estilizar
    saveBtn.innerText = 'Salvar e Fechar';
    
    // --- MONTAGEM E ADIÇÃO AO DOM ---
    buttonsDiv.appendChild(saveBtn);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalTextarea);
    modalContent.appendChild(buttonsDiv);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalTextarea.focus(); // Foca na área de texto assim que a modal abre

    // --- LÓGICA DOS EVENTOS ---
    const closeModal = () => {
        document.body.removeChild(modalOverlay);
    };

    saveBtn.addEventListener('click', () => {
        // Atualiza o objeto da tarefa com o novo texto
        tarefa.detalhes = modalTextarea.value;
        console.log(`Detalhes salvos para a tarefa ${tarefa.id}:`, tarefa.detalhes);
        closeModal();
    });
    
    // Opcional: Fechar a modal ao clicar fora dela
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
}

/** Cria a estrutura HTML (linha <tr>) para uma nova tarefa e a insere na tabela. */
function criarLinhaDeTarefaNaTabela(tarefa) {
    const tabelaBody = document.querySelector('#tabelaTarefas tbody');
    const tr = document.createElement('tr');
    tr.id = `task-${tarefa.id}`;
    tr.setAttribute('draggable', 'true');

    const tdContador = document.createElement('td');
    tdContador.innerText = tarefa.id;
    const tdDescricao = document.createElement('td');
    tdDescricao.innerText = tarefa.descricao;
    const tdDataInicio = document.createElement('td');
    tdDataInicio.innerText = tarefa.getDataInicioFormatada();
    const tdDataConclusao = document.createElement('td');
    const tdAcoes = document.createElement('td');

    // Botões de ação
    const botaoConcluir = document.createElement('button');
    botaoConcluir.classList.add('concluirBtn', 'action-btn');
    botaoConcluir.title = 'Concluir Memória';
    botaoConcluir.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
    
    const botaoExcluir = document.createElement('button');
    botaoExcluir.classList.add('excluirBtn', 'action-btn');
    botaoExcluir.title = 'Excluir Memória';
    botaoExcluir.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    
    const botaoReabrir = document.createElement('button');
    botaoReabrir.classList.add('reabrirBtn', 'action-btn');
    botaoReabrir.title = 'Reabrir Memória';
    botaoReabrir.innerHTML = `↩`;

    const botaoEditar = document.createElement('button');
    botaoEditar.classList.add('editarBtn', 'action-btn'); 
    botaoEditar.title = 'Editar Memória';
    botaoEditar.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
    
    // Botão para Detalhes
    const botaoDetalhes = document.createElement('button');
    botaoDetalhes.classList.add('detalhesBtn', 'action-btn'); // Nova classe CSS
    botaoDetalhes.title = 'Ver/Editar Detalhes';
    botaoDetalhes.innerHTML = `📖`; // Ícone de livro

    // Listeners de Eventos para os botões
    botaoConcluir.addEventListener('click', () => {
        tarefa.concluir();
        atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
    });

    botaoReabrir.addEventListener('click', () => {
        tarefa.reabrir();
        atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
    });
    
    botaoExcluir.addEventListener('click', async () => {
        if (tarefa.concluida) {
            document.getElementById('errorMessage').innerText = 'Memória concluída não pode ser esquecida.';
            setTimeout(() => { document.getElementById('errorMessage').innerText = ''; }, 2000);
            return;
        }
        const querExcluir = await mostrarConfirmacao(`Tem certeza que deseja esquecer a memória: "${tarefa.id}"?`);
        if (querExcluir) {
            const index = listaDeTarefas.findIndex(t => t.id === tarefa.id);
            if (index > -1) {
                listaDeTarefas.splice(index, 1);
            }
            tr.remove();
            updateNoTasksMessage();
        }
    });

    botaoEditar.addEventListener('click', () => {
        if (tarefa.concluida) return; 
        const isEditing = tr.classList.contains('editing');
        if (isEditing) {
            const inputEdicao = tdDescricao.querySelector('.edit-input');
            tarefa.descricao = inputEdicao.value;
            tdDescricao.innerText = tarefa.descricao;
            tr.classList.remove('editing');
        } else {
            const currentText = tdDescricao.innerText;
            tdDescricao.innerHTML = `<input type="text" class="edit-input" value="${currentText}">`;
            tdDescricao.querySelector('.edit-input').focus();
            tr.classList.add('editing');
        }
    });

        // Adicione o novo listener para o botão de detalhes
    botaoDetalhes.addEventListener('click', () => {
        if (tarefa.concluida) return;

        mostrarModalDetalhes(tarefa);
    });

    // Montagem da linha
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'action-buttons-container';
    actionsContainer.appendChild(botaoExcluir);
    actionsContainer.appendChild(botaoConcluir);
    actionsContainer.appendChild(botaoReabrir);
    actionsContainer.appendChild(botaoEditar);
    actionsContainer.appendChild(botaoDetalhes);
    tdAcoes.appendChild(actionsContainer);
    
    tr.appendChild(tdContador);
    tr.appendChild(tdDescricao);
    tr.appendChild(tdDataInicio);
    tr.appendChild(tdDataConclusao);
    tr.appendChild(tdAcoes);
    tabelaBody.appendChild(tr);

    atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
}


/* =================================================================   */
/* ================ 3. FUNCIONALIDADE DE ARRASTAR E SOLTAR ==========  */
/* =================================================================   */
// Lógica para a reordenação manual das tarefas na tabela.

/** Sincroniza o array 'listaDeTarefas' com a ordem visual atual das linhas na tabela. */
function sincronizarArrayDeTarefas() {
    const listaMemoriasElement = document.getElementById('lista-memorias');
    const linhasAtuais = Array.from(listaMemoriasElement.querySelectorAll('tr'));
    
    const novaListaDeTarefas = [];

    linhasAtuais.forEach(linha => {
        const idDaTarefa = parseInt(linha.id.split('-')[1]);
        const tarefaCorrespondente = listaDeTarefas.find(t => t.id === idDaTarefa);
        if (tarefaCorrespondente) {
            novaListaDeTarefas.push(tarefaCorrespondente);
        }
    });

    listaDeTarefas.length = 0;
    listaDeTarefas.push(...novaListaDeTarefas);

    console.log("Array sincronizado:", listaDeTarefas);
}


/* =================================================================   */
/* ================ 4. FUNCIONALIDADE DE FILTRAGEM =================   */
/* =================================================================   */
// Lógica para filtrar as tarefas visíveis por status (Todas, Em Andamento, Concluídas).

/** Filtra as tarefas na tabela com base no filtro selecionado. */
// Se você tem a função 'filtrarTarefas' separada:
function filtrarTarefas(filter) {
    const todasAsLinhas = document.querySelectorAll('#tabelaTarefas tbody tr');

    todasAsLinhas.forEach(tr => {
        const id = parseInt(tr.id.replace('task-', ''));
        const tarefa = listaDeTarefas.find(t => t.id === id);

        if (!tarefa) return;

        let deveSerVisivel = false;
        switch (filter) {
            case 'pending':
                deveSerVisivel = !tarefa.concluida;
                break;
            case 'completed':
                deveSerVisivel = tarefa.concluida;
                break;
            default: // 'all'
                deveSerVisivel = true;
                break;
        }
        
        // Aplica ou remove a classe .hidden com base na lógica
        if (deveSerVisivel) {
            tr.classList.remove('hidden');
        } else {
            tr.classList.add('hidden');
        }
    });
}


/* =================================================================   */
/* ================ 5. INICIALIZAÇÃO E LISTENERS PRINCIPAIS =========   */
/* =================================================================   */
// Ponto de entrada da aplicação. Executa quando o HTML está totalmente carregado.

document.addEventListener('DOMContentLoaded', () => {
    // --- Listener para Adicionar Tarefa ---
    const adicionarBtn = document.getElementById('adicionarBtn');
    const descricaoInput = document.getElementById('descricaoTarefa');

    if (adicionarBtn) {
        adicionarBtn.addEventListener('click', adicionarTarefa);
    }

    if (descricaoInput) {
        descricaoInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                adicionarTarefa();
            }
        });
    }

    // --- Lógica de Drag & Drop ---
    const listaMemoriasElement = document.getElementById('lista-memorias');
    let elementoArrastado = null; 

    listaMemoriasElement.addEventListener('dragstart', (e) => {
        elementoArrastado = e.target; 
        e.target.classList.add('arrastando'); 
    });

    listaMemoriasElement.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        const itemAlvo = e.target.closest('tr');
        if (itemAlvo && itemAlvo !== elementoArrastado) {
            const bounding = itemAlvo.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);

            if (e.clientY - offset > 0) {
                itemAlvo.parentNode.insertBefore(elementoArrastado, itemAlvo.nextSibling);
            } else {
                itemAlvo.parentNode.insertBefore(elementoArrastado, itemAlvo);
            }
        }
    });

    listaMemoriasElement.addEventListener('dragend', (e) => {
        e.target.classList.remove('arrastando');
        sincronizarArrayDeTarefas();
    });


    // --- Inicialização da UI ---
    updateNoTasksMessage();
});


// --- Listeners dos Botões de Filtro ---
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        button.classList.add('active');
        const filter = button.getAttribute('data-filter');
        filtrarTarefas(filter);
    });
});