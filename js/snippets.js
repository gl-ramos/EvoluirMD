/**
 * ========================================
 * SISTEMA DE SNIPPETS
 * ========================================
 * 
 * Este módulo é responsável por gerenciar o sistema de snippets,
 * incluindo tooltip, autocompletar e gerenciamento CRUD
 */

// ========================================
// SELETORES DE ELEMENTOS DE SNIPPETS
// ========================================

const snippetTooltip = document.getElementById('snippet-tooltip');
const snippetsListContainer = document.getElementById('snippets-list-container');
const snippetModal = document.getElementById('snippet-modal');
const snippetForm = document.getElementById('snippet-form');
const createNewSnippetBtn = document.getElementById('create-new-snippet-btn');
const cancelSnippetBtn = document.getElementById('cancel-snippet-btn');

// ========================================
// VARIÁVEIS DE ESTADO
// ========================================

let currentSnippetTrigger = null;
let lastFocusedElementBeforeSnippetModal = null;

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// FUNÇÕES DE GERENCIAMENTO DE SNIPPETS
// ========================================

/**
 * Renderiza a lista de snippets na tela de gerenciamento
 * Mostra botões de editar e excluir para cada snippet
 */
function renderSnippetsList() {
    if (!snippetsListContainer) return;

    snippetsListContainer.innerHTML = '';

    if (!window.snippets || Object.keys(window.snippets).length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-gray-400';
        emptyMessage.textContent = 'Você ainda não criou nenhum snippet.';
        snippetsListContainer.appendChild(emptyMessage);

        // Atualiza contador
        if (window.updateSnippetCounter) {
            window.updateSnippetCounter();
        }
        return;
    }

    // Cria um card para cada snippet
    for (const key in window.snippets) {
        const snippet = window.snippets[key];

        const snippetEl = document.createElement('div');
        snippetEl.className = 'bg-[#2D2D2D] p-4 rounded-lg flex justify-between items-center border border-gray-700/50';

        const infoDiv = document.createElement('div');

        const keyTitle = document.createElement('h3');
        keyTitle.className = 'font-bold text-lg text-gray-200';
        keyTitle.textContent = key;

        const descriptionP = document.createElement('p');
        descriptionP.className = 'text-gray-400';
        descriptionP.textContent = snippet.description;

        infoDiv.appendChild(keyTitle);
        infoDiv.appendChild(descriptionP);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'space-x-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-snippet-btn text-blue-400 hover:text-blue-300';
        editBtn.dataset.key = key;
        editBtn.textContent = 'Editar';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-snippet-btn text-red-400 hover:text-red-300';
        deleteBtn.dataset.key = key;
        deleteBtn.textContent = 'Excluir';

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        snippetEl.appendChild(infoDiv);
        snippetEl.appendChild(actionsDiv);

        snippetsListContainer.appendChild(snippetEl);
    }

    // Adiciona event listeners para os botões
    snippetsListContainer.querySelectorAll('.edit-snippet-btn').forEach(btn =>
        btn.addEventListener('click', () => openSnippetModal(btn.dataset.key))
    );
    snippetsListContainer.querySelectorAll('.delete-snippet-btn').forEach(btn =>
        btn.addEventListener('click', () => deleteSnippet(btn.dataset.key))
    );

    // Atualiza contador
    if (window.updateSnippetCounter) {
        window.updateSnippetCounter();
    }
}

/**
 * Abre o modal para criar ou editar um snippet
 * @param {string} key - Chave do snippet para edição (null para criação)
 */
function openSnippetModal(key = null) {
    if (!snippetForm) return;

    lastFocusedElementBeforeSnippetModal = document.activeElement;
    snippetForm.reset();
    const titleEl = document.getElementById('snippet-modal-title');
    const originalKeyInput = document.getElementById('snippet-original-key');
    
    if (key) {
        // Modo de edição
        titleEl.textContent = 'Editar Snippet';
        const snippet = window.snippets[key];
        originalKeyInput.value = key;
        document.getElementById('snippet-key-input').value = key;
        document.getElementById('snippet-desc-input').value = snippet.description;
        document.getElementById('snippet-content-input').value = snippet.content;
    } else {
        // Modo de criação
        titleEl.textContent = 'Criar Snippet';
        originalKeyInput.value = '';
    }
    
    snippetModal.classList.remove('hidden');
    snippetModal.setAttribute('aria-hidden', 'false');

    const firstInput = document.getElementById('snippet-key-input');
    firstInput?.focus();
}

/**
 * Fecha o modal de snippet
 */
function closeSnippetModal() {
    if (snippetModal) {
        snippetModal.classList.add('hidden');
        snippetModal.setAttribute('aria-hidden', 'true');

        if (lastFocusedElementBeforeSnippetModal instanceof HTMLElement) {
            lastFocusedElementBeforeSnippetModal.focus();
        }
    }
}

/**
 * Salva um snippet (criação ou edição)
 * @param {Event} e - Evento do formulário
 */
function handleSaveSnippet(e) {
    e.preventDefault();
    
    const newKey = document.getElementById('snippet-key-input').value.trim();
    const originalKey = document.getElementById('snippet-original-key').value;
    const description = document.getElementById('snippet-desc-input').value.trim();
    const content = document.getElementById('snippet-content-input').value.trim();
    
    // Valida se a chave começa com /
    if (!newKey.startsWith('/')) {
        if (window.showAppNotification) {
            window.showAppNotification('O atalho do snippet deve começar com "/".', 'error');
        }
        return;
    }

    if (!description || !content) {
        if (window.showAppNotification) {
            window.showAppNotification('Descrição e conteúdo são obrigatórios.', 'error');
        }
        return;
    }

    // Se estiver criando/renomeando para uma chave existente, pede confirmação
    const isChangingKey = originalKey && newKey !== originalKey;
    const isOverwriting = window.snippets[newKey] && (!originalKey || isChangingKey);

    const performSaveSnippet = () => {
        // Se estiver editando e mudou a chave, remove a antiga
        if (isChangingKey) {
            delete window.snippets[originalKey];
        }

        window.snippets[newKey] = { description, content };

        // Salva no localStorage
        if (window.saveSnippetsToStorage) {
            window.saveSnippetsToStorage();
        }

        // Atualiza contadores
        if (window.updateSnippetCounter) {
            window.updateSnippetCounter();
        }

        closeSnippetModal();
        renderSnippetsList();

        if (window.showAppNotification) {
            window.showAppNotification('Snippet salvo com sucesso!', 'success');
        }
    };

    if (isOverwriting) {
        if (window.showConfirmDialog) {
            window.showConfirmDialog(`Já existe um snippet com a chave ${newKey}. Deseja sobrescrever?`, performSaveSnippet);
            return;
        }

        if (!confirm(`Já existe um snippet com a chave ${newKey}. Deseja sobrescrever?`)) {
            return;
        }
    }

    performSaveSnippet();
}

/**
 * Exclui um snippet
 * @param {string} key - Chave do snippet a ser excluído
 */
function deleteSnippet(key) {
    const performDelete = () => {
        delete window.snippets[key];

        // Salva no localStorage
        if (window.saveSnippetsToStorage) {
            window.saveSnippetsToStorage();
        }

        // Atualiza contadores
        if (window.updateSnippetCounter) {
            window.updateSnippetCounter();
        }

        renderSnippetsList();

        if (window.showAppNotification) {
            window.showAppNotification('Snippet excluído com sucesso.', 'success');
        }
    };

    if (window.showConfirmDialog) {
        window.showConfirmDialog(`Tem certeza que deseja excluir o snippet ${key}?`, performDelete);
        return;
    }

    if (confirm(`Tem certeza que deseja excluir o snippet ${key}?`)) {
        performDelete();
    }
}

// ========================================
// FUNÇÕES DO TOOLTIP E AUTCOMPLETAR
// ========================================

/**
 * Mostra o tooltip com sugestões de snippets
 * @param {Object} filteredSnippets - Snippets filtrados para mostrar
 * @param {DOMRect} rect - Posição do cursor para posicionar o tooltip
 */
function showSnippetTooltip(filteredSnippets, rect) {
    if (!snippetTooltip) return;
    
    snippetTooltip.innerHTML = '';
    
    if (Object.keys(filteredSnippets).length === 0) {
        hideSnippetTooltip();
        return;
    }
    
    // Cria itens para cada snippet filtrado
    Object.entries(filteredSnippets).forEach(([key, { description }], index) => {
        const item = document.createElement('a');
        item.href = "#";
        item.className = 'snippet-item';
        if (index === 0) item.classList.add('active');
        item.dataset.key = key;

        const keySpan = document.createElement('span');
        keySpan.className = 'snippet-key';
        keySpan.textContent = key;

        const breakLine = document.createElement('br');

        const descSpan = document.createElement('span');
        descSpan.className = 'snippet-desc';
        descSpan.textContent = description;

        item.appendChild(keySpan);
        item.appendChild(breakLine);
        item.appendChild(descSpan);

        // Evento de clique para inserir o snippet
        item.addEventListener('click', (e) => {
            e.preventDefault();
            insertSnippet(key);
        });

        // Evento de hover para destacar o item
        item.addEventListener('mouseover', (e) => {
            snippetTooltip.querySelectorAll('.snippet-item').forEach(el => el.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });

        snippetTooltip.appendChild(item);
    });
    
    // Posiciona e mostra o tooltip
    snippetTooltip.classList.remove('hidden');

    const tooltipHeight = snippetTooltip.offsetHeight;
    const tooltipWidth = snippetTooltip.offsetWidth;
    const offsetParent = snippetTooltip.offsetParent || document.body;
    const offsetParentRect = offsetParent.getBoundingClientRect();

    // Converte coordenadas de viewport para o sistema do container relativo
    const parentScrollLeft = offsetParent.scrollLeft || 0;
    const parentScrollTop = offsetParent.scrollTop || 0;
    const relativeLeft = rect.left - offsetParentRect.left + parentScrollLeft;
    const relativeTop = rect.top - offsetParentRect.top + parentScrollTop;

    // Tenta posicionar acima do cursor; se não houver espaço, posiciona abaixo
    let top = relativeTop - tooltipHeight - 5;
    if (top < 0) {
        top = relativeTop + (rect.height || 18) + 5;
    }

    // Evita overflow horizontal do tooltip
    const maxLeft = Math.max(0, (offsetParent.clientWidth || window.innerWidth) - tooltipWidth - 8);
    const left = Math.max(0, Math.min(relativeLeft, maxLeft));

    snippetTooltip.style.left = `${left}px`;
    snippetTooltip.style.top = `${top}px`;
}

/**
 * Esconde o tooltip de snippets
 */
function hideSnippetTooltip() {
    if (snippetTooltip) {
        snippetTooltip.classList.add('hidden');
    }
    currentSnippetTrigger = null;
}

/**
 * Processa o conteúdo do snippet convertendo placeholders em elementos HTML editáveis
 * @param {string} content - Conteúdo do snippet
 * @returns {string} - Conteúdo com placeholders convertidos
 */
function processSnippetPlaceholders(content) {
    // Escapa conteúdo para prevenir injeção de HTML e depois converte placeholders
    const safeContent = escapeHtml(content);

    return safeContent.replace(
        /\{\{([^}]+)\}\}/g,
        (match, p1) => {
            return `<span class="placeholder" data-original-text="${match}">${p1.replace(/_/g, ' ')}</span>`;
        }
    );
}

/**
 * Foca no primeiro placeholder recém-inserido
 * @param {Element[]} insertedPlaceholders - Lista de placeholders inseridos
 */
function focusFirstNewPlaceholder(insertedPlaceholders = []) {
    setTimeout(() => {
        const editorContent = document.getElementById('editor-content');
        if (!editorContent) return;

        // Prioriza placeholders recém-inseridos (quando disponíveis)
        let newPlaceholder = insertedPlaceholders.find(p =>
            p &&
            p.isConnected &&
            !p.classList.contains('placeholder-filled') &&
            !p.hasAttribute('data-skipped')
        );

        // Fallback: busca no DOM
        if (!newPlaceholder) {
            const allPlaceholders = editorContent.querySelectorAll('.placeholder');
            newPlaceholder = Array.from(allPlaceholders).find(p =>
                !p.classList.contains('active') &&
                !p.classList.contains('placeholder-filled') &&
                !p.hasAttribute('data-skipped')
            );
        }

        if (newPlaceholder) {
            const currentActive = editorContent.querySelector('.placeholder.active');
            if (currentActive) {
                currentActive.classList.remove('active', 'initial-focus');
            }

            newPlaceholder.classList.add('active', 'initial-focus');
            newPlaceholder.focus();

            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(newPlaceholder);
            selection.removeAllRanges();
            selection.addRange(range);

            setTimeout(() => newPlaceholder.classList.remove('initial-focus'), 2000);
        }
    }, 10);
}
function insertSnippet(key) {
    if (!window.snippets || !window.snippets[key]) return;
    
    const snippet = window.snippets[key];
    const selection = window.getSelection();
    
    if (!currentSnippetTrigger || !selection.rangeCount) {
        hideSnippetTooltip();
        return;
    }
    
    try {
        // Remove o texto do trigger e insere o conteúdo do snippet
        const { node, startOffset } = currentSnippetTrigger;
        
        // Valida se o node ainda existe no DOM
        if (!node || !node.parentNode) {
            hideSnippetTooltip();
            return;
        }
        
        const range = document.createRange();
        range.setStart(node, startOffset);
        range.setEnd(node, selection.getRangeAt(0).startOffset);
        range.deleteContents();
        
        // Processa placeholders no conteúdo do snippet
        const contentWithPlaceholders = processSnippetPlaceholders(snippet.content);
        
        // Verifica se o conteúdo tem placeholders
        if (contentWithPlaceholders.includes('<span class="placeholder"')) {
            // Se tem placeholders, insere como HTML usando createContextualFragment para preservar ordem
            const fragment = range.createContextualFragment(contentWithPlaceholders);
            const insertedPlaceholders = Array.from(fragment.querySelectorAll('.placeholder'));
            range.insertNode(fragment);

            // Posiciona o cursor após o conteúdo inserido
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            // Foca no primeiro placeholder dos elementos recém-inseridos
            focusFirstNewPlaceholder(insertedPlaceholders);
        } else {
            // Se não tem placeholders, insere como texto simples
            const textNode = document.createTextNode(snippet.content);
            range.insertNode(textNode);
            
            // Posiciona o cursor após o snippet inserido
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
    } catch (error) {
        console.error('Erro ao inserir snippet:', error);
        // Fallback: insere no final do editor se possível
        const editorContent = document.getElementById('editor-content');
        if (editorContent) {
            const contentWithPlaceholders = processSnippetPlaceholders(snippet.content);
            if (contentWithPlaceholders.includes('<span class="placeholder"')) {
                editorContent.innerHTML += contentWithPlaceholders;
                focusFirstNewPlaceholder();
            } else {
                editorContent.textContent += snippet.content;
            }
        }
    } finally {
        hideSnippetTooltip();
    }
}

/**
 * Processa input no editor para detectar triggers de snippet
 * Mostra tooltip quando detecta digitação de /
 */
function handleEditorInput() {
    const selection = window.getSelection();
    if (!selection.rangeCount || !selection.isCollapsed) {
        hideSnippetTooltip();
        return;
    }
    
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const offset = range.startOffset;
    
    if (node.nodeType !== Node.TEXT_NODE) {
        hideSnippetTooltip();
        return;
    }
    
    // Procura por / no texto antes do cursor
    const text = node.textContent.substring(0, offset);
    const triggerIndex = text.lastIndexOf('/');
    
    if (triggerIndex === -1 || text.substring(triggerIndex + 1).includes(' ')) {
        hideSnippetTooltip();
        return;
    }
    
    // Filtra snippets que começam com o texto digitado
    const query = text.substring(triggerIndex);
    currentSnippetTrigger = { node, startOffset: triggerIndex };
    
    if (!window.snippets) return;
    
    const filtered = Object.keys(window.snippets)
        .filter(key => key.startsWith(query))
        .reduce((obj, key) => {
            obj[key] = window.snippets[key];
            return obj;
        }, {});
    
    const rect = range.getBoundingClientRect();
    showSnippetTooltip(filtered, rect);
}

// ========================================
// EVENT LISTENERS DE SNIPPETS
// ========================================

/**
 * Configura os event listeners de snippets
 */
function setupSnippetsListeners() {
    // Event listeners para botões de snippets
    if (createNewSnippetBtn) {
        createNewSnippetBtn.addEventListener('click', () => openSnippetModal());
    }
    
    if (cancelSnippetBtn) {
        cancelSnippetBtn.addEventListener('click', closeSnippetModal);
    }
    
    if (snippetForm) {
        snippetForm.addEventListener('submit', handleSaveSnippet);
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.renderSnippetsList = renderSnippetsList;
window.openSnippetModal = openSnippetModal;
window.closeSnippetModal = closeSnippetModal;
window.handleSaveSnippet = handleSaveSnippet;
window.deleteSnippet = deleteSnippet;
window.showSnippetTooltip = showSnippetTooltip;
window.hideSnippetTooltip = hideSnippetTooltip;
window.insertSnippet = insertSnippet;
window.handleEditorInput = handleEditorInput;
window.setupSnippetsListeners = setupSnippetsListeners;
window.processSnippetPlaceholders = processSnippetPlaceholders;
window.focusFirstNewPlaceholder = focusFirstNewPlaceholder;

// Exporta funções para uso em outros módulos
export {
    renderSnippetsList,
    openSnippetModal,
    closeSnippetModal,
    handleSaveSnippet,
    deleteSnippet,
    showSnippetTooltip,
    hideSnippetTooltip,
    insertSnippet,
    handleEditorInput,
    setupSnippetsListeners,
    processSnippetPlaceholders,
    focusFirstNewPlaceholder
};
