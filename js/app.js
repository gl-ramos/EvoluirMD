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
import './theme.js';
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
    try {
        // 1. Carrega dados do localStorage
        if (window.loadDataFromStorage) {
            window.loadDataFromStorage();
        }
        
        // 2. Configura todos os event listeners
        if (window.setupAllListeners) {
            window.setupAllListeners();
        }
        
        // 3. Mostra estado padrão
        if (window.showDefaultState) {
            window.showDefaultState();
        }
        
    } catch (error) {
        console.error('Erro durante a inicialização:', error);
        
        // Fallback: tenta inicializar com funcionalidades básicas
        try {
            if (window.loadDataFromStorage) {
                window.loadDataFromStorage();
            }
            if (window.showDefaultState) {
                window.showDefaultState();
            }
        } catch (fallbackError) {
            console.error('Falha no fallback:', fallbackError);
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
            console.error('Dependencies not met. Please check if all modules are loaded.');
        }
    }, 100);
});

// ========================================
// EXPOSIÇÃO DE FUNÇÕES GLOBAIS
// ========================================

// Funções que precisam ser acessíveis globalmente
window.initializeApplication = initializeApplication;
window.checkDependencies = checkDependencies;
