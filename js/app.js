/**
 * ========================================
 * EVOLUIRMD - ARQUIVO PRINCIPAL
 * ========================================
 * 
 * Este arquivo é o ponto de entrada da aplicação EvoluirMD.
 * Ele importa todos os módulos e inicializa a aplicação.
 */

// ========================================
// IMPORTAÇÕES DOS MÓDULOS
// ========================================

// Importa configurações
import './config.js';

// Importa todos os módulos da aplicação
import './stateManager.js';
import './storage.js';
import './editor.js';
import './snippets.js';
import './templates.js';
import './categories.js';
import './keyboard.js';
import './navigation.js';

// ========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================

/**
 * Função de inicialização executada quando o DOM está carregado
 * Configura todos os módulos e inicia a aplicação
 */
function initializeApplication() {
    console.log('🚀 Inicializando EvoluirMD...');
    
    try {
        // 1. Carrega dados do localStorage
        if (window.loadDataFromStorage) {
            window.loadDataFromStorage();
            console.log('✅ Dados carregados com sucesso');
        }
        
        // 2. Renderiza templates na barra lateral
        if (window.renderSidebarTemplates) {
            window.renderSidebarTemplates();
            console.log('✅ Sidebar de templates renderizada');
        }
        
        // 3. Configura todos os event listeners
        if (window.setupAllListeners) {
            window.setupAllListeners();
            console.log('✅ Event listeners configurados');
        }
        
        // 4. Mostra estado padrão
        if (window.showDefaultState) {
            window.showDefaultState();
            console.log('✅ Estado padrão exibido');
        }
        
        console.log('🎉 EvoluirMD inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);
        
        // Fallback: tenta inicializar com funcionalidades básicas
        try {
            if (window.loadDataFromStorage) {
                window.loadDataFromStorage();
            }
            if (window.showDefaultState) {
                window.showDefaultState();
            }
            console.log('⚠️ Aplicação inicializada com funcionalidades limitadas');
        } catch (fallbackError) {
            console.error('❌ Falha no fallback:', fallbackError);
        }
    }
}

// ========================================
// VERIFICAÇÃO DE DEPENDÊNCIAS
// ========================================

/**
 * Verifica se todos os módulos necessários estão carregados
 * @returns {boolean} - True se todas as dependências estiverem disponíveis
 */
function checkDependencies() {
    const requiredModules = [
        'loadDataFromStorage',
        'renderSidebarTemplates',
        'showDefaultState',
        'setupAllListeners'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.warn('⚠️ Módulos ausentes:', missingModules);
        return false;
    }
    
    return true;
}

// ========================================
// EVENT LISTENER DE INICIALIZAÇÃO
// ========================================

// Aguarda o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para garantir que todos os módulos estejam carregados
    setTimeout(() => {
        if (checkDependencies()) {
            initializeApplication();
        } else {
            console.error('❌ Dependências não atendidas. Verifique se todos os módulos estão carregados.');
            
            // Tenta inicializar novamente após um delay maior
            setTimeout(() => {
                if (checkDependencies()) {
                    initializeApplication();
                } else {
                    console.error('❌ Falha na inicialização após retry');
                }
            }, 1000);
        }
    }, 100);
});

// ========================================
// FUNÇÕES DE UTILIDADE GLOBAIS
// ========================================

/**
 * Função para debug da aplicação
 * Mostra informações sobre o estado atual
 */
window.debugApplication = function() {
    console.group('🐛 Debug da Aplicação EvoluirMD');
    console.log('Templates:', window.templates);
    console.log('Snippets:', window.snippets);
    console.log('Categories:', window.categories);
    console.log('Template Atual:', window.currentTemplateId);
    console.log('Módulos Carregados:', {
        stateManager: !!window.showDefaultState,
        storage: !!window.loadDataFromStorage,
        editor: !!window.loadTemplate,
        snippets: !!window.renderSnippetsList,
        templates: !!window.renderSidebarTemplates,
        categories: !!window.renderCategoriesManagementList,
        keyboard: !!window.handleKeyboardEvents,
        navigation: !!window.setupAllListeners
    });
    console.groupEnd();
};

/**
 * Função para reinicializar a aplicação
 * Útil para desenvolvimento e debugging
 */
window.reinitializeApplication = function() {
    console.log('🔄 Reinicializando aplicação...');
    
    // Limpa event listeners existentes
    document.removeEventListener('keydown', window.handleKeyboardEvents);
    
    // Reinicializa
    initializeApplication();
};

// ========================================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// ========================================

// Funções que precisam ser acessíveis globalmente
window.initializeApplication = initializeApplication;
window.checkDependencies = checkDependencies;

// ========================================
// MENSAGEM DE CARREGAMENTO
// ========================================

console.log('📦 Módulos EvoluirMD carregados. Aguardando inicialização...');
