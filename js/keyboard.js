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
    if (e.key === 'Tab' && window.currentTemplateId) {
        handleTabNavigation(e);
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

/**
 * Gerencia navegação por Tab entre placeholders
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleTabNavigation(e) {
    const editorContent = document.getElementById('editor-content');
    if (!editorContent) return;
    
    const currentlyActive = editorContent.querySelector('.placeholder.active');
    
    // Só previne comportamento padrão se houver um placeholder ativo
    if (currentlyActive) {
        e.preventDefault();
    } else {
        return;
    }
    
    const availablePlaceholders = Array.from(editorContent.querySelectorAll('.placeholder:not([data-skipped="true"])'));
    if (availablePlaceholders.length === 0) return;
    
    // Remove estado ativo do placeholder atual
    if (currentlyActive) {
        currentlyActive.classList.remove('active', 'initial-focus');
        const originalText = currentlyActive.dataset.originalText.replace(/[{}]/g, '').replace(/_/g, ' ');
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
    
    // Recalcula lista de placeholders disponíveis APÓS marcar o atual
    const newAvailablePlaceholders = Array.from(editorContent.querySelectorAll('.placeholder:not([data-skipped="true"])'));
    if (newAvailablePlaceholders.length === 0) {
        currentlyActive.blur(); // Tira o foco se não houver mais para onde ir
        return;
    }
    
    // Calcula próximo placeholder
    let nextIndex;
    if (e.shiftKey) {
        const newCurrentIndex = newAvailablePlaceholders.indexOf(currentlyActive);
        nextIndex = (newCurrentIndex - 1 + newAvailablePlaceholders.length) % newAvailablePlaceholders.length;
    } else {
        const newCurrentIndex = newAvailablePlaceholders.indexOf(currentlyActive);
        nextIndex = (newCurrentIndex + 1) % newAvailablePlaceholders.length;
    }
    
    const nextPlaceholder = newAvailablePlaceholders[nextIndex];
    
    // Ativa o próximo placeholder
    if (nextPlaceholder) {
        nextPlaceholder.classList.remove('placeholder-filled');
        nextPlaceholder.classList.add('active');
        nextPlaceholder.focus();
        
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(nextPlaceholder);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// ========================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ========================================

/**
 * Configura todos os event listeners de teclado
 */
function setupKeyboardListeners() {
    // Event listener global para teclado
    document.addEventListener('keydown', handleKeyboardEvents);
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

// Exporta funções para uso em outros módulos
export {
    handleKeyboardEvents,
    handleTooltipNavigation,
    handleTabNavigation,
    navigateTooltipItems,
    isElementVisible,
    scrollToElement,
    setupKeyboardListeners
};
