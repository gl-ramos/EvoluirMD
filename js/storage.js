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
 * Carrega dados salvos no localStorage
 * Inicializa templates, snippets e categorias padrão se não existirem
 */
function loadDataFromStorage() {
    // Carrega categorias salvas
    const storedCategories = localStorage.getItem('evoluirMD_categories');
    if (storedCategories) {
        window.categories = JSON.parse(storedCategories);
    } else {
        // Categorias padrão para novos usuários (baseadas nas categorias médicas)
        window.categories = createDefaultCategories();
        saveCategoriesToStorage();
    }

    // Carrega snippets salvos
    const storedSnippets = localStorage.getItem('evoluirMD_snippets');
    if (storedSnippets) {
        window.snippets = JSON.parse(storedSnippets);
    } else {
        // Snippets padrão para novos usuários
        window.snippets = DEFAULT_SNIPPETS;
        saveSnippetsToStorage();
    }
    
    // Carrega templates salvos
    const storedTemplates = localStorage.getItem('evoluirMD_templates');
    if (storedTemplates) {
        window.templates = JSON.parse(storedTemplates);
    } else {
        // Templates padrão para novos usuários
        const now = Date.now();
        window.templates = {};
        for (const key in DEFAULT_TEMPLATES) {
            window.templates[key] = {
                ...DEFAULT_TEMPLATES[key],
                lastUsed: null,
                usageCount: 0,
                isFavorite: false,
                createdAt: now
            };
        }
        saveTemplatesToStorage();
    }
    
    // Migra templates e categorias existentes para o novo formato
    migrateTemplatesFormat();
    migrateCategoriesFormat();
}

/**
 * Salva categorias no localStorage
 */
function saveCategoriesToStorage() {
    if (window.categories) {
        localStorage.setItem('evoluirMD_categories', JSON.stringify(window.categories));
    }
}

/**
 * Salva snippets no localStorage
 */
function saveSnippetsToStorage() {
    if (window.snippets) {
        localStorage.setItem('evoluirMD_snippets', JSON.stringify(window.snippets));
    }
}

/**
 * Salva templates no localStorage
 */
function saveTemplatesToStorage() {
    if (window.templates) {
        localStorage.setItem('evoluirMD_templates', JSON.stringify(window.templates));
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
function clearAllData() {
    localStorage.removeItem('evoluirMD_snippets');
    localStorage.removeItem('evoluirMD_templates');
    localStorage.removeItem('evoluirMD_categories');
    
    // Reinicializa com dados padrão
    window.snippets = {};
    window.templates = {};
    window.categories = {};
    loadDataFromStorage();
}

/**
 * Exporta todos os dados para um arquivo JSON
 * Útil para backup
 */
function exportData() {
    const data = {
        snippets: window.snippets || {},
        templates: window.templates || {},
        categories: window.categories || {},
        exportDate: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `evoluirMD_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

/**
 * Importa dados de um arquivo JSON
 * @param {File} file - Arquivo JSON para importar
 */
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        const cleanup = () => {
            reader.onload = null;
            reader.onerror = null;
        };
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Valida estrutura dos dados
                if (data.snippets && data.templates) {
                    window.snippets = data.snippets;
                    window.templates = data.templates;
                    window.categories = data.categories || {};
                    
                    // Salva no localStorage
                    saveSnippetsToStorage();
                    saveTemplatesToStorage();
                    saveCategoriesToStorage();
                    
                    // Migra dados importados se necessário
                    migrateTemplatesFormat();
                    migrateCategoriesFormat();
                    
                    cleanup();
                    resolve('Dados importados com sucesso!');
                } else {
                    cleanup();
                    reject('Formato de arquivo inválido');
                }
            } catch (error) {
                cleanup();
                reject('Erro ao processar arquivo: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            cleanup();
            reject('Erro ao ler arquivo');
        };
        
        reader.readAsText(file);
    });
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.loadDataFromStorage = loadDataFromStorage;
window.saveSnippetsToStorage = saveSnippetsToStorage;
window.saveTemplatesToStorage = saveTemplatesToStorage;
window.saveCategoriesToStorage = saveCategoriesToStorage;
window.clearAllData = clearAllData;
window.exportData = exportData;
window.importData = importData;
window.migrateTemplatesFormat = migrateTemplatesFormat;
window.migrateCategoriesFormat = migrateCategoriesFormat;
window.updateTemplateUsage = updateTemplateUsage;
window.toggleTemplateFavorite = toggleTemplateFavorite;
window.getRecentlyUsedTemplates = getRecentlyUsedTemplates;

// Exporta funções para uso em outros módulos
export {
    loadDataFromStorage,
    saveSnippetsToStorage,
    saveTemplatesToStorage,
    saveCategoriesToStorage,
    clearAllData,
    exportData,
    importData,
    migrateTemplatesFormat,
    migrateCategoriesFormat,
    updateTemplateUsage,
    toggleTemplateFavorite,
    getRecentlyUsedTemplates
};
