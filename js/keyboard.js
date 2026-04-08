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

const MODAL_IDS = ['snippet-modal', 'template-modal', 'category-modal'];

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
 * Obtém posições espaciais de todos os placeholders
 * @param {Array} placeholders - Array de elementos placeholder
 * @returns {Array} - Array de objetos com elemento e posição
 */
function getPlaceholderSpatialPositions(placeholders) {
    return placeholders.map(placeholder => {
        const rect = placeholder.getBoundingClientRect();
        return {
            element: placeholder,
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
 * Encontra o placeholder mais próximo baseado na posição do cursor e direção
 * @param {Object} cursorPos - Posição atual do cursor
 * @param {Array} placeholdersWithPos - Array de placeholders com posições
 * @param {string} direction - 'forward' para Tab, 'backward' para Shift+Tab
 * @returns {Object|null} - Objeto do placeholder mais próximo ou null
 */
function findNearestPlaceholder(cursorPos, placeholdersWithPos, direction) {
    if (!cursorPos || placeholdersWithPos.length === 0) {
        return null;
    }
    
    // Se o cursor está dentro de um placeholder, ajusta a lógica
    let currentPlaceholder = null;
    if (cursorPos.insidePlaceholder) {
        currentPlaceholder = cursorPos.insidePlaceholder;
        
        // Para navegação quando dentro de placeholder, exclui o placeholder atual
        const filteredPlaceholders = placeholdersWithPos.filter(p => p.element !== currentPlaceholder);
        
        if (filteredPlaceholders.length === 0) {
            return null;
        }
        
        // Usa a posição do placeholder atual como referência
        const placeholderRect = cursorPos.placeholderRect;
        
        if (direction === 'forward') {
            // Tab: próximo placeholder após o atual
            
            // 1. Procura placeholders à direita na mesma linha
            const rightOnSameLine = filteredPlaceholders.filter(p => {
                const sameLine = Math.abs(p.y - placeholderRect.top) <= placeholderRect.height;
                const toRight = p.x > placeholderRect.right || (p.x > placeholderRect.left && p.centerX > placeholderRect.left + placeholderRect.width);
                return sameLine && toRight;
            });
            
            if (rightOnSameLine.length > 0) {
                const closest = rightOnSameLine.reduce((closest, current) => 
                    Math.abs(current.x - placeholderRect.right) < Math.abs(closest.x - placeholderRect.right) ? current : closest
                );
                return closest;
            }
            
            // 2. Procura primeira ocorrência nas linhas abaixo
            const belowLines = filteredPlaceholders.filter(p => p.y > placeholderRect.bottom);
            if (belowLines.length > 0) {
                const sortedByY = belowLines.sort((a, b) => a.y - b.y);
                const firstLineY = sortedByY[0].y;
                const firstLine = sortedByY.filter(p => Math.abs(p.y - firstLineY) <= placeholderRect.height);
                
                const leftmost = firstLine.reduce((leftmost, current) => 
                    current.x < leftmost.x ? current : leftmost
                );
                return leftmost;
            }
            
            // 3. Wrap: primeiro placeholder do documento
            const first = filteredPlaceholders.reduce((first, current) => 
                current.y < first.y || (current.y === first.y && current.x < first.x) ? current : first
            );
            return first;
            
        } else {
            // Shift+Tab: placeholder anterior ao atual
            
            // 1. Procura placeholders à esquerda na mesma linha
            const leftOnSameLine = filteredPlaceholders.filter(p => {
                const sameLine = Math.abs(p.y - placeholderRect.top) <= placeholderRect.height;
                const toLeft = p.x < placeholderRect.left || (p.x < placeholderRect.right && p.centerX < placeholderRect.right);
                return sameLine && toLeft;
            });
            
            if (leftOnSameLine.length > 0) {
                const closest = leftOnSameLine.reduce((closest, current) => 
                    Math.abs(current.x - placeholderRect.left) < Math.abs(closest.x - placeholderRect.left) ? current : closest
                );
                return closest;
            }
            
            // 2. Procura última ocorrência nas linhas acima
            const aboveLines = filteredPlaceholders.filter(p => p.y < placeholderRect.top);
            if (aboveLines.length > 0) {
                const sortedByY = aboveLines.sort((a, b) => b.y - a.y);
                const lastLineY = sortedByY[0].y;
                const lastLine = sortedByY.filter(p => Math.abs(p.y - lastLineY) <= placeholderRect.height);
                
                const rightmost = lastLine.reduce((rightmost, current) => 
                    current.x > rightmost.x ? current : rightmost
                );
                return rightmost;
            }
            
            // 3. Wrap: último placeholder do documento
            const last = filteredPlaceholders.reduce((last, current) => 
                current.y > last.y || (current.y === last.y && current.x > last.x) ? current : last
            );
            return last;
        }
    }
    
    // Lógica original quando cursor não está em placeholder
    const lineHeight = cursorPos.height || 20;
    const tolerance = lineHeight * 0.6;
    
    if (direction === 'forward') {
        const rightOnSameLine = placeholdersWithPos.filter(p => {
            const sameLine = Math.abs(p.y - cursorPos.y) <= tolerance;
            const toRight = p.x > cursorPos.x;
            return sameLine && toRight;
        });
        
        if (rightOnSameLine.length > 0) {
            const closest = rightOnSameLine.reduce((closest, current) => 
                Math.abs(current.x - cursorPos.x) < Math.abs(closest.x - cursorPos.x) ? current : closest
            );
            return closest;
        }
        
        const belowLines = placeholdersWithPos.filter(p => {
            const below = p.y > cursorPos.y + tolerance;
            return below;
        });
        
        if (belowLines.length > 0) {
            const sortedByY = belowLines.sort((a, b) => a.y - b.y);
            const firstLineY = sortedByY[0].y;
            const firstLine = sortedByY.filter(p => Math.abs(p.y - firstLineY) <= tolerance);
            
            const leftmost = firstLine.reduce((leftmost, current) => 
                current.x < leftmost.x ? current : leftmost
            );
            return leftmost;
        }
        
        const first = placeholdersWithPos.reduce((first, current) => 
            current.y < first.y || (current.y === first.y && current.x < first.x) ? current : first
        );
        return first;
        
    } else {
        const leftOnSameLine = placeholdersWithPos.filter(p => {
            const sameLine = Math.abs(p.y - cursorPos.y) <= tolerance;
            const toLeft = p.x < cursorPos.x;
            return sameLine && toLeft;
        });
        
        if (leftOnSameLine.length > 0) {
            const closest = leftOnSameLine.reduce((closest, current) => 
                Math.abs(current.x - cursorPos.x) < Math.abs(closest.x - cursorPos.x) ? current : closest
            );
            return closest;
        }
        
        const aboveLines = placeholdersWithPos.filter(p => {
            const above = p.y < cursorPos.y - tolerance;
            return above;
        });
        
        if (aboveLines.length > 0) {
            const sortedByY = aboveLines.sort((a, b) => b.y - a.y);
            const lastLineY = sortedByY[0].y;
            const lastLine = sortedByY.filter(p => Math.abs(p.y - lastLineY) <= tolerance);
            
            const rightmost = lastLine.reduce((rightmost, current) => 
                current.x > rightmost.x ? current : rightmost
            );
            return rightmost;
        }
        
        const last = placeholdersWithPos.reduce((last, current) => 
            current.y > last.y || (current.y === last.y && current.x > last.x) ? current : last
        );
        return last;
    }
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

    const allPlaceholders = Array.from(activeEditor.querySelectorAll('.placeholder'));
    if (allPlaceholders.length === 0) {
        return;
    }

    // Descobre placeholder atual (ativo ou onde está o cursor)
    let currentPlaceholder = activeEditor.querySelector('.placeholder.active');
    if (!currentPlaceholder) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            let node = selection.getRangeAt(0).startContainer;
            while (node && node !== activeEditor) {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('placeholder')) {
                    currentPlaceholder = node;
                    break;
                }
                node = node.parentNode;
            }
        }
    }

    const updateCurrentPlaceholderState = (placeholder) => {
        if (!placeholder) return;

        placeholder.classList.remove('active', 'initial-focus');
        const originalText = placeholder.dataset.originalText
            ? placeholder.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ')
            : placeholder.textContent;
        const currentText = placeholder.textContent.trim();

        if (currentText === '' || currentText === originalText) {
            placeholder.innerHTML = originalText;
            placeholder.classList.remove('placeholder-filled');
            placeholder.removeAttribute('data-skipped');
        } else {
            placeholder.classList.add('placeholder-filled');
            // Placeholders preenchidos saem da navegação por TAB
            placeholder.setAttribute('data-skipped', 'true');
        }
    };

    const findNextNavigable = (startIndex, step) => {
        for (let i = startIndex + step; i >= 0 && i < allPlaceholders.length; i += step) {
            const candidate = allPlaceholders[i];
            if (candidate.getAttribute('data-skipped') !== 'true') {
                return candidate;
            }
        }
        return null;
    };

    // Atualiza estado do campo atual antes de decidir o próximo
    updateCurrentPlaceholderState(currentPlaceholder);

    let targetPlaceholder = null;

    if (!currentPlaceholder) {
        const navigablePlaceholders = Array.from(activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])'));
        if (navigablePlaceholders.length === 0) {
            return; // deixa TAB nativo
        }

        targetPlaceholder = e.shiftKey
            ? navigablePlaceholders[navigablePlaceholders.length - 1]
            : navigablePlaceholders[0];
    } else {
        const currentIndex = allPlaceholders.indexOf(currentPlaceholder);
        if (currentIndex === -1) {
            return;
        }

        targetPlaceholder = findNextNavigable(currentIndex, e.shiftKey ? -1 : 1);

        // Sem próximo placeholder navegável: deixa TAB nativo sair do editor
        if (!targetPlaceholder) {
            return;
        }
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
    activatePlaceholder
};
