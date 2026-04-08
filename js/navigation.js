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

const logoHomeBtn = document.getElementById('logo-home-btn');
const dashboardLink = document.getElementById('dashboard-link');
const manageTemplatesLink = document.getElementById('manage-templates-link');
const manageCategoriesLink = document.getElementById('manage-categories-link');
const manageSnippetsLink = document.getElementById('manage-snippets-link');
const navLinks = [dashboardLink, manageTemplatesLink, manageCategoriesLink, manageSnippetsLink].filter(Boolean);

// Novos elementos da UI reorganizada
const newDocumentBtn = document.getElementById('new-document-btn');
const newDocumentDropdown = document.getElementById('new-document-dropdown');
const blankEditorLink = document.getElementById('blank-editor-link');
const fromTemplateLink = document.getElementById('from-template-link');
const headerSearch = document.getElementById('header-search');
const clearSearchBtn = document.getElementById('clear-search');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const appSidebar = document.getElementById('app-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const onboardingHint = document.getElementById('onboarding-hint');
const dismissOnboardingHintBtn = document.getElementById('dismiss-onboarding-hint');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm');
const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');

let confirmModalOnConfirm = null;
let confirmModalOnCancel = null;
let lastFocusedElementBeforeConfirmModal = null;

function setupNavigationListeners() {
    setupSidebarListeners();
    setupOnboardingHint();
    setupConfirmDialogListeners();

    if (logoHomeBtn) {
        logoHomeBtn.addEventListener('click', () => {
            if (window.showDefaultState) {
                window.showDefaultState();
            }
            closeSidebarOnMobile();
        });
    }

    // Link para gerenciamento de templates
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showDefaultState) {
                window.showDefaultState(); 
            }
            closeSidebarOnMobile();
        });
    }

    if (manageTemplatesLink) {
        manageTemplatesLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showTemplatesState) {
                window.showTemplatesState(); 
            }
            closeSidebarOnMobile();
        });
    }
    
    // Link para gerenciamento de categorias
    if (manageCategoriesLink) {
        manageCategoriesLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showCategoriesState) {
                window.showCategoriesState(); 
            }
            closeSidebarOnMobile();
        });
    }
    
    // Link para gerenciamento de snippets
    if (manageSnippetsLink) {
        manageSnippetsLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (window.showSnippetsState) {
                window.showSnippetsState(); 
            }
            closeSidebarOnMobile();
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

        // Fecha dropdown com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && newDocumentDropdown && !newDocumentDropdown.classList.contains('hidden')) {
                closeDropdown();
                newDocumentBtn.focus();
            }
        });
    }

    // Link para editor em branco
    if (blankEditorLink) {
        blankEditorLink.addEventListener('click', (e) => {
            e.preventDefault();
            showBlankEditor();
            closeDropdown();
            closeSidebarOnMobile();
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
            closeSidebarOnMobile();
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

    if (clearSearchBtn && headerSearch) {
        clearSearchBtn.addEventListener('click', () => {
            headerSearch.value = '';
            handleHeaderSearch();
            headerSearch.focus();
        });
    }

}

function setupSidebarListeners() {
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            toggleSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeSidebar(false);
        }
    });
}

function toggleSidebar() {
    if (!appSidebar) return;
    const isOpen = !appSidebar.classList.contains('-translate-x-full');

    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    if (!appSidebar) return;

    appSidebar.classList.remove('-translate-x-full');
    sidebarOverlay?.classList.remove('hidden');
    sidebarToggleBtn?.setAttribute('aria-expanded', 'true');
}

function closeSidebar(restoreToggleFocus = false) {
    if (!appSidebar) return;

    appSidebar.classList.add('-translate-x-full');
    sidebarOverlay?.classList.add('hidden');
    sidebarToggleBtn?.setAttribute('aria-expanded', 'false');

    if (restoreToggleFocus) {
        sidebarToggleBtn?.focus();
    }
}

function closeSidebarOnMobile() {
    if (window.innerWidth < 768) {
        closeSidebar();
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
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink(null);
    }
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
        newDocumentBtn?.setAttribute('aria-expanded', 'true');
        renderQuickTemplates();

        // foco inicial no primeiro item para navegação por teclado
        const firstMenuItem = newDocumentDropdown.querySelector('[role="menuitem"], .template-quick-item');
        firstMenuItem?.focus();
    }
}

function closeDropdown() {
    if (newDocumentDropdown) {
        newDocumentDropdown.classList.add('hidden');
        newDocumentBtn?.setAttribute('aria-expanded', 'false');
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
        item.setAttribute('role', 'menuitem');
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

function syncSearchInputs(query = '', source = 'header') {
    const normalizedQuery = (query || '').trim();

    const dashboardSearch = document.getElementById('template-search');
    if (source !== 'dashboard' && dashboardSearch && dashboardSearch.value !== normalizedQuery) {
        dashboardSearch.value = normalizedQuery;
    }

    if (source !== 'header' && headerSearch && headerSearch.value !== normalizedQuery) {
        headerSearch.value = normalizedQuery;
    }

    const clearBtn = document.getElementById('clear-search');
    if (clearBtn) {
        clearBtn.classList.toggle('hidden', !normalizedQuery);
    }
}

function handleHeaderSearch(e) {
    const query = e ? e.target.value.trim() : (headerSearch?.value || '').trim();
    syncSearchInputs(query, 'header');

    // Implementa busca global se estivermos no dashboard
    const defaultState = document.getElementById('default-state');
    if (defaultState && !defaultState.classList.contains('hidden')) {
        const selectedCategory = document.getElementById('category-filter')?.value || '';
        if (window.performSearch) {
            window.performSearch(query, selectedCategory);
        }
    }
}

function setActiveNavigationLink(linkId = null) {
    navLinks.forEach(link => {
        link.classList.remove('nav-link-active');
        link.removeAttribute('aria-current');
    });

    if (!linkId) return;

    const activeLink = document.getElementById(linkId);
    if (!activeLink) return;

    activeLink.classList.add('nav-link-active');
    activeLink.setAttribute('aria-current', 'page');
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

function updateCounterBadge(elementId, count, singularLabel, pluralLabel) {
    const counterEl = document.getElementById(elementId);
    if (!counterEl) return;

    counterEl.textContent = String(count);
    counterEl.classList.toggle('hidden', count === 0);
    counterEl.setAttribute('aria-label', `${count} ${count === 1 ? singularLabel : pluralLabel}`);
}

function updateSnippetCounter() {
    const snippetCount = window.snippets ? Object.keys(window.snippets).length : 0;
    updateCounterBadge('header-snippet-count', snippetCount, 'snippet', 'snippets');
}

function updateTemplateCounter() {
    const templateCount = window.templates ? Object.keys(window.templates).length : 0;
    updateCounterBadge('header-template-count', templateCount, 'template', 'templates');
}

function updateCategoryCounter() {
    const categoryCount = window.categories ? Object.keys(window.categories).length : 0;
    updateCounterBadge('header-category-count', categoryCount, 'categoria', 'categorias');
}

function updateNavigationCounters() {
    updateSnippetCounter();
    updateTemplateCounter();
    updateCategoryCounter();
}

function setupOnboardingHint() {
    if (!onboardingHint || !dismissOnboardingHintBtn) return;

    const dismissed = localStorage.getItem('evoluirMD_onboarding_hint_dismissed') === 'true';
    if (!dismissed) {
        onboardingHint.classList.remove('hidden');
    }

    dismissOnboardingHintBtn.addEventListener('click', () => {
        onboardingHint.classList.add('hidden');
        localStorage.setItem('evoluirMD_onboarding_hint_dismissed', 'true');
    });
}

function setupConfirmDialogListeners() {
    if (!confirmModal || !confirmModalConfirmBtn || !confirmModalCancelBtn) return;

    confirmModalConfirmBtn.addEventListener('click', () => {
        const callback = confirmModalOnConfirm;
        closeConfirmDialog();
        if (typeof callback === 'function') callback();
    });

    confirmModalCancelBtn.addEventListener('click', () => {
        const callback = confirmModalOnCancel;
        closeConfirmDialog();
        if (typeof callback === 'function') callback();
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeConfirmDialog();
        }
    });
}

function showConfirmDialog(message, onConfirm, onCancel = null) {
    if (!confirmModal || !confirmModalMessage) {
        if (window.confirm(message)) {
            if (typeof onConfirm === 'function') onConfirm();
        } else if (typeof onCancel === 'function') {
            onCancel();
        }
        return;
    }

    lastFocusedElementBeforeConfirmModal = document.activeElement;
    confirmModalMessage.textContent = message;
    confirmModalOnConfirm = onConfirm;
    confirmModalOnCancel = onCancel;
    confirmModal.classList.remove('hidden');
    confirmModal.setAttribute('aria-hidden', 'false');
    confirmModalConfirmBtn.focus();
}

function closeConfirmDialog() {
    if (!confirmModal) return;

    const wasOpen = !confirmModal.classList.contains('hidden');

    confirmModal.classList.add('hidden');
    confirmModal.setAttribute('aria-hidden', 'true');
    confirmModalOnConfirm = null;
    confirmModalOnCancel = null;

    if (wasOpen && lastFocusedElementBeforeConfirmModal instanceof HTMLElement) {
        lastFocusedElementBeforeConfirmModal.focus();
    }

    lastFocusedElementBeforeConfirmModal = null;
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

    let toastContainer = document.getElementById('app-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'app-toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-[60] flex max-w-sm flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `text-white px-4 py-3 rounded-lg shadow-xl border border-white/20 pointer-events-auto ${colors[type] || colors.info}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-4px)';
        setTimeout(() => {
            toast.remove();
            if (toastContainer && toastContainer.childElementCount === 0) {
                toastContainer.remove();
            }
        }, 250);
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
    updateNavigationCounters();
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
window.updateTemplateCounter = updateTemplateCounter;
window.updateCategoryCounter = updateCategoryCounter;
window.updateNavigationCounters = updateNavigationCounters;
window.showAppNotification = showAppNotification;
window.showConfirmDialog = showConfirmDialog;
window.closeConfirmDialog = closeConfirmDialog;
window.setActiveNavigationLink = setActiveNavigationLink;
window.syncSearchInputs = syncSearchInputs;

// Exporta funções para uso em outros módulos
export {
    setupNavigationListeners,
    setupAllListeners,
    showBlankEditor,
    updateModeIndicator,
    updateSnippetCounter,
    updateTemplateCounter,
    updateCategoryCounter,
    updateNavigationCounters,
    showAppNotification,
    showConfirmDialog,
    closeConfirmDialog,
    setActiveNavigationLink,
    syncSearchInputs
};
