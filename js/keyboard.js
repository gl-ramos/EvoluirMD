/**
 * ========================================
 * GERENCIADOR DE TECLADO E NAVEGAÇÃO
 * ========================================
 * 
 * Este módulo é responsável por gerenciar todos os eventos de teclado,
 * incluindo navegação por Tab, Escape, setas e Enter
 */

// ========================================
// FUNÇÕES DE NAVEGAÇÃO POR TECLADO
// ========================================

let keyboardListenersInitialized = false;

const MODAL_IDS = ['confirm-modal', 'snippet-modal', 'template-modal', 'category-modal'];

/**
 * Handler principal para eventos de teclado
 * Gerencia navegação por Tab, Escape, setas e Enter
 */
function handleKeyboardEvents(e) {
    const visibleModal = getVisibleModal();

    // Prioriza interações de modal (trap de foco e fechamento)
    if (visibleModal) {
        if (e.key === 'Tab') {
            trapFocusInModal(e, visibleModal);
            return;
        }

        if (e.key === 'Escape') {
            closeVisibleModal(visibleModal.id);
            return;
        }
    }

    const isTooltipVisible = !document.getElementById('snippet-tooltip')?.classList.contains('hidden');
    
    // Tecla Escape fecha modais e tooltips
    if (e.key === 'Escape') {
        if (window.hideSnippetTooltip) window.hideSnippetTooltip();
        if (window.closeSnippetModal) window.closeSnippetModal();
        if (window.closeTemplateModal) window.closeTemplateModal();
        if (window.closeCategoryModal) window.closeCategoryModal();
        return;
    }
    
    // Navegação no tooltip de snippets
    if (isTooltipVisible) {
        handleTooltipNavigation(e);
        return;
    }
    
    // Enter dentro de placeholder: sai do placeholder sem pular para o próximo
    if (e.key === 'Enter') {
        if (handleEnterFromPlaceholder(e)) {
            return;
        }
    }

    // Navegação por Tab entre placeholders
    if (e.key === 'Tab') {
        // Verifica se estamos dentro de um editor visível
        const editorContent = document.getElementById('editor-content');
        const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden')
            ? editorContent
            : null;

        if (activeEditor) {
            // Só intercepta TAB quando o evento realmente vem do editor
            const target = e.target;
            const eventFromEditor = target instanceof Node && activeEditor.contains(target);

            if (!eventFromEditor) {
                return;
            }

            const placeholders = activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])');
            if (placeholders.length > 0) {
                handleTabNavigation(e);
                return;
            }
        }
    }
}

function getVisibleModal() {
    for (const id of MODAL_IDS) {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains('hidden')) {
            return modal;
        }
    }

    return null;
}

function closeVisibleModal(modalId) {
    if (modalId === 'confirm-modal' && window.closeConfirmDialog) {
        window.closeConfirmDialog();
        return;
    }

    if (modalId === 'snippet-modal' && window.closeSnippetModal) {
        window.closeSnippetModal();
        return;
    }

    if (modalId === 'template-modal' && window.closeTemplateModal) {
        window.closeTemplateModal();
        return;
    }

    if (modalId === 'category-modal' && window.closeCategoryModal) {
        window.closeCategoryModal();
    }
}

function getFocusableElements(container) {
    if (!container) return [];

    const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ];

    return Array.from(container.querySelectorAll(selectors.join(','))).filter(el => {
        const isHidden = el.offsetParent === null && getComputedStyle(el).position !== 'fixed';
        return !isHidden;
    });
}

function trapFocusInModal(e, modal) {
    const focusables = getFocusableElements(modal);
    if (focusables.length === 0) {
        e.preventDefault();
        return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
        return;
    }

    if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
}

/**
 * Gerencia navegação no tooltip de snippets
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleTooltipNavigation(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateTooltipItems(e.key);
        return;
    }
    
    if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const activeSuggestion = document.querySelector('#snippet-tooltip .snippet-item.active');
        if (activeSuggestion && window.insertSnippet) {
            window.insertSnippet(activeSuggestion.dataset.key);
        }
        return;
    }
}

/**
 * Navega entre itens do tooltip usando setas
 * @param {string} direction - Direção da navegação ('ArrowDown' ou 'ArrowUp')
 */
function navigateTooltipItems(direction) {
    const items = Array.from(document.querySelectorAll('#snippet-tooltip .snippet-item'));
    if (items.length === 0) return;
    
    const currentIndex = items.findIndex(item => item.classList.contains('active'));
    items[currentIndex]?.classList.remove('active');
    
    let nextIndex;
    if (direction === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % items.length;
    } else {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
    }
    
    items[nextIndex]?.classList.add('active');
    items[nextIndex]?.scrollIntoView({ block: 'nearest' });
}

// ========================================
// FUNÇÕES DE POSICIONAMENTO PARA NAVEGAÇÃO
// ========================================

/**
 * Obtém a posição atual do cursor no editor
 * @returns {Object|null} - Objeto com coordenadas x, y do cursor ou null se não encontrado
 */
function getCurrentCursorPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }
    
    const range = selection.getRangeAt(0);
    if (!range) {
        return null;
    }
    
    // Para contenteditable, usa uma abordagem diferente
    const editorContent = document.getElementById('editor-content');
    if (!editorContent) {
        return null;
    }
    
    try {
        // Verifica se o cursor está dentro de um placeholder
        let container = range.commonAncestorContainer;
        let placeholderElement = null;
        
        // Procura pelo placeholder pai
        while (container && container !== editorContent) {
            if (container.nodeType === Node.ELEMENT_NODE && container.classList && container.classList.contains('placeholder')) {
                placeholderElement = container;
                break;
            }
            container = container.parentNode;
        }
        
        if (placeholderElement) {
            // Se estiver dentro de um placeholder, usa a posição do placeholder
            const rect = placeholderElement.getBoundingClientRect();
            
            // Para shift+tab, queremos usar a posição do início do placeholder
            // Para tab, queremos usar a posição do fim do placeholder
            return {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height || 20,
                insidePlaceholder: placeholderElement,
                placeholderRect: rect
            };
        }
        
        // Se não estiver em um placeholder, tenta obter posição exata do cursor
        const rect = range.getBoundingClientRect();
        
        // Se o rect não tem dimensões válidas, tenta método alternativo
        if (rect.width === 0 && rect.height === 0) {
            // Insere temporariamente um elemento para medir posição
            const span = document.createElement('span');
            span.textContent = '\u200B'; // Zero-width space
            span.style.position = 'absolute';
            
            const tempRange = range.cloneRange();
            tempRange.collapse(true);
            tempRange.insertNode(span);
            
            const spanRect = span.getBoundingClientRect();
            span.remove();
            
            if (spanRect.width === 0 && spanRect.height === 0) {
                return null;
            }
            
            return {
                x: spanRect.left,
                y: spanRect.top,
                width: 0,
                height: spanRect.height || 20
            };
        }
        
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height || 20
        };
        
    } catch (e) {
        console.error('Error detecting cursor position:', e);
        // Fallback: usa posição do container editor
        const editorRect = editorContent.getBoundingClientRect();
        return {
            x: editorRect.left + 10,
            y: editorRect.top + 10,
            width: 0,
            height: 20
        };
    }
}

/**
 * Obtém metadados de placeholders (incluindo posição visual e ordem textual)
 * @param {Array} placeholders - Array de elementos placeholder
 * @returns {Array} - Array de objetos com elemento e posição
 */
function getPlaceholderSpatialPositions(placeholders) {
    return placeholders.map((placeholder, index) => {
        const rect = placeholder.getBoundingClientRect();
        return {
            element: placeholder,
            index,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    });
}

/**
 * Encontra próximo/anterior placeholder respeitando a ordem textual do documento.
 * Se o cursor estiver entre placeholders, usa esse ponto para decidir.
 * @param {Object} cursorPos - Posição atual do cursor
 * @param {Array} placeholdersWithPos - Array de placeholders com metadados
 * @param {string} direction - 'forward' para Tab, 'backward' para Shift+Tab
 * @returns {Object|null} - Objeto do placeholder alvo ou null
 */
function findNearestPlaceholder(cursorPos, placeholdersWithPos, direction) {
    if (!placeholdersWithPos || placeholdersWithPos.length === 0) {
        return null;
    }

    const placeholders = placeholdersWithPos
        .map(p => p?.element || p)
        .filter(Boolean);

    if (placeholders.length === 0) {
        return null;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        const fallback = direction === 'backward'
            ? placeholders[placeholders.length - 1]
            : placeholders[0];
        return placeholdersWithPos.find(p => (p.element || p) === fallback) || null;
    }

    const caretRange = selection.getRangeAt(0).cloneRange();
    caretRange.collapse(true);

    const currentPlaceholder = cursorPos?.insidePlaceholder || null;
    if (currentPlaceholder) {
        const currentIndex = placeholders.indexOf(currentPlaceholder);
        if (currentIndex !== -1) {
            const targetIndex = direction === 'backward'
                ? (currentIndex - 1 + placeholders.length) % placeholders.length
                : (currentIndex + 1) % placeholders.length;

            const target = placeholders[targetIndex];
            return placeholdersWithPos.find(p => (p.element || p) === target) || null;
        }
    }

    // Primeiro placeholder cuja posição inicial vem depois do cursor
    const firstAfterCaretIndex = placeholders.findIndex((placeholder) => {
        const placeholderRange = document.createRange();
        placeholderRange.selectNode(placeholder);
        return caretRange.compareBoundaryPoints(Range.START_TO_START, placeholderRange) < 0;
    });

    let target;
    if (direction === 'backward') {
        if (firstAfterCaretIndex === -1) {
            target = placeholders[placeholders.length - 1];
        } else if (firstAfterCaretIndex === 0) {
            target = placeholders[placeholders.length - 1]; // wrap
        } else {
            target = placeholders[firstAfterCaretIndex - 1];
        }
    } else {
        if (firstAfterCaretIndex === -1) {
            target = placeholders[0]; // wrap
        } else {
            target = placeholders[firstAfterCaretIndex];
        }
    }

    return placeholdersWithPos.find(p => (p.element || p) === target) || null;
}

/**
 * Obtém o placeholder atual baseado no estado ativo ou posição do cursor
 * @param {Element} activeEditor
 * @returns {Element|null}
 */
function getCurrentPlaceholder(activeEditor) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        let node = selection.getRangeAt(0).startContainer;
        while (node && node !== activeEditor) {
            if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('placeholder')) {
                return node;
            }
            node = node.parentNode;
        }
    }

    // Fallback: usa estado ativo apenas quando o cursor não está em placeholder
    return activeEditor.querySelector('.placeholder.active');
}

/**
 * Atualiza visual/estado de um placeholder ao sair dele
 * @param {Element|null} placeholder
 */
function updatePlaceholderStateOnExit(placeholder) {
    if (!placeholder) return null;

    placeholder.classList.remove('active', 'initial-focus');

    const originalText = placeholder.dataset.originalText
        ? placeholder.dataset.originalText
            .replace(/^\[\[\s*([^\]]+?)\s*\]\]$/, '$1')
            .replace(/[\[\]]/g, '')
            .replace(/_/g, ' ')
        : placeholder.textContent;

    const rawText = placeholder.textContent || '';
    const trimmedText = rawText.trim();
    const hasChanged = trimmedText !== '' && trimmedText !== originalText;

    // Só integra ao texto comum quando o conteúdo realmente mudou
    if (!hasChanged) {
        placeholder.textContent = originalText;
        placeholder.classList.remove('placeholder-filled');
        placeholder.removeAttribute('data-skipped');
        return null;
    }

    const plainTextNode = document.createTextNode(rawText);
    placeholder.replaceWith(plainTextNode);

    return plainTextNode;
}

/**
 * Move o cursor para imediatamente após um nó no editor
 * @param {Node} node
 */
function moveCaretAfterPlaceholder(node) {
    if (!node) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    const editor = document.getElementById('editor-content');
    editor?.focus();
}

/**
 * Enter dentro de placeholder: conclui o campo e posiciona cursor após ele
 * @param {KeyboardEvent} e
 * @returns {boolean} true quando o evento foi tratado
 */
function handleEnterFromPlaceholder(e) {
    const editorContent = document.getElementById('editor-content');
    const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden')
        ? editorContent
        : null;

    if (!activeEditor) return false;

    const target = e.target;
    const eventFromEditor = target instanceof Node && activeEditor.contains(target);
    if (!eventFromEditor) return false;

    const currentPlaceholder = getCurrentPlaceholder(activeEditor);
    if (!currentPlaceholder) return false;

    e.preventDefault();
    e.stopPropagation();

    const plainTextNode = updatePlaceholderStateOnExit(currentPlaceholder);
    moveCaretAfterPlaceholder(plainTextNode || currentPlaceholder);
    return true;
}

/**
 * Tocar/clicar fora do placeholder conclui o campo atual
 * (equivalente ao Enter/Tab), sem impedir o clique alvo.
 * @param {PointerEvent} e
 */
function handleTapOutsidePlaceholder(e) {
    const editorContent = document.getElementById('editor-content');
    const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden')
        ? editorContent
        : null;

    if (!activeEditor) return;

    const currentPlaceholder = getCurrentPlaceholder(activeEditor);
    if (!currentPlaceholder) return;

    const target = e.target;
    if (!(target instanceof Node)) return;

    // Mantém edição normal quando tocando no próprio placeholder ativo
    if (currentPlaceholder.contains(target)) return;

    updatePlaceholderStateOnExit(currentPlaceholder);
}

/**
 * Gerencia navegação por Tab entre placeholders com consciência de posição do cursor
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleTabNavigation(e) {
    // Encontra o editor ativo
    const editorContent = document.getElementById('editor-content');
    const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden')
        ? editorContent
        : editorContent; // fallback

    if (!activeEditor) {
        return;
    }

    // Placeholder atual baseado no cursor real (com fallback para .active)
    const currentPlaceholder = getCurrentPlaceholder(activeEditor);

    // Atualiza estado do campo atual antes de decidir o próximo
    updatePlaceholderStateOnExit(currentPlaceholder);

    // Recoleta placeholders após possível integração do campo atual ao texto comum
    const navigablePlaceholders = Array.from(activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])'));
    if (navigablePlaceholders.length === 0) {
        return;
    }

    // Usa a posição atual do cursor para decidir o próximo/anterior
    const cursorPos = getCurrentCursorPosition();
    const placeholdersWithPos = getPlaceholderSpatialPositions(navigablePlaceholders);
    const direction = e.shiftKey ? 'backward' : 'forward';
    const nearest = findNearestPlaceholder(cursorPos, placeholdersWithPos, direction);
    const targetPlaceholder = nearest?.element || null;

    // Sem placeholder alvo, deixa TAB nativo sair do editor
    if (!targetPlaceholder) {
        return;
    }

    // Navegação interna entre placeholders
    e.preventDefault();
    e.stopPropagation();
    activatePlaceholder(targetPlaceholder);
}

/**
 * Ativa um placeholder
 * @param {Element} placeholder - Elemento placeholder para ativar
 */
function activatePlaceholder(placeholder) {
    placeholder.classList.remove('placeholder-filled');
    placeholder.classList.add('active');
    placeholder.focus();
    
    // Seleciona todo o texto do placeholder
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(placeholder);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Garante que o placeholder esteja visível
    scrollToElement(placeholder, 'smooth');
}

// ========================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ========================================

/**
 * Configura todos os event listeners de teclado
 */
function setupKeyboardListeners() {
    if (keyboardListenersInitialized) {
        return;
    }

    // Único listener global para evitar duplicação de eventos
    document.addEventListener('keydown', handleKeyboardEvents);
    document.addEventListener('pointerdown', handleTapOutsidePlaceholder);
    keyboardListenersInitialized = true;

    // Mantido por compatibilidade com módulos antigos.
    // Não adiciona novos listeners, apenas marca o elemento.
    window.addKeyboardListenerToElement = function(element) {
        if (element && !element.hasAttribute('data-keyboard-listener')) {
            element.setAttribute('data-keyboard-listener', 'true');
        }
    };
}

// ========================================
// FUNÇÕES DE UTILIDADE PARA NAVEGAÇÃO
// ========================================

/**
 * Rola a tela para mostrar um elemento
 * @param {Element} element - Elemento para mostrar
 * @param {string} behavior - Comportamento do scroll ('smooth' ou 'auto')
 */
function scrollToElement(element, behavior = 'smooth') {
    if (!element) return;
    
    element.scrollIntoView({
        behavior: behavior,
        block: 'nearest',
        inline: 'nearest'
    });
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.handleKeyboardEvents = handleKeyboardEvents;
window.handleTooltipNavigation = handleTooltipNavigation;
window.handleTabNavigation = handleTabNavigation;
window.navigateTooltipItems = navigateTooltipItems;
window.scrollToElement = scrollToElement;
window.setupKeyboardListeners = setupKeyboardListeners;
window.getCurrentCursorPosition = getCurrentCursorPosition;
window.getPlaceholderSpatialPositions = getPlaceholderSpatialPositions;
window.findNearestPlaceholder = findNearestPlaceholder;
window.activatePlaceholder = activatePlaceholder;
window.handleEnterFromPlaceholder = handleEnterFromPlaceholder;

// Exporta funções para uso em outros módulos
export {
    handleKeyboardEvents,
    handleTooltipNavigation,
    handleTabNavigation,
    navigateTooltipItems,
    scrollToElement,
    setupKeyboardListeners,
    getCurrentCursorPosition,
    getPlaceholderSpatialPositions,
    findNearestPlaceholder,
    activatePlaceholder,
    handleEnterFromPlaceholder
};
