/**
 * ========================================
 * SISTEMA DE ARMAZENAMENTO
 * ========================================
 * 
 * Este módulo é responsável por gerenciar a persistência de dados
 * usando localStorage, incluindo templates e snippets padrão
 */

// Importa configurações padrão
import { DEFAULT_TEMPLATES, DEFAULT_SNIPPETS } from './config.js';

// ========================================
// FUNÇÕES DE PERSISTÊNCIA DE DADOS
// ========================================

/**
 * Cria categorias médicas padrão
 * @returns {Object} Objeto com categorias padrão
 */
function createDefaultCategories() {
    const defaultCategories = [
        { id: 'geral', name: 'Geral', color: '#6B7280' },
        { id: 'alta', name: 'Alta Hospitalar', color: '#10B981' },
        { id: 'pneumologia', name: 'Pneumologia', color: '#3B82F6' },
        { id: 'cardiologia', name: 'Cardiologia', color: '#EF4444' },
        { id: 'neurologia', name: 'Neurologia', color: '#8B5CF6' },
        { id: 'gastroenterologia', name: 'Gastroenterologia', color: '#F59E0B' },
        { id: 'endocrinologia', name: 'Endocrinologia', color: '#06B6D4' },
        { id: 'nefrologia', name: 'Nefrologia', color: '#84CC16' },
        { id: 'infectologia', name: 'Infectologia', color: '#F97316' },
        { id: 'hematologia', name: 'Hematologia', color: '#EC4899' },
        { id: 'oncologia', name: 'Oncologia', color: '#64748B' },
        { id: 'psiquiatria', name: 'Psiquiatria', color: '#A855F7' },
        { id: 'dermatologia', name: 'Dermatologia', color: '#22C55E' },
        { id: 'ortopedia', name: 'Ortopedia', color: '#8B7355' },
        { id: 'cirurgia', name: 'Cirurgia', color: '#DC2626' },
        { id: 'pediatria', name: 'Pediatria', color: '#FF69B4' },
        { id: 'ginecologia', name: 'Ginecologia', color: '#FFB6C1' },
        { id: 'pronto-socorro', name: 'Pronto Socorro', color: '#FF4500' },
        { id: 'uti', name: 'UTI', color: '#800080' },
        { id: 'procedimentos', name: 'Procedimentos', color: '#20B2AA' }
    ];
    
    const categoriesObj = {};
    const now = Date.now();
    
    defaultCategories.forEach(cat => {
        categoriesObj[cat.id] = {
            ...cat,
            isDefault: true,
            createdAt: now
        };
    });
    
    return categoriesObj;
}

/**
 * Cria mapeamento de nomes antigos para IDs novos
 * @returns {Object} Mapeamento de categorias
 */
function createCategoryMapping() {
    return {
        'Geral': 'geral',
        'Alta': 'alta',
        'Alta Hospitalar': 'alta',
        'Pneumologia': 'pneumologia',
        'Cardiologia': 'cardiologia',
        'Neurologia': 'neurologia',
        'Gastroenterologia': 'gastroenterologia',
        'Endocrinologia': 'endocrinologia',
        'Nefrologia': 'nefrologia',
        'Infectologia': 'infectologia',
        'Hematologia': 'hematologia',
        'Oncologia': 'oncologia',
        'Psiquiatria': 'psiquiatria',
        'Dermatologia': 'dermatologia',
        'Ortopedia': 'ortopedia',
        'Cirurgia': 'cirurgia',
        'Pediatria': 'pediatria',
        'Ginecologia': 'ginecologia',
        'Pronto Socorro': 'pronto-socorro',
        'UTI': 'uti',
        'Procedimentos': 'procedimentos'
    };
}

/**
 * Faz parse seguro de uma chave do localStorage
 * @param {string} key - Chave do localStorage
 * @param {Object} fallback - Valor padrão em caso de erro
 * @returns {Object} Valor parseado ou fallback
 */
function safeParseStorageItem(key, fallback) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
        return fallback;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn(`⚠️ Dados inválidos em ${key}. Restaurando padrão.`, error);
        localStorage.removeItem(key);
        return fallback;
    }
}

/**
 * Salva chave no localStorage com tratamento de erros
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
function safeSetStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`❌ Falha ao salvar ${key} no localStorage.`, error);

        if (window.showAppNotification) {
            window.showAppNotification('Não foi possível salvar seus dados localmente. Verifique espaço do navegador.', 'error');
        }

        return false;
    }
}

/**
 * Cria snippets padrão em novo objeto
 * @returns {Object}
 */
function createDefaultSnippets() {
    return Object.entries(DEFAULT_SNIPPETS).reduce((acc, [key, snippet]) => {
        acc[key] = { ...snippet };
        return acc;
    }, {});
}

/**
 * Cria templates padrão em novo formato
 * @returns {Object}
 */
function createDefaultTemplates() {
    const now = Date.now();
    const templates = {};

    for (const key in DEFAULT_TEMPLATES) {
        templates[key] = {
            ...DEFAULT_TEMPLATES[key],
            lastUsed: null,
            usageCount: 0,
            isFavorite: false,
            createdAt: now
        };
    }

    return templates;
}

/**
 * Carrega dados salvos no localStorage
 * Inicializa templates, snippets e categorias padrão se não existirem
 */
function loadDataFromStorage() {
    // Carrega categorias salvas com parse seguro
    window.categories = safeParseStorageItem('evoluirMD_categories', createDefaultCategories());

    // Carrega snippets salvos com parse seguro
    window.snippets = safeParseStorageItem('evoluirMD_snippets', createDefaultSnippets());

    // Carrega templates salvos com parse seguro
    window.templates = safeParseStorageItem('evoluirMD_templates', createDefaultTemplates());

    // Garante persistência caso algum dado tenha sido restaurado
    saveCategoriesToStorage();
    saveSnippetsToStorage();
    saveTemplatesToStorage();
    
    // Migra templates e categorias existentes para o novo formato
    migrateTemplatesFormat();
    migrateCategoriesFormat();
}

/**
 * Salva categorias no localStorage
 */
function saveCategoriesToStorage() {
    if (window.categories) {
        safeSetStorageItem('evoluirMD_categories', window.categories);
    }
}

/**
 * Salva snippets no localStorage
 */
function saveSnippetsToStorage() {
    if (window.snippets) {
        safeSetStorageItem('evoluirMD_snippets', window.snippets);
    }
}

/**
 * Salva templates no localStorage
 */
function saveTemplatesToStorage() {
    if (window.templates) {
        safeSetStorageItem('evoluirMD_templates', window.templates);
    }
}

/**
 * Migra templates existentes para o novo formato
 * Adiciona campos necessários para templates antigos
 */
function migrateTemplatesFormat() {
    if (!window.templates) return;
    
    let needsSave = false;
    const now = Date.now();
    
    for (const key in window.templates) {
        const template = window.templates[key];
        
        // Adiciona campos ausentes
        if (!template.hasOwnProperty('lastUsed')) {
            template.lastUsed = null;
            needsSave = true;
        }
        if (!template.hasOwnProperty('usageCount')) {
            template.usageCount = 0;
            needsSave = true;
        }
        if (!template.hasOwnProperty('isFavorite')) {
            template.isFavorite = false;
            needsSave = true;
        }
        if (!template.hasOwnProperty('createdAt')) {
            template.createdAt = now;
            needsSave = true;
        }
        
        // Migra categoria do formato antigo (string) para novo formato (categoryId)
        if (template.hasOwnProperty('category') && !template.hasOwnProperty('categoryId')) {
            // Mapeia nomes antigos para IDs novos
            const categoryMap = createCategoryMapping();
            template.categoryId = categoryMap[template.category] || 'geral';
            delete template.category;
            needsSave = true;
        }
        
        if (!template.hasOwnProperty('categoryId')) {
            template.categoryId = 'geral';
            needsSave = true;
        }
    }
    
    if (needsSave) {
        saveTemplatesToStorage();
    }
}

/**
 * Migra categorias para o novo formato se necessário
 */
function migrateCategoriesFormat() {
    if (!window.categories) return;
    
    let needsSave = false;
    const now = Date.now();
    
    for (const id in window.categories) {
        const category = window.categories[id];
        
        // Adiciona campos ausentes
        if (!category.hasOwnProperty('id')) {
            category.id = id;
            needsSave = true;
        }
        if (!category.hasOwnProperty('createdAt')) {
            category.createdAt = now;
            needsSave = true;
        }
        if (!category.hasOwnProperty('isDefault')) {
            category.isDefault = false;
            needsSave = true;
        }
    }
    
    if (needsSave) {
        saveCategoriesToStorage();
    }
}

/**
 * Atualiza informações de uso de um template
 * @param {string} templateKey - Chave do template
 */
function updateTemplateUsage(templateKey) {
    if (!window.templates || !window.templates[templateKey]) return;
    
    const template = window.templates[templateKey];
    template.lastUsed = Date.now();
    template.usageCount = (template.usageCount || 0) + 1;
    
    saveTemplatesToStorage();
}

/**
 * Alterna status de favorito de um template
 * @param {string} templateKey - Chave do template
 */
function toggleTemplateFavorite(templateKey) {
    if (!window.templates || !window.templates[templateKey]) return;
    
    const template = window.templates[templateKey];
    template.isFavorite = !template.isFavorite;
    
    saveTemplatesToStorage();
}

/**
 * Obtém templates ordenados por último uso
 * @param {number} limit - Número máximo de templates
 * @returns {Array} Array de objetos {key, template}
 */
function getRecentlyUsedTemplates(limit = 6) {
    if (!window.templates) return [];
    
    return Object.entries(window.templates)
        .filter(([key, template]) => template.lastUsed)
        .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
        .slice(0, limit)
        .map(([key, template]) => ({ key, template }));
}

/**
 * Gera snapshot completo dos dados para exportação
 * @returns {Object}
 */
function createExportSnapshot() {
    return {
        app: 'EvoluirMD',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
            templates: window.templates || {},
            snippets: window.snippets || {},
            categories: window.categories || {}
        }
    };
}

/**
 * Exporta os dados da aplicação em arquivo JSON
 */
function exportDataAsJson() {
    const snapshot = createExportSnapshot();
    const jsonContent = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `evoluirmd-backup-${timestamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
}

/**
 * Normaliza payload bruto de importação
 * @param {Object} rawPayload
 * @returns {Object}
 */
function normalizeImportPayload(rawPayload) {
    if (!rawPayload || typeof rawPayload !== 'object') {
        throw new Error('Arquivo inválido. Estrutura JSON não reconhecida.');
    }

    const source = rawPayload.data && typeof rawPayload.data === 'object'
        ? rawPayload.data
        : rawPayload;

    const { templates, snippets, categories } = source;

    if (!templates || typeof templates !== 'object' || Array.isArray(templates)) {
        throw new Error('Campo "templates" ausente ou inválido.');
    }
    if (!snippets || typeof snippets !== 'object' || Array.isArray(snippets)) {
        throw new Error('Campo "snippets" ausente ou inválido.');
    }
    if (!categories || typeof categories !== 'object' || Array.isArray(categories)) {
        throw new Error('Campo "categories" ausente ou inválido.');
    }

    return {
        templates: { ...templates },
        snippets: { ...snippets },
        categories: { ...categories }
    };
}

/**
 * Importa dados a partir de objeto JSON
 * @param {Object} payload
 */
function importDataFromJson(payload) {
    const normalized = normalizeImportPayload(payload);

    window.templates = normalized.templates;
    window.snippets = normalized.snippets;
    window.categories = normalized.categories;

    migrateTemplatesFormat();
    migrateCategoriesFormat();

    saveTemplatesToStorage();
    saveSnippetsToStorage();
    saveCategoriesToStorage();

    if (window.updateNavigationCounters) {
        window.updateNavigationCounters();
    }

    if (window.renderDashboard) {
        window.renderDashboard();
    }

    if (window.renderTemplatesManagementList) {
        window.renderTemplatesManagementList();
    }

    if (window.renderSnippetsList) {
        window.renderSnippetsList();
    }

    if (window.renderCategoriesManagementList) {
        window.renderCategoriesManagementList();
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.loadDataFromStorage = loadDataFromStorage;
window.saveSnippetsToStorage = saveSnippetsToStorage;
window.saveTemplatesToStorage = saveTemplatesToStorage;
window.saveCategoriesToStorage = saveCategoriesToStorage;
window.migrateTemplatesFormat = migrateTemplatesFormat;
window.migrateCategoriesFormat = migrateCategoriesFormat;
window.updateTemplateUsage = updateTemplateUsage;
window.toggleTemplateFavorite = toggleTemplateFavorite;
window.getRecentlyUsedTemplates = getRecentlyUsedTemplates;
window.createExportSnapshot = createExportSnapshot;
window.exportDataAsJson = exportDataAsJson;
window.importDataFromJson = importDataFromJson;

// Exporta funções para uso em outros módulos
export {
    loadDataFromStorage,
    saveSnippetsToStorage,
    saveTemplatesToStorage,
    saveCategoriesToStorage,
    migrateTemplatesFormat,
    migrateCategoriesFormat,
    updateTemplateUsage,
    toggleTemplateFavorite,
    getRecentlyUsedTemplates,
    createExportSnapshot,
    exportDataAsJson,
    importDataFromJson
};
