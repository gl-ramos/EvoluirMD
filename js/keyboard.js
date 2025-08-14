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

/**
 * Handler principal para eventos de teclado
 * Gerencia navegação por Tab, Escape, setas e Enter
 */
function handleKeyboardEvents(e) {
    console.log('Keyboard event captured:', { key: e.key, target: e.target.id || e.target.tagName });
    
    const isTooltipVisible = !document.getElementById('snippet-tooltip')?.classList.contains('hidden');
    
    // Tecla Escape fecha modais e tooltips
    if (e.key === 'Escape') {
        if (window.hideSnippetTooltip) window.hideSnippetTooltip();
        if (window.closeSnippetModal) window.closeSnippetModal();
        if (window.closeTemplateModal) window.closeTemplateModal();
        return;
    }
    
    // Navegação no tooltip de snippets
    if (isTooltipVisible) {
        handleTooltipNavigation(e);
        return;
    }
    
    // Navegação por Tab entre placeholders
    if (e.key === 'Tab') {
        console.log('Tab key detected, checking for placeholders...');
        
        // Verifica se estamos dentro de um editor ou se há placeholders disponíveis
        const editorContent = document.getElementById('editor-content');
        const blankEditorContent = document.getElementById('blank-editor-content');
        const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden') 
            ? editorContent 
            : blankEditorContent && !blankEditorContent.closest('#blank-editor-state').classList.contains('hidden') 
                ? blankEditorContent 
                : null;
        
        console.log('Active editor:', activeEditor?.id);
        
        if (activeEditor) {
            const placeholders = activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])');
            console.log('Found placeholders:', placeholders.length);
            
            if (placeholders.length > 0) {
                console.log('Calling handleTabNavigation');
                handleTabNavigation(e);
                return;
            }
        }
        
        // Se não há placeholders, deixa o comportamento padrão do Tab
        console.log('No placeholders found, allowing default tab behavior');
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
        console.log('No selection found');
        return null;
    }
    
    const range = selection.getRangeAt(0);
    if (!range) {
        console.log('No range found');
        return null;
    }
    
    // Para contenteditable, usa uma abordagem diferente
    const editorContent = document.getElementById('editor-content');
    if (!editorContent) {
        console.log('No editor content found');
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
            console.log('Cursor is inside placeholder:', placeholderElement.textContent);
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
                console.log('Could not determine cursor position');
                return null;
            }
            
            console.log('Cursor position detected (method 2):', { x: spanRect.left, y: spanRect.top });
            return {
                x: spanRect.left,
                y: spanRect.top,
                width: 0,
                height: spanRect.height || 20
            };
        }
        
        console.log('Cursor position detected (method 1):', { x: rect.left, y: rect.top });
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
        console.log('Invalid input to findNearestPlaceholder');
        return null;
    }
    
    console.log('Finding nearest placeholder:', { direction, cursorPos, placeholders: placeholdersWithPos.length });
    
    // Se o cursor está dentro de um placeholder, ajusta a lógica
    let currentPlaceholder = null;
    if (cursorPos.insidePlaceholder) {
        currentPlaceholder = cursorPos.insidePlaceholder;
        console.log('Cursor is inside placeholder:', currentPlaceholder.textContent);
        
        // Para navegação quando dentro de placeholder, exclui o placeholder atual
        const filteredPlaceholders = placeholdersWithPos.filter(p => p.element !== currentPlaceholder);
        
        if (filteredPlaceholders.length === 0) {
            console.log('No other placeholders available');
            return null;
        }
        
        // Usa a posição do placeholder atual como referência
        const placeholderRect = cursorPos.placeholderRect;
        
        if (direction === 'forward') {
            // Tab: próximo placeholder após o atual
            console.log('Forward from inside placeholder');
            
            // 1. Procura placeholders à direita na mesma linha
            const rightOnSameLine = filteredPlaceholders.filter(p => {
                const sameLine = Math.abs(p.y - placeholderRect.top) <= placeholderRect.height;
                const toRight = p.x > placeholderRect.right || (p.x > placeholderRect.left && p.centerX > placeholderRect.left + placeholderRect.width);
                console.log('Placeholder check (right from current):', { 
                    text: p.element.textContent,
                    x: p.x, y: p.y, 
                    placeholderRight: placeholderRect.right,
                    sameLine, toRight 
                });
                return sameLine && toRight;
            });
            
            if (rightOnSameLine.length > 0) {
                const closest = rightOnSameLine.reduce((closest, current) => 
                    Math.abs(current.x - placeholderRect.right) < Math.abs(closest.x - placeholderRect.right) ? current : closest
                );
                console.log('Selected closest right from placeholder:', closest.element.textContent);
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
                console.log('Selected leftmost below from placeholder:', leftmost.element.textContent);
                return leftmost;
            }
            
            // 3. Wrap: primeiro placeholder do documento
            const first = filteredPlaceholders.reduce((first, current) => 
                current.y < first.y || (current.y === first.y && current.x < first.x) ? current : first
            );
            console.log('Wrapped to first from placeholder:', first.element.textContent);
            return first;
            
        } else {
            // Shift+Tab: placeholder anterior ao atual
            console.log('Backward from inside placeholder');
            
            // 1. Procura placeholders à esquerda na mesma linha
            const leftOnSameLine = filteredPlaceholders.filter(p => {
                const sameLine = Math.abs(p.y - placeholderRect.top) <= placeholderRect.height;
                const toLeft = p.x < placeholderRect.left || (p.x < placeholderRect.right && p.centerX < placeholderRect.right);
                console.log('Placeholder check (left from current):', { 
                    text: p.element.textContent,
                    x: p.x, y: p.y, 
                    placeholderLeft: placeholderRect.left,
                    sameLine, toLeft 
                });
                return sameLine && toLeft;
            });
            
            if (leftOnSameLine.length > 0) {
                const closest = leftOnSameLine.reduce((closest, current) => 
                    Math.abs(current.x - placeholderRect.left) < Math.abs(closest.x - placeholderRect.left) ? current : closest
                );
                console.log('Selected closest left from placeholder:', closest.element.textContent);
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
                console.log('Selected rightmost above from placeholder:', rightmost.element.textContent);
                return rightmost;
            }
            
            // 3. Wrap: último placeholder do documento
            const last = filteredPlaceholders.reduce((last, current) => 
                current.y > last.y || (current.y === last.y && current.x > last.x) ? current : last
            );
            console.log('Wrapped to last from placeholder:', last.element.textContent);
            return last;
        }
    }
    
    // Lógica original quando cursor não está em placeholder
    const lineHeight = cursorPos.height || 20;
    const tolerance = lineHeight * 0.6;
    
    console.log('Line height:', lineHeight, 'tolerance:', tolerance);
    
    if (direction === 'forward') {
        console.log('Forward navigation (Tab)');
        
        const rightOnSameLine = placeholdersWithPos.filter(p => {
            const sameLine = Math.abs(p.y - cursorPos.y) <= tolerance;
            const toRight = p.x > cursorPos.x;
            console.log('Placeholder check (right same line):', { 
                x: p.x, y: p.y, 
                cursorX: cursorPos.x, cursorY: cursorPos.y, 
                sameLine, toRight, 
                yDiff: Math.abs(p.y - cursorPos.y)
            });
            return sameLine && toRight;
        });
        
        console.log('Right on same line:', rightOnSameLine.length);
        
        if (rightOnSameLine.length > 0) {
            const closest = rightOnSameLine.reduce((closest, current) => 
                Math.abs(current.x - cursorPos.x) < Math.abs(closest.x - cursorPos.x) ? current : closest
            );
            console.log('Selected closest right:', closest.x);
            return closest;
        }
        
        const belowLines = placeholdersWithPos.filter(p => {
            const below = p.y > cursorPos.y + tolerance;
            console.log('Placeholder check (below):', { 
                x: p.x, y: p.y, 
                cursorY: cursorPos.y, 
                below, 
                yDiff: p.y - cursorPos.y
            });
            return below;
        });
        
        console.log('Below lines:', belowLines.length);
        
        if (belowLines.length > 0) {
            const sortedByY = belowLines.sort((a, b) => a.y - b.y);
            const firstLineY = sortedByY[0].y;
            const firstLine = sortedByY.filter(p => Math.abs(p.y - firstLineY) <= tolerance);
            
            const leftmost = firstLine.reduce((leftmost, current) => 
                current.x < leftmost.x ? current : leftmost
            );
            console.log('Selected leftmost below:', leftmost.x, leftmost.y);
            return leftmost;
        }
        
        const first = placeholdersWithPos.reduce((first, current) => 
            current.y < first.y || (current.y === first.y && current.x < first.x) ? current : first
        );
        console.log('Wrapped to first:', first.x, first.y);
        return first;
        
    } else {
        console.log('Backward navigation (Shift+Tab)');
        
        const leftOnSameLine = placeholdersWithPos.filter(p => {
            const sameLine = Math.abs(p.y - cursorPos.y) <= tolerance;
            const toLeft = p.x < cursorPos.x;
            console.log('Placeholder check (left same line):', { 
                x: p.x, y: p.y, 
                cursorX: cursorPos.x, cursorY: cursorPos.y, 
                sameLine, toLeft, 
                yDiff: Math.abs(p.y - cursorPos.y)
            });
            return sameLine && toLeft;
        });
        
        console.log('Left on same line:', leftOnSameLine.length);
        
        if (leftOnSameLine.length > 0) {
            const closest = leftOnSameLine.reduce((closest, current) => 
                Math.abs(current.x - cursorPos.x) < Math.abs(closest.x - cursorPos.x) ? current : closest
            );
            console.log('Selected closest left:', closest.x);
            return closest;
        }
        
        const aboveLines = placeholdersWithPos.filter(p => {
            const above = p.y < cursorPos.y - tolerance;
            console.log('Placeholder check (above):', { 
                x: p.x, y: p.y, 
                cursorY: cursorPos.y, 
                above, 
                yDiff: cursorPos.y - p.y
            });
            return above;
        });
        
        console.log('Above lines:', aboveLines.length);
        
        if (aboveLines.length > 0) {
            const sortedByY = aboveLines.sort((a, b) => b.y - a.y);
            const lastLineY = sortedByY[0].y;
            const lastLine = sortedByY.filter(p => Math.abs(p.y - lastLineY) <= tolerance);
            
            const rightmost = lastLine.reduce((rightmost, current) => 
                current.x > rightmost.x ? current : rightmost
            );
            console.log('Selected rightmost above:', rightmost.x, rightmost.y);
            return rightmost;
        }
        
        const last = placeholdersWithPos.reduce((last, current) => 
            current.y > last.y || (current.y === last.y && current.x > last.x) ? current : last
        );
        console.log('Wrapped to last:', last.x, last.y);
        return last;
    }
}

/**
 * Gerencia navegação por Tab entre placeholders com consciência de posição do cursor
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleTabNavigation(e) {
    console.log('=== Tab navigation triggered ===', { shiftKey: e.shiftKey });
    
    // Encontra o editor ativo
    const editorContent = document.getElementById('editor-content');
    const blankEditorContent = document.getElementById('blank-editor-content');
    const activeEditor = editorContent && !editorContent.closest('#editor-state').classList.contains('hidden') 
        ? editorContent 
        : blankEditorContent && !blankEditorContent.closest('#blank-editor-state').classList.contains('hidden') 
            ? blankEditorContent 
            : editorContent; // fallback
    
    if (!activeEditor) {
        console.log('No active editor found');
        return;
    }
    
    console.log('Using editor:', activeEditor.id);
    
    // Obtém todos os placeholders disponíveis (não preenchidos)
    const availablePlaceholders = Array.from(activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])'));
    console.log('Available placeholders:', availablePlaceholders.length, availablePlaceholders.map(p => p.textContent));
    
    if (availablePlaceholders.length === 0) {
        console.log('No placeholders available');
        return;
    }
    
    // IMPORTANTE: Previne comportamento padrão do Tab
    e.preventDefault();
    e.stopPropagation();
    console.log('Tab default behavior prevented');
    
    // Obtém posição atual do cursor
    const cursorPos = getCurrentCursorPosition();
    console.log('Cursor position:', cursorPos);
    
    if (!cursorPos) {
        console.log('Could not get cursor position, falling back to first/last placeholder');
        // Fallback: vai para primeiro ou último placeholder
        const targetPlaceholder = e.shiftKey ? availablePlaceholders[availablePlaceholders.length - 1] : availablePlaceholders[0];
        if (targetPlaceholder) {
            console.log('Activating fallback placeholder:', targetPlaceholder.textContent);
            activatePlaceholder(targetPlaceholder);
        }
        return;
    }
    
    // Remove estado ativo de qualquer placeholder atual
    const currentlyActive = activeEditor.querySelector('.placeholder.active');
    if (currentlyActive) {
        console.log('Deactivating current placeholder:', currentlyActive.textContent);
        currentlyActive.classList.remove('active', 'initial-focus');
        const originalText = currentlyActive.dataset.originalText ? 
            currentlyActive.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ') :
            currentlyActive.textContent;
        const currentText = currentlyActive.textContent.trim();
        
        if (currentText === '' || currentText === originalText) {
            currentlyActive.innerHTML = originalText;
            currentlyActive.classList.remove('placeholder-filled');
            currentlyActive.removeAttribute('data-skipped');
        } else {
            currentlyActive.classList.add('placeholder-filled');
            currentlyActive.setAttribute('data-skipped', 'true');
        }
    }
    
    // Recalcula placeholders disponíveis após marcar o atual
    const newAvailablePlaceholders = Array.from(activeEditor.querySelectorAll('.placeholder:not([data-skipped="true"])'));
    console.log('Available placeholders after update:', newAvailablePlaceholders.length);
    
    if (newAvailablePlaceholders.length === 0) {
        console.log('No placeholders available after update');
        if (currentlyActive) currentlyActive.blur();
        return;
    }
    
    // Encontra próximo placeholder baseado na posição do cursor
    const direction = e.shiftKey ? 'backward' : 'forward';
    const placeholdersWithPositions = getPlaceholderSpatialPositions(newAvailablePlaceholders);
    console.log('Placeholders with positions:', placeholdersWithPositions.length);
    
    const nextPlaceholder = findNearestPlaceholder(cursorPos, placeholdersWithPositions, direction);
    console.log('Next placeholder found:', nextPlaceholder ? nextPlaceholder.element.textContent : 'none');
    
    // Ativa o próximo placeholder
    if (nextPlaceholder && nextPlaceholder.element) {
        activatePlaceholder(nextPlaceholder.element);
    } else {
        console.log('No suitable placeholder found, falling back to first/last');
        const fallbackPlaceholder = e.shiftKey ? newAvailablePlaceholders[newAvailablePlaceholders.length - 1] : newAvailablePlaceholders[0];
        if (fallbackPlaceholder) {
            activatePlaceholder(fallbackPlaceholder);
        }
    }
    
    console.log('=== Tab navigation completed ===');
}

/**
 * Ativa um placeholder
 * @param {Element} placeholder - Elemento placeholder para ativar
 */
function activatePlaceholder(placeholder) {
    console.log('Activating placeholder');
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
    console.log('Setting up keyboard listeners...');
    
    // Event listener global para teclado
    document.addEventListener('keydown', handleKeyboardEvents);
    
    // Event listeners específicos para elementos editáveis
    const editorContent = document.getElementById('editor-content');
    const blankEditorContent = document.getElementById('blank-editor-content');
    
    if (editorContent) {
        console.log('Adding keydown listener to editor-content');
        editorContent.addEventListener('keydown', handleKeyboardEvents);
    }
    
    if (blankEditorContent) {
        console.log('Adding keydown listener to blank-editor-content');
        blankEditorContent.addEventListener('keydown', handleKeyboardEvents);
    }
    
    // Função para configurar listeners em editors que podem ser criados dinamicamente
    window.addKeyboardListenerToElement = function(element) {
        if (element && !element.hasAttribute('data-keyboard-listener')) {
            element.addEventListener('keydown', handleKeyboardEvents);
            element.setAttribute('data-keyboard-listener', 'true');
            console.log('Added keyboard listener to element:', element.id || element.tagName);
        }
    };
}

// ========================================
// FUNÇÕES DE UTILIDADE PARA NAVEGAÇÃO
// ========================================

/**
 * Verifica se um elemento está visível na tela
 * @param {Element} element - Elemento a ser verificado
 * @returns {boolean} - True se o elemento estiver visível
 */
function isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

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
window.isElementVisible = isElementVisible;
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
    isElementVisible,
    scrollToElement,
    setupKeyboardListeners,
    getCurrentCursorPosition,
    getPlaceholderSpatialPositions,
    findNearestPlaceholder,
    activatePlaceholder
};
