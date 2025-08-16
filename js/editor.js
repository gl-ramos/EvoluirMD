/**
 * ========================================
 * EDITOR UNIFICADO
 * ========================================
 * 
 * Este módulo é responsável por gerenciar o editor unificado,
 * incluindo placeholders, navegação por Tab e funcionalidades do editor.
 * Suporta tanto modo template quanto modo em branco.
 */

// ========================================
// SELETORES DE ELEMENTOS DO EDITOR
// ========================================

const editorTitle = document.getElementById('editor-title');
const editorContent = document.getElementById('editor-content');
const copyButton = document.getElementById('copy-button');
const clearButton = document.getElementById('clear-button');

// ========================================
// ESTADO DO EDITOR
// ========================================

let editorMode = 'blank'; // 'template' ou 'blank'
let currentTemplateId = null;

// ========================================
// FUNÇÕES DO EDITOR UNIFICADO
// ========================================

/**
 * Carrega um template no editor
 * Converte placeholders {{texto}} em elementos editáveis
 * @param {string} templateKey - Chave do template a ser carregado
 */
function loadTemplate(templateKey) {
    if (!window.templates || !window.templates[templateKey]) return;

    editorMode = 'template';
    currentTemplateId = templateKey;
    window.currentTemplateId = templateKey;
    const template = window.templates[templateKey];

    // Atualiza estatísticas de uso do template
    if (window.updateTemplateUsage) {
        window.updateTemplateUsage(templateKey);
    }

    // Converte placeholders {{texto}} em elementos HTML editáveis
    const contentWithPlaceholders = template.content.replace(
        /\{\{([^}]+)\}\}/g,
        (match, p1) => {
            return `<span class="placeholder" data-original-text="${match}">${p1.replace(/_/g, ' ')}</span>`;
        }
    );

    setEditorTitle(template.title);
    setEditorContent(contentWithPlaceholders);
    setupEditorForMode();

    resetAndFocusFirstPlaceholder();
}

/**
 * Carrega o editor em modo branco
 */
function loadBlankEditor() {
    editorMode = 'blank';
    currentTemplateId = null;
    window.currentTemplateId = null;

    setEditorTitle('Editor em Branco');
    setEditorContent('');
    setupEditorForMode();

    // Foca no editor
    setTimeout(() => {
        editorContent.focus();
    }, 100);
}

/**
 * Define o título do editor
 * @param {string} title - Título a ser exibido
 */
function setEditorTitle(title) {
    if (editorTitle) {
        editorTitle.textContent = title;
    }
}

/**
 * Define o conteúdo do editor
 * @param {string} content - Conteúdo HTML a ser inserido
 */
function setEditorContent(content) {
    if (editorContent) {
        editorContent.innerHTML = content;
    }
}

/**
 * Configura o editor para o modo atual
 */
function setupEditorForMode() {
    if (!editorContent) return;

    // Remove listeners anteriores para evitar duplicação
    editorContent.removeEventListener('input', window.handleEditorInput);
    
    // Adiciona listener de input para snippets
    if (window.handleEditorInput) {
        editorContent.addEventListener('input', window.handleEditorInput);
        editorContent.setAttribute('data-snippet-listener', 'true');
    }

    // Adiciona listener de teclado ao editor se disponível
    if (window.addKeyboardListenerToElement) {
        window.addKeyboardListenerToElement(editorContent);
    }

    // Configura placeholder baseado no modo
    if (editorMode === 'blank') {
        editorContent.setAttribute('placeholder', 'Comece a escrever ou use snippets com /...');
    } else {
        editorContent.removeAttribute('placeholder');
    }
}

/**
 * Reseta todos os placeholders e foca no primeiro
 * Remove classes de estado e restaura texto original
 */
function resetAndFocusFirstPlaceholder() {
    const placeholders = editorContent.querySelectorAll('.placeholder');

    if (placeholders.length > 0) {
        // Reseta todos os placeholders
        placeholders.forEach(p => {
            p.innerHTML = p.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ');
            p.classList.remove('active', 'initial-focus', 'placeholder-filled');
            p.removeAttribute('data-skipped');
        });

        // Foca no primeiro placeholder
        const firstPlaceholder = placeholders[0];
        firstPlaceholder.classList.add('active', 'initial-focus');
        firstPlaceholder.focus();

        // Seleciona todo o conteúdo do placeholder
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(firstPlaceholder);
        selection.removeAllRanges();
        selection.addRange(range);

        // Remove a animação após 2 segundos
        setTimeout(() => firstPlaceholder.classList.remove('initial-focus'), 2000);
    }
}

/**
 * Copia a nota final para a área de transferência
 * Adapta-se ao modo do editor (template ou blank)
 */
function copyFinalNote() {
    const copyButtonText = document.getElementById('copy-button-text');
    const clipboardHelper = document.getElementById('clipboard-helper');

    if (!editorContent || !copyButtonText) return;

    let textToCopy = '';

    if (editorMode === 'template') {
        // Clona o conteúdo do editor
        const editorClone = editorContent.cloneNode(true);

        // Substitui placeholders vazios pelo texto original
        editorClone.querySelectorAll('.placeholder').forEach(p => {
            const originalText = p.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ');
            if (p.textContent.trim() === originalText) {
                p.textContent = p.dataset.originalText;
            }
        });

        textToCopy = editorClone.innerText;
    } else {
        // Modo blank - copia texto simples
        textToCopy = editorContent.textContent;
    }

    // Copia para a área de transferência
    if (clipboardHelper) {
        clipboardHelper.value = textToCopy;
        clipboardHelper.select();
    }

    try {
        document.execCommand('copy');

        // Feedback visual de sucesso
        copyButton.classList.remove('bg-[#3B82F6]', 'hover:bg-blue-600');
        copyButton.classList.add('bg-green-500');
        
        if (editorMode === 'template') {
            copyButtonText.innerHTML = `✔ Copiado!`;
        } else {
            copyButtonText.textContent = '✅ COPIADO!';
        }

        // Restaura o botão após 2 segundos
        setTimeout(() => {
            copyButton.classList.add('bg-[#3B82F6]', 'hover:bg-blue-600');
            copyButton.classList.remove('bg-green-500');
            
            if (editorMode === 'template') {
                copyButtonText.textContent = '📋 COPIAR NOTA';
            } else {
                copyButtonText.textContent = '📋 COPIAR TEXTO';
            }
        }, 2000);
    } catch (err) {
        if (editorMode === 'template') {
            copyButtonText.textContent = 'Erro ao copiar';
        } else {
            copyButtonText.textContent = 'Erro ao copiar';
        }
        console.error('Falha ao copiar texto: ', err);
    }
}

/**
 * Limpa o editor baseado no modo atual
 */
function clearEditor() {
    if (editorMode === 'template' && currentTemplateId) {
        // Recarrega o template atual
        loadTemplate(currentTemplateId);
    } else {
        // Limpa o editor em branco
        setEditorContent('');
        if (editorContent) {
            editorContent.focus();
        }
    }
}

/**
 * Salva o conteúdo do editor em branco como template
 */
function saveBlankEditorAsTemplate() {
    if (!editorContent || !editorContent.textContent.trim()) {
        alert('Não é possível salvar um template vazio.');
        return;
    }

    const content = editorContent.textContent.trim();
    const title = prompt('Digite um título para o template:');
    
    if (!title || !title.trim()) {
        return;
    }

    // Cria novo template
    const key = `template_${Date.now()}`;
    const now = Date.now();

    if (!window.templates) {
        window.templates = {};
    }

    window.templates[key] = {
        title: title.trim(),
        content: content,
        lastUsed: null,
        usageCount: 0,
        isFavorite: false,
        categoryId: 'geral',
        createdAt: now
    };

    // Salva no localStorage
    if (window.saveTemplatesToStorage) {
        window.saveTemplatesToStorage();
    }

    // Atualiza renderizações
    if (window.renderSidebarTemplates) {
        window.renderSidebarTemplates();
    }
    if (window.renderDashboard) {
        window.renderDashboard();
    }

    alert('Template salvo com sucesso!');
}

// ========================================
// EVENT LISTENERS DO EDITOR
// ========================================

/**
 * Configura os event listeners do editor
 */
function setupEditorListeners() {
    // Event listener para cliques em placeholders
    if (editorContent) {
        editorContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('placeholder')) {
                const placeholder = e.target;
                placeholder.removeAttribute('data-skipped');
                placeholder.classList.remove('placeholder-filled');

                // Remove estado ativo de outros placeholders
                editorContent.querySelectorAll('.placeholder.active').forEach(p => p.classList.remove('active'));
                placeholder.classList.add('active');

                // Seleciona todo o conteúdo do placeholder
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(placeholder);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        // Listener para teclas especiais (Ctrl+S para salvar como template no modo blank)
        editorContent.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && editorMode === 'blank') {
                e.preventDefault();
                saveBlankEditorAsTemplate();
            }
        });
    }

    // Event listeners para botões principais
    if (copyButton) {
        copyButton.addEventListener('click', copyFinalNote);
    }

    if (clearButton) {
        clearButton.addEventListener('click', clearEditor);
    }
}

/**
 * Obtém o modo atual do editor
 * @returns {string} Modo atual ('template' ou 'blank')
 */
function getEditorMode() {
    return editorMode;
}

/**
 * Obtém o ID do template atual (se em modo template)
 * @returns {string|null} ID do template ou null
 */
function getCurrentTemplateId() {
    return currentTemplateId;
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

//+= Funções que precisam ser acessíveis globalmente
window.loadTemplate = loadTemplate;
window.loadBlankEditor = loadBlankEditor;
window.copyFinalNote = copyFinalNote;
window.clearEditor = clearEditor;
window.saveBlankEditorAsTemplate = saveBlankEditorAsTemplate;
window.setupEditorListeners = setupEditorListeners;
window.getEditorMode = getEditorMode;
window.getCurrentTemplateId = getCurrentTemplateId;

// Exporta funções para uso em outros módulos
export {
    loadTemplate,
    loadBlankEditor,
    resetAndFocusFirstPlaceholder,
    copyFinalNote,
    clearEditor,
    saveBlankEditorAsTemplate,
    setupEditorListeners,
    getEditorMode,
    getCurrentTemplateId
};
