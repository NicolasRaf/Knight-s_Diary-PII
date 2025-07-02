
// Classe para representar uma tarefa
class Tarefa {
    /**
     * @param {number} id O identificador único da tarefa.
     * @param {string} descricao O texto descritivo da tarefa.
     */
    constructor(id, descricao) {
        this.id = id;
        this.descricao = descricao;
        this.dataInicio = new Date();
        this.dataConclusao = null;
        this.concluida = false;
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


// Variáveis globais para controlar o estado da aplicação
const listaDeTarefas = []; // Array para armazenar os OBJETOS Tarefa

/**
 * Atualiza a visibilidade da mensagem "Nenhuma memória registrada".
 */
function updateNoTasksMessage() {
    const noTasksMessage = document.getElementById('noTasksMessage');
    noTasksMessage.style.display = listaDeTarefas.length === 0 ? 'block' : 'none';
}

/**
 * Adiciona uma nova tarefa (memória) à lista e à interface.
 */
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

    const novaTarefa = new Tarefa(listaDeTarefas.length + 1, descricao);
    listaDeTarefas.push(novaTarefa);
    criarLinhaDeTarefaNaTabela(novaTarefa);

    descricaoInput.value = '';
    updateNoTasksMessage();
}

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

function mostrarConfirmacao(message) {
    return new Promise(resolve => {
        // --- CRIAÇÃO DOS ELEMENTOS ---

        // 1. Cria o overlay (fundo escuro)
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay'; // Aplica a classe CSS

        // 2. Cria o conteúdo da modal (a caixa)
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // 3. Cria o parágrafo da mensagem
        const messageP = document.createElement('p');
        messageP.innerText = message; // Define o texto

        // 4. Cria o container para os botões
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'modal-buttons';

        // 5. Cria o botão de confirmação
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-btn modal-btn-confirm';
        confirmBtn.innerText = 'Confirmar';

        // 6. Cria o botão de cancelar
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn modal-btn-cancel';
        cancelBtn.innerText = 'Cancelar';

        // --- MONTAGEM E ADIÇÃO AO DOM ---

        // 7. Monta a estrutura, aninhando os elementos
        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modalContent.appendChild(messageP);
        modalContent.appendChild(buttonsDiv);
        modalOverlay.appendChild(modalContent);

        // 8. Adiciona a modal completa ao corpo do documento
        document.body.appendChild(modalOverlay);

        // --- LÓGICA E LIMPEZA ---
        
        // Função para remover a modal do DOM
        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };

        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve(true); // Usuário confirmou
        });

        cancelBtn.addEventListener('click', () => {
            closeModal();
            resolve(false); // Usuário cancelou
        });
    });
}

function criarLinhaDeTarefaNaTabela(tarefa) {
    const tabelaBody = document.querySelector('#tabelaTarefas tbody');
    const tr = document.createElement('tr');
    tr.id = `task-${tarefa.id}`;

    const tdContador = document.createElement('td');
    tdContador.innerText = tarefa.id;
    const tdDescricao = document.createElement('td');
    tdDescricao.innerText = tarefa.descricao;
    const tdDataInicio = document.createElement('td');
    tdDataInicio.innerText = tarefa.getDataInicioFormatada();
    const tdDataConclusao = document.createElement('td');
    const tdAcoes = document.createElement('td');

    // Botão de Concluir
    const botaoConcluir = document.createElement('button');
    botaoConcluir.classList.add('concluirBtn', 'action-btn');
    botaoConcluir.title = 'Concluir Memória';
    botaoConcluir.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
    
    // Botão de Excluir
    const botaoExcluir = document.createElement('button');
    botaoExcluir.classList.add('excluirBtn', 'action-btn');
    botaoExcluir.title = 'Excluir Memória';
    botaoExcluir.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    
    // Botão para Reabrir
    const botaoReabrir = document.createElement('button');
    botaoReabrir.classList.add('reabrirBtn', 'action-btn');
    botaoReabrir.title = 'Reabrir Memória';
    botaoReabrir.innerHTML = `↩`;

    // --- Listeners de Eventos ---
    botaoConcluir.addEventListener('click', () => {
        tarefa.concluir();
        atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
    });

    botaoReabrir.addEventListener('click', () => {
        tarefa.reabrir();
        atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
    });
    
    // DEPOIS (com a modal personalizada)
    botaoExcluir.addEventListener('click', async () => {
        
        if (tarefa.concluida) {
            document.getElementById('errorMessage').innerText = 'Memória concluída não pode ser excluída.';
            await new Promise(resolve => setTimeout(resolve, 2000));
            document.getElementById('errorMessage').innerText = '';
            return;
        }

        const querExcluir = await mostrarConfirmacao(`Tem certeza que deseja esquecer a memória: "${tarefa.id}" ?`);

        if (querExcluir) {
            if (tarefa.concluida) {
                document.getElementById('errorMessage').innerText = 'Memória concluída não pode ser excluída.';
                await new Promise(resolve => setTimeout(resolve, 2000));
                document.getElementById('errorMessage').innerText = '';
                return;
            }
            const index = listaDeTarefas.findIndex(t => t.id === tarefa.id);
            if (index > -1) {
                listaDeTarefas.splice(index, 1);
            }
            tr.remove();
            updateNoTasksMessage();
        }
    });

    // Crie um container para os botões
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'action-buttons-container';

    // Adiciona os botões ao NOVO container
    actionsContainer.appendChild(botaoExcluir);
    actionsContainer.appendChild(botaoConcluir);
    actionsContainer.appendChild(botaoReabrir);

    // Adiciona o container à célula
    tdAcoes.appendChild(actionsContainer);
    
    tr.appendChild(tdContador);
    tr.appendChild(tdDescricao);
    tr.appendChild(tdDataInicio);
    tr.appendChild(tdDataConclusao);
    tr.appendChild(tdAcoes);
    tabelaBody.appendChild(tr);

    // Define o estado visual inicial da linha
    atualizarVisualDaLinha(tarefa, tr, tdDescricao, tdDataConclusao, botaoConcluir, botaoReabrir);
}

// Listener principal que inicia a aplicação
document.addEventListener('DOMContentLoaded', () => {
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

    updateNoTasksMessage();
});

// DEBUG
let tarefaTeste = new Tarefa(1, 'Teste');
listaDeTarefas.push(tarefaTeste);
criarLinhaDeTarefaNaTabela(tarefaTeste);