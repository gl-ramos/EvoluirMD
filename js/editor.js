/**
 * ========================================
 * EDITOR DE TEMPLATES
 * ========================================
 * 
 * Este módulo é responsável por gerenciar o editor de templates,
 * incluindo placeholders, navegação por Tab e funcionalidades do editor
 */

// ========================================
// SELETORES DE ELEMENTOS DO EDITOR
// ========================================

const editorTitle = document.getElementById('editor-title');
const editorContent = document.getElementById('editor-content');
const copyButton = document.getElementById('copy-button');
const clearButton = document.getElementById('clear-button');

// ========================================
// FUNÇÕES DO EDITOR DE TEMPLATES
// ========================================

/**
 * Carrega um template no editor
 * Converte placeholders {{texto}} em elementos editáveis
 * @param {string} templateKey - Chave do template a ser carregado
 */
function loadTemplate(templateKey) {
    if (!window.templates || !window.templates[templateKey]) return;

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

    editorTitle.textContent = template.title;
    editorContent.innerHTML = contentWithPlaceholders;

    // Mostra estado do editor
    if (window.showEditorState) {
        window.showEditorState();
    }

    // Atualiza sidebar e dashboard para refletir mudanças de uso
    if (window.renderSidebarTemplates) {
        window.renderSidebarTemplates();
    }

    resetAndFocusFirstPlaceholder();
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
 * Substitui placeholders vazios pelo texto original
 */
function copyFinalNote() {
    const copyButtonText = document.getElementById('copy-button-text');
    const clipboardHelper = document.getElementById('clipboard-helper');

    // Clona o conteúdo do editor
    const editorClone = editorContent.cloneNode(true);

    // Substitui placeholders vazios pelo texto original
    editorClone.querySelectorAll('.placeholder').forEach(p => {
        const originalText = p.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ');
        if (p.textContent.trim() === originalText) {
            p.textContent = p.dataset.originalText;
        }
    });

    // Copia para a área de transferência
    clipboardHelper.value = editorClone.innerText;
    clipboardHelper.select();

    try {
        document.execCommand('copy');

        // Feedback visual de sucesso
        copyButton.classList.remove('bg-[#3B82F6]', 'hover:bg-blue-600');
        copyButton.classList.add('bg-green-500');
        copyButtonText.innerHTML = `✔ Copiado!`;

        // Restaura o botão após 2 segundos
        setTimeout(() => {
            copyButton.classList.add('bg-[#3B82F6]', 'hover:bg-blue-600');
            copyButton.classList.remove('bg-green-500');
            copyButtonText.textContent = '📋 COPIAR NOTA';
        }, 2000);
    } catch (err) {
        copyButtonText.textContent = 'Erro ao copiar';
        console.error('Falha ao copiar texto: ', err);
    }
}

/**
 * Limpa o editor e recarrega o template atual
 */
function clearEditor() {
    if (window.currentTemplateId) {
        loadTemplate(window.currentTemplateId);
    }
}

// ========================================
// EVENT LISTENERS DO EDITOR
// ========================================

/**
 * Configura os event listeners do editor
 */
function setupEditorListeners() {
    // Event listener para cliques em placeholders
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

    // Event listeners para botões principais
    if (copyButton) {
        copyButton.addEventListener('click', copyFinalNote);
    }

    if (clearButton) {
        clearButton.addEventListener('click', clearEditor);
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.loadTemplate = loadTemplate;
window.copyFinalNote = copyFinalNote;
window.clearEditor = clearEditor;
window.setupEditorListeners = setupEditorListeners;

// Exporta funções para uso em outros módulos
export {
    loadTemplate,
    resetAndFocusFirstPlaceholder,
    copyFinalNote,
    clearEditor,
    setupEditorListeners
};
