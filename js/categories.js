/**
 * ========================================
 * SISTEMA DE CATEGORIAS DINÂMICAS
 * ========================================
 * 
 * Este módulo é responsável por gerenciar as categorias dinâmicas,
 * incluindo CRUD, renderização e validação
 */

// ========================================
// SELETORES DE ELEMENTOS DE CATEGORIAS
// ========================================

const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const createNewCategoryBtn = document.getElementById('create-new-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const categoriesListContainer = document.getElementById('categories-list-container');
let lastFocusedElementBeforeCategoryModal = null;

// ========================================
// FUNÇÕES CRUD DE CATEGORIAS
// ========================================

/**
 * Cria uma nova categoria
 * @param {string} name - Nome da categoria
 * @param {string} color - Cor da categoria (hex)
 * @returns {string} ID da categoria criada
 */
function createCategory(name, color) {
    const id = generateCategoryId(name);
    const now = Date.now();

    if (!id) {
        throw new Error('Nome inválido para categoria');
    }
    
    if (window.categories[id]) {
        throw new Error('Uma categoria com este nome já existe');
    }
    
    window.categories[id] = {
        id: id,
        name: name.trim(),
        color: color,
        isDefault: false,
        createdAt: now
    };
    
    window.saveCategoriesToStorage();
    return id;
}

/**
 * Atualiza uma categoria existente
 * @param {string} id - ID da categoria
 * @param {string} name - Novo nome
 * @param {string} color - Nova cor
 */
function updateCategory(id, name, color) {
    if (!window.categories[id]) {
        throw new Error('Categoria não encontrada');
    }
    
    const newId = generateCategoryId(name);
    if (!newId) {
        throw new Error('Nome inválido para categoria');
    }
    
    // Se o ID mudou, precisamos mover a categoria
    if (newId !== id) {
        if (window.categories[newId]) {
            throw new Error('Uma categoria com este nome já existe');
        }
        
        // Cria nova categoria com novo ID
        window.categories[newId] = {
            ...window.categories[id],
            id: newId,
            name: name.trim(),
            color: color
        };
        
        // Atualiza templates que usam esta categoria
        updateTemplatesCategoryId(id, newId);
        
        // Remove categoria antiga
        delete window.categories[id];
    } else {
        // Apenas atualiza os dados
        window.categories[id].name = name.trim();
        window.categories[id].color = color;
    }
    
    window.saveCategoriesToStorage();
    window.saveTemplatesToStorage();
}

/**
 * Deleta uma categoria
 * @param {string} id - ID da categoria
 */
function deleteCategory(id) {
    if (!window.categories[id]) {
        throw new Error('Categoria não encontrada');
    }
    
    if (window.categories[id].isDefault) {
        if (id === 'geral') {
            throw new Error('A categoria "Geral" não pode ser excluída');
        }
        throw new Error('Categorias padrão não podem ser excluídas');
    }
    
    // Move todos os templates desta categoria para "Geral"
    updateTemplatesCategoryId(id, 'geral');
    
    // Remove a categoria
    delete window.categories[id];
    
    window.saveCategoriesToStorage();
    window.saveTemplatesToStorage();
}

/**
 * Obtém uma categoria por ID
 * @param {string} id - ID da categoria
 * @returns {Object|null} Categoria ou null se não encontrada
 */
function getCategoryById(id) {
    return window.categories[id] || null;
}

/**
 * Obtém todas as categorias como array ordenado
 * @returns {Array} Array de categorias ordenado por nome
 */
function getAllCategories() {
    const categories = Object.values(window.categories);
    return categories.sort((a, b) => {
        // Categoria "Geral" sempre primeiro
        if (a.id === 'geral') return -1;
        if (b.id === 'geral') return 1;
        
        // Depois por nome
        return a.name.localeCompare(b.name);
    });
}

/**
 * Obtém categorias para uso em dropdown
 * @returns {Array} Array de objetos {id, name, color}
 */
function getCategoriesForSelect() {
    return getAllCategories().map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color
    }));
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Gera um ID único para categoria baseado no nome
 * @param {string} name - Nome da categoria
 * @returns {string} ID gerado
 */
function generateCategoryId(name) {
    return name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-')     // Substitui espaços por hífens
        .replace(/-+/g, '-')      // Remove hífens múltiplos
        .replace(/^-|-$/g, '');   // Remove hífens no início e fim
}

/**
 * Atualiza o categoryId nos templates quando uma categoria muda de ID
 * @param {string} oldId - ID antigo
 * @param {string} newId - ID novo
 */
function updateTemplatesCategoryId(oldId, newId) {
    if (!window.templates) return;
    
    Object.values(window.templates).forEach(template => {
        if (template.categoryId === oldId) {
            template.categoryId = newId;
        }
    });
}

/**
 * Valida dados de categoria
 * @param {string} name - Nome da categoria
 * @param {string} color - Cor da categoria
 * @returns {Array} Array de erros (vazio se válido)
 */
function validateCategoryData(name, color) {
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (name && name.trim().length > 50) {
        errors.push('Nome deve ter no máximo 50 caracteres');
    }

    if (name && !generateCategoryId(name)) {
        errors.push('Nome da categoria deve conter letras ou números');
    }
    
    if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
        errors.push('Cor deve ser um código hexadecimal válido');
    }
    
    return errors;
}

/**
 * Normaliza uma cor hexadecimal para formato #RRGGBB em caixa alta
 * @param {string} value
 * @returns {string}
 */
function normalizeHexColor(value) {
    const normalized = (value || '').trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : '';
}

/**
 * Verifica se uma categoria está sendo usada por templates
 * @param {string} id - ID da categoria
 * @returns {number} Número de templates usando esta categoria
 */
function getCategoryUsageCount(id) {
    if (!window.templates) return 0;
    
    return Object.values(window.templates)
        .filter(template => template.categoryId === id)
        .length;
}

// ========================================
// FUNÇÕES DE RENDERIZAÇÃO
// ========================================

/**
 * Renderiza a lista de categorias na tela de gerenciamento
 */
function renderCategoriesManagementList() {
    if (!categoriesListContainer) return;
    
    categoriesListContainer.innerHTML = '';
    
    const categories = getAllCategories();
    
    if (categories.length === 0) {
        categoriesListContainer.innerHTML = `
            <div class="empty-state-card">
                <p>Nenhuma categoria encontrada.</p>
                <div class="empty-state-actions">
                    <button id="create-first-category-btn" type="button" class="bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Criar Primeira Categoria</button>
                </div>
            </div>
        `;

        categoriesListContainer.querySelector('#create-first-category-btn')?.addEventListener('click', () => {
            openCategoryModal();
        });
        return;
    }
    
    categories.forEach(category => {
        const usageCount = getCategoryUsageCount(category.id);
        const canDelete = !category.isDefault;
        
        const el = document.createElement('div');
        el.className = 'bg-[#2D2D2D] p-4 rounded-lg flex justify-between items-center border border-gray-700/50';
        el.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full border border-gray-600" style="background-color: ${category.color}"></div>
                <div>
                    <h3 class="font-bold text-lg text-gray-200">${(() => { const div = document.createElement('div'); div.textContent = category.name; return div.innerHTML; })()}</h3>
                    <p class="text-sm text-gray-400">
                        ${usageCount} template${usageCount !== 1 ? 's' : ''}
                        ${category.isDefault ? ' • Categoria padrão' : ''}
                    </p>
                </div>
            </div>
            <div class="space-x-2">
                <button data-id="${category.id}" class="edit-category-btn text-blue-400 hover:text-blue-300">Editar</button>
                ${canDelete ? 
                    `<button data-id="${category.id}" class="delete-category-btn text-red-400 hover:text-red-300">Excluir</button>` : 
                    ''
                }
            </div>
        `;
        categoriesListContainer.appendChild(el);
    });
    
    // Adiciona event listeners
    document.querySelectorAll('.edit-category-btn').forEach(btn => 
        btn.addEventListener('click', () => openCategoryModal(btn.dataset.id))
    );
    
    document.querySelectorAll('.delete-category-btn').forEach(btn => 
        btn.addEventListener('click', () => {
            const categoryId = btn.dataset.id;
            const category = getCategoryById(categoryId);
            const usageCount = getCategoryUsageCount(categoryId);
            const categoryName = category?.name || 'esta categoria';

            const message = usageCount > 0
                ? `Excluir "${categoryName}"? ${usageCount} template${usageCount !== 1 ? 's serão movidos' : ' será movido'} para "Geral".`
                : `Tem certeza que deseja excluir "${categoryName}"?`;

            const performDelete = () => {
                try {
                    deleteCategory(categoryId);
                    renderCategoriesManagementList();
                    // Atualiza outras renderizações se necessário
                    if (window.renderDashboard) window.renderDashboard();

                    if (window.showAppNotification) {
                        window.showAppNotification('Categoria excluída com sucesso.', 'success');
                    }
                } catch (error) {
                    if (window.showAppNotification) {
                        window.showAppNotification('Erro ao excluir categoria: ' + error.message, 'error');
                    }
                }
            };

            if (window.showConfirmDialog) {
                window.showConfirmDialog(message, performDelete);
                return;
            }

            if (confirm(message)) {
                performDelete();
            }
        })
    );
}

/**
 * Renderiza opções de categoria para select
 * @param {HTMLSelectElement} selectElement - Elemento select
 * @param {string} selectedId - ID da categoria selecionada
 */
function renderCategoryOptions(selectElement, selectedId = null) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '';
    
    const categories = getAllCategories();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.selected = category.id === selectedId;
        selectElement.appendChild(option);
    });
}

// ========================================
// GERENCIAMENTO DE MODAIS
// ========================================

/**
 * Abre o modal para criar ou editar categoria
 * @param {string} id - ID da categoria para edição (null para criação)
 */
function openCategoryModal(id = null) {
    if (!categoryForm) return;

    lastFocusedElementBeforeCategoryModal = document.activeElement;
    categoryForm.reset();
    const titleEl = document.getElementById('category-modal-title');
    const originalIdInput = document.getElementById('category-original-id');
    const colorInput = document.getElementById('category-color-input');
    const colorText = document.getElementById('category-color-text');
    
    if (id) {
        // Modo de edição
        const category = getCategoryById(id);
        if (!category) return;
        
        titleEl.textContent = 'Editar Categoria';
        originalIdInput.value = id;
        document.getElementById('category-name-input').value = category.name;
        colorInput.value = category.color;
        colorText.value = category.color.toUpperCase();
    } else {
        // Modo de criação
        titleEl.textContent = 'Criar Categoria';
        originalIdInput.value = '';
        const defaultColor = '#6B7280';
        colorInput.value = defaultColor;
        colorText.value = defaultColor;
    }
    
    categoryModal.classList.remove('hidden');
    categoryModal.setAttribute('aria-hidden', 'false');

    const firstInput = document.getElementById('category-name-input');
    firstInput?.focus();
}

/**
 * Fecha o modal de categoria
 */
function closeCategoryModal() {
    if (categoryModal) {
        const wasOpen = !categoryModal.classList.contains('hidden');

        categoryModal.classList.add('hidden');
        categoryModal.setAttribute('aria-hidden', 'true');

        if (wasOpen && lastFocusedElementBeforeCategoryModal instanceof HTMLElement) {
            lastFocusedElementBeforeCategoryModal.focus();
        }

        lastFocusedElementBeforeCategoryModal = null;
    }
}

/**
 * Manipula o salvamento de categoria
 * @param {Event} e - Evento do formulário
 */
function handleSaveCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('category-name-input').value.trim();
    const colorInput = document.getElementById('category-color-input');
    const colorText = document.getElementById('category-color-text');
    const typedColor = normalizeHexColor(colorText?.value);
    const pickerColor = normalizeHexColor(colorInput?.value) || '#6B7280';
    const hasTypedColor = Boolean(colorText?.value?.trim());
    const color = typedColor || pickerColor;
    const originalId = document.getElementById('category-original-id').value;

    if (hasTypedColor && !typedColor) {
        if (window.showAppNotification) {
            window.showAppNotification('Use uma cor válida no formato #RRGGBB.', 'error');
        }
        return;
    }

    // Mantém campos sincronizados com o valor final
    if (colorInput) colorInput.value = color;
    if (colorText) colorText.value = color;
    
    // Validação
    const errors = validateCategoryData(name, color);
    if (errors.length > 0) {
        if (window.showAppNotification) {
            window.showAppNotification('Erros encontrados: ' + errors.join(' | '), 'error');
        }
        return;
    }
    
    try {
        if (originalId) {
            // Editando categoria existente
            updateCategory(originalId, name, color);
        } else {
            // Criando nova categoria
            createCategory(name, color);
        }
        
        closeCategoryModal();
        renderCategoriesManagementList();
        
        // Atualiza outras renderizações
        if (window.renderDashboard) window.renderDashboard();

        if (window.showAppNotification) {
            window.showAppNotification('Categoria salva com sucesso!', 'success');
        }

    } catch (error) {
        if (window.showAppNotification) {
            window.showAppNotification('Erro ao salvar categoria: ' + error.message, 'error');
        }
    }
}

// ========================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ========================================

/**
 * Configura os event listeners de categorias
 */
function setupCategoriesListeners() {
    if (createNewCategoryBtn) {
        createNewCategoryBtn.addEventListener('click', () => openCategoryModal());
    }
    
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    }
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleSaveCategory);
    }
    
    // Sincroniza color picker com input de texto
    const colorInput = document.getElementById('category-color-input');
    const colorText = document.getElementById('category-color-text');
    
    if (colorInput && colorText) {
        colorInput.addEventListener('input', (e) => {
            colorText.value = e.target.value.toUpperCase();
        });
        
        colorText.addEventListener('input', (e) => {
            const value = normalizeHexColor(e.target.value);
            if (value) {
                e.target.value = value;
                colorInput.value = value;
            }
        });

        colorText.addEventListener('blur', (e) => {
            const typedValue = normalizeHexColor(e.target.value);
            e.target.value = typedValue || colorInput.value.toUpperCase();
        });
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.createCategory = createCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.getCategoryById = getCategoryById;
window.getAllCategories = getAllCategories;
window.getCategoriesForSelect = getCategoriesForSelect;
window.getCategoryUsageCount = getCategoryUsageCount;
window.renderCategoriesManagementList = renderCategoriesManagementList;
window.renderCategoryOptions = renderCategoryOptions;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.setupCategoriesListeners = setupCategoriesListeners;

// Exporta funções para uso em outros módulos
export {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getAllCategories,
    getCategoriesForSelect,
    getCategoryUsageCount,
    renderCategoriesManagementList,
    renderCategoryOptions,
    openCategoryModal,
    closeCategoryModal,
    setupCategoriesListeners
};