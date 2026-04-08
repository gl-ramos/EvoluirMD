/**
 * ========================================
 * GERENCIADOR DE ESTADOS DA INTERFACE
 * ========================================
 * 
 * Este módulo é responsável por controlar a navegação
 * entre os diferentes estados da aplicação (padrão, editor, snippets, templates)
 */

// ========================================
// SELETORES DE ELEMENTOS DOS ESTADOS
// ========================================

// Estados da interface
const defaultState = document.getElementById('default-state');
const editorState = document.getElementById('editor-state');
const snippetsState = document.getElementById('snippets-state');
const templatesState = document.getElementById('templates-state');
const categoriesState = document.getElementById('categories-state');

// ========================================
// FUNÇÕES DE NAVEGAÇÃO ENTRE ESTADOS
// ========================================

/**
 * Esconde todos os estados da interface
 */
function hideAllStates() {
    const states = [editorState, snippetsState, templatesState, categoriesState, defaultState];
    states.forEach(state => {
        if (state) {
            state.classList.add('hidden');
        }
    });
}

/**
 * Mostra o estado padrão (dashboard)
 * Oculta todos os outros estados e renderiza o dashboard
 */
function showDefaultState() {
    hideAllStates();
    defaultState.classList.remove('hidden');
    
    // Limpa estado do editor
    if (window.currentTemplateId) {
        window.currentTemplateId = null;
    }
    
    // Esconde tooltip de snippets se estiver visível
    if (window.hideSnippetTooltip) {
        window.hideSnippetTooltip();
    }
    
    // Atualiza header e indicadores
    if (window.updateModeIndicator) {
        window.updateModeIndicator('dashboard', 'Dashboard');
    }
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink('dashboard-link');
    }
    
    // Renderiza o dashboard
    if (window.renderDashboard) {
        window.renderDashboard();
    }
}

/**
 * Mostra o estado do editor
 * Oculta todos os outros estados
 */
function showEditorState() {
    hideAllStates();
    editorState.classList.remove('hidden');
    
    // Atualiza header e indicadores
    if (window.updateModeIndicator) {
        window.updateModeIndicator('template', 'Editor de Template');
    }
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink(null);
    }
}

/**
 * Mostra o estado de gerenciamento de snippets
 * Oculta todos os outros estados e renderiza a lista
 */
function showSnippetsState() {
    hideAllStates();
    snippetsState.classList.remove('hidden');
    
    // Atualiza header e indicadores
    if (window.updateModeIndicator) {
        window.updateModeIndicator('snippets', 'Gerenciar Snippets');
    }
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink('manage-snippets-link');
    }
    
    // Renderiza lista de snippets
    if (window.renderSnippetsList) {
        window.renderSnippetsList();
    }
}

/**
 * Mostra o estado de gerenciamento de templates
 * Oculta todos os outros estados e renderiza a lista
 */
function showTemplatesState() {
    hideAllStates();
    templatesState.classList.remove('hidden');
    
    // Atualiza header e indicadores
    if (window.updateModeIndicator) {
        window.updateModeIndicator('template', 'Gerenciar Templates');
    }
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink('manage-templates-link');
    }
    
    // Renderiza lista de templates
    if (window.renderTemplatesManagementList) {
        window.renderTemplatesManagementList();
    }
}

/**
 * Mostra o estado de gerenciamento de categorias
 * Oculta todos os outros estados e renderiza a lista
 */
function showCategoriesState() {
    hideAllStates();
    categoriesState.classList.remove('hidden');
    
    // Atualiza header e indicadores
    if (window.updateModeIndicator) {
        window.updateModeIndicator('template', 'Gerenciar Categorias');
    }
    if (window.setActiveNavigationLink) {
        window.setActiveNavigationLink('manage-categories-link');
    }
    
    // Renderiza lista de categorias
    if (window.renderCategoriesManagementList) {
        window.renderCategoriesManagementList();
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.hideAllStates = hideAllStates;
window.showDefaultState = showDefaultState;
window.showEditorState = showEditorState;
window.showSnippetsState = showSnippetsState;
window.showTemplatesState = showTemplatesState;
window.showCategoriesState = showCategoriesState;

// Exporta funções para uso em outros módulos
export {
    hideAllStates,
    showDefaultState,
    showEditorState,
    showSnippetsState,
    showTemplatesState,
    showCategoriesState
};
