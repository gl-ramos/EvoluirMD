/**
 * ========================================
 * NAVEGAÇÃO E EVENT LISTENERS DA UI
 * ========================================
 * 
 * Este módulo é responsável por gerenciar os links de navegação
 * e configurar os event listeners da interface do usuário
 */

// ========================================
// SELETORES DE ELEMENTOS DE NAVEGAÇÃO
// ========================================

const dashboardLink = document.getElementById('dashboard-link');
const manageTemplatesLink = document.getElementById('manage-templates-link');
const manageCategoriesLink = document.getElementById('manage-categories-link');
const manageSnippetsLink = document.getElementById('manage-snippets-link');

// Novos elementos da UI reorganizada
const newDocumentBtn = document.getElementById('new-document-btn');
const newDocumentDropdown = document.getElementById('new-document-dropdown');
const blankEditorLink = document.getElementById('blank-editor-link');
const fromTemplateLink = document.getElementById('from-template-link');
const headerSearch = document.getElementById('header-search');

function setupNavigationListeners() {
    // Link para gerenciamento de templates
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showDefaultState) {
                window.showDefaultState(); 
            }
        });
    }

    if (manageTemplatesLink) {
        manageTemplatesLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showTemplatesState) {
                window.showTemplatesState(); 
            }
        });
    }
    
    // Link para gerenciamento de categorias
    if (manageCategoriesLink) {
        manageCategoriesLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showCategoriesState) {
                window.showCategoriesState(); 
            }
        });
    }
    
    // Link para gerenciamento de snippets
    if (manageSnippetsLink) {
        manageSnippetsLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showSnippetsState) {
                window.showSnippetsState(); 
            }
        });
    }

    // Novo botão de documento e dropdown
    if (newDocumentBtn && newDocumentDropdown) {
        newDocumentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDropdown();
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!newDocumentBtn.contains(e.target) && !newDocumentDropdown.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // Link para editor em branco
    if (blankEditorLink) {
        blankEditorLink.addEventListener('click', (e) => {
            e.preventDefault();
            showBlankEditor();
            closeDropdown();
        });
    }

    // Link para usar template (vai para dashboard)
    if (fromTemplateLink) {
        fromTemplateLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.showDefaultState) {
                window.showDefaultState();
            }
            closeDropdown();
        });
    }

    // Busca no header
    if (headerSearch) {
        headerSearch.addEventListener('input', handleHeaderSearch);
        headerSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                headerSearch.value = '';
                handleHeaderSearch();
            }
        });
    }


}

function showBlankEditor() {
    if (window.hideAllStates) {
        window.hideAllStates();
    }
    const editorState = document.getElementById('editor-state');
    
    if (editorState) {
        editorState.classList.remove('hidden');
        
        // Carrega o editor em modo branco
        if (window.loadBlankEditor) {
            window.loadBlankEditor();
        }
    }

    updateModeIndicator('blank-editor', 'Editor em Branco');
}

function toggleDropdown() {
    if (newDocumentDropdown) {
        const isHidden = newDocumentDropdown.classList.contains('hidden');
        if (isHidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    }
}

function openDropdown() {
    if (newDocumentDropdown) {
        newDocumentDropdown.classList.remove('hidden');
        renderQuickTemplates();
    }
}

function closeDropdown() {
    if (newDocumentDropdown) {
        newDocumentDropdown.classList.add('hidden');
    }
}

function renderQuickTemplates() {
    const quickTemplatesList = document.getElementById('quick-templates-list');
    if (!quickTemplatesList) return;

    quickTemplatesList.innerHTML = '';

    if (!window.templates || Object.keys(window.templates).length === 0) {
        quickTemplatesList.innerHTML = '<div class="text-xs text-gray-500 px-2 py-1">Nenhum template disponível</div>';
        return;
    }

    // Pega os 3 templates mais recentes ou favoritos
    const templateEntries = Object.entries(window.templates)
        .sort((a, b) => {
            const [keyA, templateA] = a;
            const [keyB, templateB] = b;
            
            // Favoritos primeiro
            if (templateA.isFavorite && !templateB.isFavorite) return -1;
            if (!templateA.isFavorite && templateB.isFavorite) return 1;
            
            // Depois por último uso
            const lastUsedA = templateA.lastUsed || 0;
            const lastUsedB = templateB.lastUsed || 0;
            return lastUsedB - lastUsedA;
        })
        .slice(0, 3);

    templateEntries.forEach(([key, template]) => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'template-quick-item';
        item.textContent = template.title;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.useTemplate) {
                window.useTemplate(key);
            } else if (window.loadTemplate) {
                window.loadTemplate(key);
                if (window.showEditorState) {
                    window.showEditorState();
                }
            }
            closeDropdown();
        });
        quickTemplatesList.appendChild(item);
    });
}

function handleHeaderSearch(e) {
    const query = e ? e.target.value.trim() : headerSearch.value.trim();
    const clearBtn = document.getElementById('clear-search');
    
    if (clearBtn) {
        if (query) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    // Implementa busca global se estivermos no dashboard
    const defaultState = document.getElementById('default-state');
    if (defaultState && !defaultState.classList.contains('hidden')) {
        if (window.performSearch) {
            window.performSearch(query);
        }
    }
}

function updateModeIndicator(mode, text) {
    const modeIcon = document.getElementById('mode-icon');
    const modeText = document.getElementById('mode-text');
    
    if (modeIcon) {
        // Remove todas as classes de modo
        modeIcon.className = 'w-4 h-4 rounded-full mode-indicator-dot';
        modeIcon.classList.add(mode);
    }
    
    if (modeText) {
        modeText.textContent = text;
    }
}

function updateSnippetCounter() {
    const snippetCount = window.snippets ? Object.keys(window.snippets).length : 0;
    // Note: header-snippet-count element doesn't exist in HTML yet
    // Future enhancement: Add snippet counter to header if needed
}

/**
 * Exibe uma notificação não-bloqueante na interface
 * @param {string} message - Mensagem a ser exibida
 * @param {'success'|'error'|'info'} type - Tipo da mensagem
 */
function showAppNotification(message, type = 'info') {
    if (!message) return;

    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[60] text-white px-4 py-3 rounded-lg shadow-xl border border-white/20 ${colors[type] || colors.info}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.25s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, 2500);
}

/**
 * Configura todos os event listeners da aplicação
 */
function setupAllListeners() {
    setupNavigationListeners();
    
    // Configura listeners de outros módulos se disponíveis
    if (window.setupEditorListeners) {
        window.setupEditorListeners();
    }

    if (window.setupSnippetsListeners) {
        window.setupSnippetsListeners();
    }
    
    if (window.setupTemplatesListeners) {
        window.setupTemplatesListeners();
    }
    
    if (window.setupCategoriesListeners) {
        window.setupCategoriesListeners();
    }
    
    if (window.setupKeyboardListeners) {
        window.setupKeyboardListeners();
    }

    // Atualiza contadores iniciais
    updateSnippetCounter();
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.setupNavigationListeners = setupNavigationListeners;
window.setupAllListeners = setupAllListeners;
window.showBlankEditor = showBlankEditor;
window.updateModeIndicator = updateModeIndicator;
window.updateSnippetCounter = updateSnippetCounter;
window.showAppNotification = showAppNotification;

// Exporta funções para uso em outros módulos
export {
    setupNavigationListeners,
    setupAllListeners,
    showBlankEditor,
    updateModeIndicator,
    updateSnippetCounter,
    showAppNotification
};