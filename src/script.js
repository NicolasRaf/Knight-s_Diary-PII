let contador = 1;

/**
 * Atualiza a visibilidade da mensagem "Nenhuma memória registrada".
 */
function updateNoTasksMessage() {
    const tabelaBody = document.querySelector('#tabelaTarefas tbody');
    const noTasksMessage = document.getElementById('noTasksMessage');
    if (tabelaBody.children.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }
}

/**
 * Adiciona uma nova tarefa (memória) à lista.
 */
async function adicionarTarefa() {
    const descricaoInput = document.getElementById('descricaoTarefa');
    const descricao = descricaoInput.value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (descricao === '') {
        errorMessage.innerText = 'Por favor, insira uma descrição para a memória.';
        // Exibe a mensagem de erro por um tempo e depois a limpa
        await new Promise(resolve => setTimeout(resolve, 2000));
        errorMessage.innerText = '';
        return;
    }

    const tabelaBody = document.querySelector('#tabelaTarefas tbody');
    const tr = document.createElement('tr');
    tr.id = `task-${contador}`;

    const tdContador = document.createElement('td');
    tdContador.innerText = contador;

    const tdDescricao = document.createElement('td');
    tdDescricao.innerText = descricao;

    const tdDataInicio = document.createElement('td');
    tdDataInicio.innerText = new Date().toLocaleDateString();

    const tdDataConclusao = document.createElement('td');
    tdDataConclusao.innerText = 'Em andamento'; // Texto inicial para tarefas não concluídas

    // Cria os botões de ação com ícones SVG
    const tdAcoes = document.createElement('td');

    const botaoConcluir = document.createElement('button');
    botaoConcluir.classList.add('concluirBtn', 'action-btn');
    botaoConcluir.title = 'Concluir Memória';
    // Ícone SVG de checkmark
    botaoConcluir.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
    `;
    botaoConcluir.addEventListener('click', () => {
        tdDataConclusao.innerText = new Date().toLocaleDateString();
        tdDataConclusao.style.color = '#90ee90'; // Muda a cor para verde
        botaoConcluir.disabled = true;
        tr.classList.add('completed-task');
        // Adiciona o ícone de conclusão à descrição
        const completedIcon = document.createElement('span');
        completedIcon.classList.add('completed-icon');
        completedIcon.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
        `;
        tdDescricao.prepend(completedIcon); // Adiciona o ícone antes do texto
    });

    const botaoExcluir = document.createElement('button');
    botaoExcluir.classList.add('excluirBtn', 'action-btn');
    botaoExcluir.title = 'Excluir Memória';
    // Ícone SVG de lixeira
    botaoExcluir.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
    `;
    botaoExcluir.addEventListener('click', () => {
        tr.remove();
        updateNoTasksMessage(); // Atualiza a mensagem após remover
    });

    // Adicionar as colunas de ações ao tdAcoes
    tdAcoes.appendChild(botaoConcluir);
    tdAcoes.appendChild(botaoExcluir);

    // Adicionar todas as células à linha (tr)
    tr.appendChild(tdContador);
    tr.appendChild(tdDescricao);
    tr.appendChild(tdDataInicio);
    tr.appendChild(tdDataConclusao);
    tr.appendChild(tdAcoes);

    tabelaBody.appendChild(tr);

    descricaoInput.value = ''; // Limpa o campo de input
    contador++; // Incrementa o contador para a próxima tarefa
    updateNoTasksMessage(); // Atualiza a mensagem após adicionar
}

// Listener para o carregamento do DOM e clique no botão de adicionar
document.addEventListener('DOMContentLoaded', () => {
    const adicionarBtn = document.getElementById('adicionarBtn');
    if (adicionarBtn) {
        adicionarBtn.addEventListener('click', adicionarTarefa);
    }
    updateNoTasksMessage(); // Verifica o estado inicial ao carregar a página
});