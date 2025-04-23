// Todo App - JavaScript com melhorias para tema Lofi Roxo
const novaTarefaForm = document.getElementById("nova-tarefa-form");
const novaTarefaInput = document.getElementById("nova-tarefa-input");
const tarefasContainer = document.getElementById("tarefas");
const filtrosBotoes = document.querySelectorAll(".filtro");

// Estado da aplicação
let tarefas = [];
let filtroAtual = "todas";

// Carregar tarefas do localStorage quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  // Adicionar classe para animação de entrada na página
  document.body.classList.add('fade-in');
  
  // Carregar fonte do Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
  
  carregarTarefas();
  renderizarTarefas();
  
  // Adicionar efeito de áudio para tema lofi (opcional)
  adicionarEfeitosSonoros();
});

// Event listener para adicionar nova tarefa
novaTarefaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const textoTarefa = novaTarefaInput.value.trim();

  if (textoTarefa) {
    adicionarTarefa(textoTarefa);
    novaTarefaInput.value = "";
    novaTarefaInput.focus();
    
    // Reproduzir som de adição (se habilitado)
    reproduzirSom('adicionar');
  } else {
    // Efeito de shake no input se estiver vazio
    novaTarefaInput.classList.add('shake');
    setTimeout(() => {
      novaTarefaInput.classList.remove('shake');
    }, 500);
  }
});

// Event listeners para os botões de filtro
filtrosBotoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    filtrosBotoes.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroAtual = botao.getAttribute("data-filtro");
    
    // Adicionar efeito de transição suave ao mudar filtros
    tarefasContainer.style.opacity = "0";
    setTimeout(() => {
      renderizarTarefas();
      tarefasContainer.style.opacity = "1";
    }, 300);
    
    // Reproduzir som de clique (se habilitado)
    reproduzirSom('clique');
  });
});

// Função para adicionar uma nova tarefa
function adicionarTarefa(texto) {
  const novaTarefa = {
    id: Date.now().toString(),
    texto: texto,
    concluida: false,
    dataCriacao: new Date(), 
    prioridade: 'normal' // Nova propriedade para prioridade
  };

  tarefas.push(novaTarefa);
  salvarTarefas();
  renderizarTarefas();
}

// Função para alternar o estado de conclusão de uma tarefa
function alternarTarefa(id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      // Reproduzir som de conclusão (se habilitado)
      if (!tarefa.concluida) {
        reproduzirSom('concluir');
      }
      return { ...tarefa, concluida: !tarefa.concluida };
    }
    return tarefa;
  });

  salvarTarefas();
  renderizarTarefas();
}

// Função para excluir uma tarefa
function excluirTarefa(id) {
  // Adicionar animação de saída antes de remover
  const tarefaElemento = document.querySelector(`[data-id="${id}"]`);
  if (tarefaElemento) {
    tarefaElemento.classList.add('fade-out');
    
    // Reproduzir som de exclusão (se habilitado)
    reproduzirSom('excluir');
    
    setTimeout(() => {
      tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
      salvarTarefas();
      renderizarTarefas();
    }, 300);
  } else {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
  }
}

// Função para alternar prioridade da tarefa
function alternarPrioridade(id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      const novaPrioridade = tarefa.prioridade === 'normal' ? 'alta' : 'normal';
      return { ...tarefa, prioridade: novaPrioridade };
    }
    return tarefa;
  });

  salvarTarefas();
  renderizarTarefas();
  
  // Reproduzir som de prioridade (se habilitado)
  reproduzirSom('clique');
}

// Função para renderizar as tarefas na interface
function renderizarTarefas() {
  tarefasContainer.innerHTML = "";

  const tarefasFiltradas = filtrarTarefas();

  if (tarefasFiltradas.length === 0) {
    tarefasContainer.innerHTML =
      '<p class="sem-tarefas">Nenhuma tarefa encontrada.</p>';
    return;
  }

  // Ordenar tarefas: primeiro por prioridade, depois por conclusão, depois por data
  tarefasFiltradas.sort((a, b) => {
    // Primeiro por prioridade (alta vem primeiro)
    if (a.prioridade === 'alta' && b.prioridade !== 'alta') return -1;
    if (a.prioridade !== 'alta' && b.prioridade === 'alta') return 1;
    
    // Depois por conclusão (não concluídas vêm primeiro)
    if (!a.concluida && b.concluida) return -1;
    if (a.concluida && !b.concluida) return 1;
    
    // Por fim, por data de criação (mais recentes primeiro)
    return new Date(b.dataCriacao) - new Date(a.dataCriacao);
  });

  tarefasFiltradas.forEach((tarefa, index) => {
    const tarefaElemento = document.createElement("div");
    tarefaElemento.classList.add("tarefa");
    tarefaElemento.setAttribute('data-id', tarefa.id);
    
    // Adicionar classe para animação com delay baseado no índice
    tarefaElemento.style.animationDelay = `${index * 0.05}s`;
    
    if (tarefa.concluida) {
      tarefaElemento.classList.add("concluida");
    }
    
    if (tarefa.prioridade === 'alta') {
      tarefaElemento.classList.add("prioridade-alta");
    }

    tarefaElemento.innerHTML = `
      <div class="tarefa-conteudo">
        <input 
          type="checkbox" 
          class="tarefa-checkbox" 
          ${tarefa.concluida ? "checked" : ""}
        />
        <span class="tarefa-texto">${tarefa.texto}</span>
      </div>
      <div class="tarefa-acoes">
        <button class="btn-prioridade" title="${tarefa.prioridade === 'alta' ? 'Remover prioridade' : 'Marcar como prioritária'}">
          <i class="fas ${tarefa.prioridade === 'alta' ? 'fa-star' : 'fa-star-half-alt'}"></i>
        </button>
        <button class="btn-excluir" title="Excluir tarefa">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    const checkbox = tarefaElemento.querySelector(".tarefa-checkbox");
    checkbox.addEventListener("change", () => {
      alternarTarefa(tarefa.id);
    });

    const btnPrioridade = tarefaElemento.querySelector(".btn-prioridade");
    btnPrioridade.addEventListener("click", () => {
      alternarPrioridade(tarefa.id);
    });

    const btnExcluir = tarefaElemento.querySelector(".btn-excluir");
    btnExcluir.addEventListener("click", () => {
      excluirTarefa(tarefa.id);
    });

    tarefasContainer.appendChild(tarefaElemento);
  });
  
  // Adicionar contador de tarefas
  atualizarContador();
}

// Função para atualizar o contador de tarefas
function atualizarContador() {
  const contadorElemento = document.getElementById('contador-tarefas');
  if (contadorElemento) {
    const totalTarefas = tarefas.length;
    const tarefasConcluidas = tarefas.filter(t => t.concluida).length;
    contadorElemento.textContent = `${tarefasConcluidas}/${totalTarefas}`;
  }
}

// Função para filtrar tarefas de acordo com o filtro atual
function filtrarTarefas() {
  switch (filtroAtual) {
    case "ativas":
      return tarefas.filter((tarefa) => !tarefa.concluida);
    case "concluidas":
      return tarefas.filter((tarefa) => tarefa.concluida);
    default:
      return tarefas;
  }
}

// Função para salvar tarefas no localStorage
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Função para carregar tarefas do localStorage
function carregarTarefas() {
  const tarefasSalvas = localStorage.getItem("tarefas");
  if (tarefasSalvas) {
    tarefas = JSON.parse(tarefasSalvas);
  }
}

// Função para alternar o tema escuro/claro
function alternarTema() {
  document.body.classList.toggle('tema-claro');
  const temaAtual = document.body.classList.contains('tema-claro') ? 'claro' : 'escuro';
  localStorage.setItem('tema', temaAtual);
  
  // Atualizar ícone do botão
  const btnTema = document.getElementById('btn-tema');
  if (btnTema) {
    btnTema.innerHTML = temaAtual === 'claro' 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
  }
  
  // Reproduzir som de tema (se habilitado)
  reproduzirSom('tema');
}

// Carregar preferência de tema
function carregarTema() {
  const temaPreferido = localStorage.getItem('tema');
  if (temaPreferido === 'claro') {
    document.body.classList.add('tema-claro');
    
    const btnTema = document.getElementById('btn-tema');
    if (btnTema) {
      btnTema.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
}

// Adicionar efeitos sonoros (desativados por padrão)
function adicionarEfeitosSonoros() {
  // Verificar se os efeitos sonoros estão habilitados
  const somHabilitado = localStorage.getItem('somHabilitado') === 'true';
  
  // Criar botão de som 
  if (!document.getElementById('btn-som')) {
    const btnSom = document.createElement('button');
    btnSom.id = 'btn-som';
    btnSom.className = 'btn-flutuante';
    btnSom.title = somHabilitado ? 'Desativar sons' : 'Ativar sons';
    btnSom.innerHTML = `<i class="fas ${somHabilitado ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
    
    btnSom.addEventListener('click', () => {
      const novoEstado = localStorage.getItem('somHabilitado') !== 'true';
      localStorage.setItem('somHabilitado', novoEstado);
      btnSom.innerHTML = `<i class="fas ${novoEstado ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
      btnSom.title = novoEstado ? 'Desativar sons' : 'Ativar sons';
    });
    
    document.body.appendChild(btnSom);
  }
}

// Função para reproduzir sons
function reproduzirSom(tipo) {
  // Verificar se os efeitos sonoros estão habilitados
  if (localStorage.getItem('somHabilitado') !== 'true') return;
  
  // Mapa de sons
  const sons = {
    adicionar: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA8DWZuJhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    concluir: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA8DWZuJhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    excluir: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA8DWZuJhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    clique: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA8DWZuJhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    tema: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABSAJAJAQgAAgAAAA8DWZuJhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU='
  };
  
  // Criar e reproduzir o som
  if (sons[tipo]) {
    const audio = new Audio(sons[tipo]);
    audio.volume = 0.2; // Volume baixo
    audio.play().catch(e => console.log('Erro ao reproduzir som:', e));
  }
}

// Inicializar tema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  carregarTema();
});
