/**
 * ========================================
 * SISTEMA DE TEMPLATES
 * ========================================
 * 
 * Este módulo é responsável por gerenciar o sistema de templates,
 * incluindo renderização da sidebar, CRUD e modais
 */

// ========================================
// SELETORES DE ELEMENTOS DE TEMPLATES
// ========================================

const templateListSidebar = document.getElementById('template-list-sidebar');
const templatesListContainer = document.getElementById('templates-list-container');
const templateModal = document.getElementById('template-modal');
const templateForm = document.getElementById('template-form');
const createNewTemplateBtn = document.getElementById('create-new-template-btn');
const cancelTemplateBtn = document.getElementById('cancel-template-btn');

// ========================================
// FUNÇÕES DE RENDERIZAÇÃO DE TEMPLATES
// ========================================

/**
 * Renderiza o dashboard com templates recentes e todos os templates
 */
function renderDashboard() {
    renderRecentTemplates();
    renderAllTemplates();
    renderCategoryFilter();
}

/**
 * Renderiza os templates recentemente usados
 */
function renderRecentTemplates() {
    const recentGrid = document.getElementById('recent-templates-grid');
    const noRecentDiv = document.getElementById('no-recent-templates');
    const recentSection = document.getElementById('recent-templates-section');
    
    if (!recentGrid || !noRecentDiv || !recentSection) return;
    
    const recentTemplates = window.getRecentlyUsedTemplates ? window.getRecentlyUsedTemplates(6) : [];
    
    if (recentTemplates.length === 0) {
        recentGrid.innerHTML = '';
        noRecentDiv.classList.remove('hidden');
        recentSection.classList.add('hidden');
        return;
    }
    
    recentSection.classList.remove('hidden');
    noRecentDiv.classList.add('hidden');
    
    recentGrid.innerHTML = recentTemplates
        .map(({ key, template }) => createTemplateCard(key, template, true))
        .join('');
    
    // Adiciona event listeners
    addCardEventListeners(recentGrid);
}

/**
 * Renderiza o filtro de categorias
 */
function renderCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    // Limpa opções existentes (mantém a primeira)
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Adiciona categorias disponíveis
    if (window.getAllCategories) {
        const categories = window.getAllCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            option.style.color = category.color;
            categoryFilter.appendChild(option);
        });
    }
}

/**
 * Renderiza todos os templates
 */
function renderAllTemplates(filteredTemplates = null) {
    const allGrid = document.getElementById('all-templates-grid');
    const noTemplatesDiv = document.getElementById('no-templates-found');
    
    if (!allGrid || !noTemplatesDiv) return;
    
    const templates = filteredTemplates || window.templates || {};
    const templateEntries = Object.entries(templates);
    
    if (templateEntries.length === 0) {
        allGrid.innerHTML = '';
        noTemplatesDiv.classList.remove('hidden');
        return;
    }
    
    noTemplatesDiv.classList.add('hidden');
    
    // Ordena templates por data de criação (mais recentes primeiro)
    const sortedTemplates = templateEntries.sort((a, b) => {
        const dateA = a[1].createdAt || 0;
        const dateB = b[1].createdAt || 0;
        return dateB - dateA;
    });
    
    allGrid.innerHTML = sortedTemplates
        .map(([key, template]) => createTemplateCard(key, template, false))
        .join('');
    
    // Adiciona event listeners
    addCardEventListeners(allGrid);
}

/**
 * Cria HTML para um card de template
 * @param {string} key - Chave do template
 * @param {Object} template - Dados do template
 * @param {boolean} isRecent - Se é da seção de recentes
 * @returns {string} HTML do card
 */
function createTemplateCard(key, template, isRecent = false) {
    const preview = getTemplatePreview(template.content);
    const isFavorite = template.isFavorite || false;
    
    // Busca a categoria pelo ID ou usa valores padrão
    const category = window.getCategoryById ? window.getCategoryById(template.categoryId) : null;
    const categoryName = category ? category.name : (template.category || 'Geral');
    const categoryColor = category ? category.color : '#6B7280';
    
    return `
        <div class="template-card" data-key="${key}">
            <div class="template-card-header">
                <div class="template-card-header-left">
                    ${isRecent ? '<div class="recent-badge">Recente</div>' : ''}
                    <h3 class="template-card-title">${escapeHtml(template.title)}</h3>
                </div>
                <button 
                    class="template-card-favorite ${isFavorite ? 'favorited' : ''}" 
                    data-key="${key}"
                    onclick="event.stopPropagation(); toggleFavorite('${key}')"
                >
                    ${isFavorite ? '★' : '☆'}
                </button>
            </div>
            
            <div class="template-card-preview">${escapeHtml(preview)}</div>
            
            <div class="template-card-footer">
                <div class="template-card-meta">
                    <div class="template-card-category" style="background-color: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}40;">
                        ${escapeHtml(categoryName)}
                    </div>
                </div>
                
                <div class="template-card-actions">
                    <button class="template-card-action" onclick="event.stopPropagation(); useTemplate('${key}')">
                        Usar
                    </button>
                    <button class="template-card-action secondary" onclick="event.stopPropagation(); editTemplate('${key}')">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Adiciona event listeners para os cards de template
 * @param {Element} container - Container dos cards
 */
function addCardEventListeners(container) {
    const cards = container.querySelectorAll('.template-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.template-card-favorite') || 
                e.target.closest('.template-card-actions')) {
                return;
            }
            const key = card.dataset.key;
            if (key && window.loadTemplate) {
                window.loadTemplate(key);
            }
        });
    });
}

/**
 * Obtém uma prévia do conteúdo do template
 * @param {string} content - Conteúdo do template
 * @returns {string} Prévia do conteúdo
 */
function getTemplatePreview(content) {
    if (!content) return 'Sem conteúdo disponível';
    
    // Remove placeholders para a prévia
    const cleaned = content.replace(/\{\{[^}]+\}\}/g, '[campo]');
    
    // Pega as primeiras linhas
    const lines = cleaned.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 2).join(' ').trim();
    
    return preview.length > 120 ? preview.substring(0, 120) + '...' : preview;
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto para escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Usa um template (carrega no editor)
 * @param {string} key - Chave do template
 */
function useTemplate(key) {
    if (window.loadTemplate) {
        window.loadTemplate(key);
    }
    if (window.showEditorState) {
        window.showEditorState();
    }
}

/**
 * Abre o modal de edição para um template
 * @param {string} key - Chave do template
 */
function editTemplate(key) {
    if (window.openTemplateModal) {
        window.openTemplateModal(key);
    }
}

/**
 * Alterna o status de favorito de um template
 * @param {string} key - Chave do template
 */
function toggleFavorite(key) {
    if (window.toggleTemplateFavorite) {
        window.toggleTemplateFavorite(key);
        renderDashboard(); // Re-renderiza para atualizar o ícone
    }
}



/**
 * Renderiza a lista de templates na tela de gerenciamento
 * Mostra botões de editar e excluir para cada template
 */
function renderTemplatesManagementList() {
    if (!templatesListContainer) return;
    
    templatesListContainer.innerHTML = '';
    
    if (!window.templates || Object.keys(window.templates).length === 0) {
        templatesListContainer.innerHTML = `<p class="text-gray-400">Você ainda não criou nenhum template.</p>`;
        return;
    }
    
    // Cria um card para cada template
    for (const key in window.templates) {
        const template = window.templates[key];
        const el = document.createElement('div');
        el.className = 'bg-[#2D2D2D] p-4 rounded-lg flex justify-between items-center border border-gray-700/50';
        el.innerHTML = `
            <div>
                <h3 class="font-bold text-lg text-gray-200">${template.title}</h3>
            </div>
            <div class="space-x-2">
                <button data-key="${key}" class="edit-template-btn text-blue-400 hover:text-blue-300">Editar</button>
                <button data-key="${key}" class="delete-template-btn text-red-400 hover:text-red-300">Excluir</button>
            </div>
        `;
        templatesListContainer.appendChild(el);
    }
    
    // Adiciona event listeners para os botões
    document.querySelectorAll('.edit-template-btn').forEach(btn => 
        btn.addEventListener('click', () => openTemplateModal(btn.dataset.key))
    );
    document.querySelectorAll('.delete-template-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteTemplate(btn.dataset.key))
    );
}

// ========================================
// FUNÇÕES DE GERENCIAMENTO DE TEMPLATES
// ========================================

/**
 * Abre o modal para criar ou editar um template
 * @param {string} key - Chave do template para edição (null para criação)
 */
function openTemplateModal(key = null) {
    if (!templateForm) return;
    
    templateForm.reset();
    const titleEl = document.getElementById('template-modal-title');
    const originalKeyInput = document.getElementById('template-original-key');
    const categorySelect = document.getElementById('template-category-select');
    
    // Renderiza opções de categoria
    if (window.renderCategoryOptions && categorySelect) {
        window.renderCategoryOptions(categorySelect, key ? window.templates[key]?.categoryId : 'geral');
    }
    
    if (key) {
        // Modo de edição
        titleEl.textContent = 'Editar Template';
        const template = window.templates[key];
        originalKeyInput.value = key;
        document.getElementById('template-title-input').value = template.title;
        document.getElementById('template-content-input').value = template.content;
        
        // Seleciona a categoria atual
        if (categorySelect && template.categoryId) {
            categorySelect.value = template.categoryId;
        }
    } else {
        // Modo de criação
        titleEl.textContent = 'Criar Template';
        originalKeyInput.value = '';
        
        // Seleciona categoria padrão
        if (categorySelect) {
            categorySelect.value = 'geral';
        }
    }
    
    templateModal.classList.remove('hidden');
}

/**
 * Fecha o modal de template
 */
function closeTemplateModal() {
    if (templateModal) {
        templateModal.classList.add('hidden');
    }
}

/**
 * Salva um template (criação ou edição)
 * @param {Event} e - Evento do formulário
 */
function handleSaveTemplate(e) {
    e.preventDefault();
    
    const title = document.getElementById('template-title-input').value.trim();
    const content = document.getElementById('template-content-input').value.trim();
    const categorySelect = document.getElementById('template-category-select');
    const categoryId = categorySelect ? categorySelect.value : 'geral';
    let key = document.getElementById('template-original-key').value;
    
    if (!key) {
        // Criando novo template
        key = `template_${Date.now()}`;
    }
    
    // Mantém dados existentes ou cria novos
    const existingTemplate = window.templates[key] || {};
    const now = Date.now();
    
    window.templates[key] = {
        title,
        content,
        lastUsed: existingTemplate.lastUsed || null,
        usageCount: existingTemplate.usageCount || 0,
        isFavorite: existingTemplate.isFavorite || false,
        categoryId: categoryId,
        createdAt: existingTemplate.createdAt || now
    };
    
    // Salva no localStorage
    if (window.saveTemplatesToStorage) {
        window.saveTemplatesToStorage();
    }
    
    closeTemplateModal();
    renderTemplatesManagementList();
    renderDashboard(); // Atualiza o dashboard
}

/**
 * Exclui um template
 * @param {string} key - Chave do template a ser excluído
 */
function deleteTemplate(key) {
    delete window.templates[key];
    
    // Salva no localStorage
    if (window.saveTemplatesToStorage) {
        window.saveTemplatesToStorage();
    }
    
    renderTemplatesManagementList();
    renderDashboard(); // Atualiza o dashboard
}

// ========================================
// FUNCIONALIDADE DE BUSCA
// ========================================

/**
 * Inicializa a funcionalidade de busca
 */
function initializeSearch() {
    const searchInput = document.getElementById('template-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            const selectedCategory = categoryFilter ? categoryFilter.value : '';
            
            // Debounce para melhor performance
            searchTimeout = setTimeout(() => {
                performSearch(query, selectedCategory);
            }, 300);
        });
        
        // Limpa busca ao pressionar Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                const selectedCategory = categoryFilter ? categoryFilter.value : '';
                performSearch('', selectedCategory);
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            const query = searchInput ? searchInput.value.trim() : '';
            performSearch(query, selectedCategory);
        });
    }
}

/**
 * Executa a busca nos templates
 * @param {string} query - Termo de busca
 * @param {string} categoryId - ID da categoria selecionada
 */
function performSearch(query = '', categoryId = '') {
    const recentSection = document.getElementById('recent-templates-section');
    
    if (!query && !categoryId) {
        // Sem busca nem filtro - mostra estado normal
        document.body.classList.remove('search-active');
        if (recentSection) recentSection.classList.remove('hidden');
        renderAllTemplates();
        return;
    }
    
    // Estado de busca/filtro ativo
    document.body.classList.add('search-active');
    if (recentSection) recentSection.classList.add('hidden');
    
    // Filtra templates baseado na query e categoria
    const filteredTemplates = filterTemplates(query, categoryId);
    renderAllTemplates(filteredTemplates);
}

/**
 * Filtra templates baseado no termo de busca e categoria
 * @param {string} query - Termo de busca
 * @param {string} categoryId - ID da categoria
 * @returns {Object} Templates filtrados
 */
function filterTemplates(query = '', categoryId = '') {
    if (!window.templates) return {};
    
    const lowerQuery = query.toLowerCase();
    const filtered = {};
    
    Object.entries(window.templates).forEach(([key, template]) => {
        let matches = true;
        
        // Filtro por categoria
        if (categoryId && template.categoryId !== categoryId) {
            matches = false;
        }
        
        // Filtro por texto (apenas se há query)
        if (matches && query) {
            const matchTitle = template.title.toLowerCase().includes(lowerQuery);
            const matchContent = template.content.toLowerCase().includes(lowerQuery);
            
            // Busca na categoria usando o novo sistema
            const category = window.getCategoryById ? window.getCategoryById(template.categoryId) : null;
            const categoryName = category ? category.name : (template.category || 'Geral');
            const matchCategory = categoryName.toLowerCase().includes(lowerQuery);
            
            matches = matchTitle || matchContent || matchCategory;
        }
        
        if (matches) {
            filtered[key] = template;
        }
    });
    
    return filtered;
}

// ========================================
// EVENT LISTENERS DE TEMPLATES
// ========================================

/**
 * Configura os event listeners de templates
 */
function setupTemplatesListeners() {
    // Event listeners para botões de templates
    if (createNewTemplateBtn) {
        createNewTemplateBtn.addEventListener('click', () => openTemplateModal());
    }
    
    if (cancelTemplateBtn) {
        cancelTemplateBtn.addEventListener('click', closeTemplateModal);
    }
    
    if (templateForm) {
        templateForm.addEventListener('submit', handleSaveTemplate);
    }
    
    // Inicializa busca
    initializeSearch();
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.renderTemplatesManagementList = renderTemplatesManagementList;
window.openTemplateModal = openTemplateModal;
window.closeTemplateModal = closeTemplateModal;
window.handleSaveTemplate = handleSaveTemplate;
window.deleteTemplate = deleteTemplate;
window.setupTemplatesListeners = setupTemplatesListeners;
window.renderDashboard = renderDashboard;
window.renderRecentTemplates = renderRecentTemplates;
window.renderAllTemplates = renderAllTemplates;
window.renderCategoryFilter = renderCategoryFilter;
window.useTemplate = useTemplate;
window.editTemplate = editTemplate;
window.toggleFavorite = toggleFavorite;

// Exporta funções para uso em outros módulos
export {
    renderTemplatesManagementList,
    openTemplateModal,
    closeTemplateModal,
    handleSaveTemplate,
    deleteTemplate,
    setupTemplatesListeners,
    renderDashboard,
    renderRecentTemplates,
    renderAllTemplates,
    renderCategoryFilter,
    useTemplate,
    editTemplate,
    toggleFavorite
};
