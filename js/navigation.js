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

const manageTemplatesLink = document.getElementById('manage-templates-link');
const manageCategoriesLink = document.getElementById('manage-categories-link');
const manageSnippetsLink = document.getElementById('manage-snippets-link');

// Novos elementos da UI reorganizada
const newDocumentBtn = document.getElementById('new-document-btn');
const newDocumentDropdown = document.getElementById('new-document-dropdown');
const blankEditorLink = document.getElementById('blank-editor-link');
const fromTemplateLink = document.getElementById('from-template-link');
const snippetsPanelToggle = document.getElementById('snippets-panel-toggle');
const snippetsPanelContent = document.getElementById('snippets-panel-content');
const headerSearch = document.getElementById('header-search');
const backToDashboard = document.getElementById('back-to-dashboard');
const saveAsTemplate = document.getElementById('save-as-template');

// ========================================
// FUNÇÕES DE NAVEGAÇÃO
// ========================================

/**
 * Configura os event listeners de navegação
 */
function setupNavigationListeners() {
    // Link para gerenciamento de templates
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

    // Toggle do painel de snippets
    if (snippetsPanelToggle) {
        snippetsPanelToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSnippetsPanel();
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

    // Voltar ao dashboard
    if (backToDashboard) {
        backToDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.showDefaultState) {
                window.showDefaultState();
            }
        });
    }

    // Salvar como template
    if (saveAsTemplate) {
        saveAsTemplate.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.saveBlankEditorAsTemplate) {
                window.saveBlankEditorAsTemplate();
            }
        });
    }
}

/**
 * Mostra o editor em branco usando o editor unificado
 */
function showBlankEditor() {
    hideAllStates();
    const editorState = document.getElementById('editor-state');
    
    if (editorState) {
        editorState.classList.remove('hidden');
        
        // Carrega o editor em modo branco
        if (window.loadBlankEditor) {
            window.loadBlankEditor();
        }
    }

    updateModeIndicator('blank-editor', 'Editor em Branco');
    updateHeaderForEditor(true);
}

/**
 * Mostra o estado do editor (para templates)
 */
function showEditorState() {
    hideAllStates();
    const editorState = document.getElementById('editor-state');
    
    if (editorState) {
        editorState.classList.remove('hidden');
    }

    updateModeIndicator('template', 'Editor de Template');
    updateHeaderForEditor(true);
}

/**
 * Renderiza templates rápidos no dropdown
 */
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

/**
 * Abre o dropdown de novo documento
 */
function openDropdown() {
    if (newDocumentDropdown) {
        newDocumentDropdown.classList.remove('hidden');
        renderQuickTemplates();
    }
}

/**
 * Fecha o dropdown de novo documento
 */
function closeDropdown() {
    if (newDocumentDropdown) {
        newDocumentDropdown.classList.add('hidden');
    }
}

/**
 * Renderiza templates rápidos no dropdown
 */
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
            if (window.loadTemplate) {
                window.loadTemplate(key);
            }
            closeDropdown();
        });
        quickTemplatesList.appendChild(item);
    });
}

/**
 * Toggle do painel de snippets
 */
function toggleSnippetsPanel() {
    if (snippetsPanelContent) {
        const isHidden = snippetsPanelContent.classList.contains('hidden');
        const arrow = document.getElementById('snippets-panel-arrow');
        
        if (isHidden) {
            snippetsPanelContent.classList.remove('hidden');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
            renderQuickSnippets();
        } else {
            snippetsPanelContent.classList.add('hidden');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    }
}

/**
 * Renderiza snippets rápidos no painel
 */
function renderQuickSnippets() {
    const snippetsQuickList = document.getElementById('snippets-quick-list');
    if (!snippetsQuickList) return;

    snippetsQuickList.innerHTML = '';

    if (!window.snippets || Object.keys(window.snippets).length === 0) {
        snippetsQuickList.innerHTML = '<div class="text-xs text-gray-500 px-3 py-2">Nenhum snippet criado</div>';
        return;
    }

    Object.entries(window.snippets).forEach(([key, snippet]) => {
        const item = document.createElement('div');
        item.className = 'snippets-panel-item';
        item.innerHTML = `
            <div class="snippet-trigger">${key}</div>
            <div class="snippet-desc">${snippet.description}</div>
        `;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            insertSnippetDirectly(key);
        });
        
        snippetsQuickList.appendChild(item);
    });
}

/**
 * Foca no primeiro placeholder de um conjunto específico de elementos
 * @param {DocumentFragment} insertedFragment - Fragmento inserido contendo placeholders
 */
function focusFirstNewPlaceholder(insertedFragment) {
    // Se o fragmento foi inserido, precisamos buscar os placeholders no DOM
    // Vamos procurar pelos placeholders mais recentemente inseridos
    setTimeout(() => {
        const editorContent = getActiveEditor();
        if (!editorContent) return;
        
        // Busca todos os placeholders no editor
        const allPlaceholders = editorContent.querySelectorAll('.placeholder');
        
        // Procura o primeiro placeholder que não tem as classes de estado
        // (indicando que é um placeholder recém-inserido)
        const newPlaceholder = Array.from(allPlaceholders).find(p => 
            !p.classList.contains('active') && 
            !p.classList.contains('placeholder-filled') &&
            !p.hasAttribute('data-skipped')
        );
        
        if (newPlaceholder) {
            // Limpa qualquer seleção anterior
            const currentActive = editorContent.querySelector('.placeholder.active');
            if (currentActive) {
                currentActive.classList.remove('active', 'initial-focus');
            }
            
            // Ativa o novo placeholder
            newPlaceholder.classList.add('active', 'initial-focus');
            newPlaceholder.focus();
            
            // Seleciona todo o conteúdo do placeholder
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(newPlaceholder);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Remove a animação após 2 segundos
            setTimeout(() => newPlaceholder.classList.remove('initial-focus'), 2000);
        }
    }, 10);
}

/**
 * Insere um snippet diretamente no editor ativo
 */
function insertSnippetDirectly(key) {
    if (!window.snippets || !window.snippets[key]) return;

    const snippet = window.snippets[key];
    const activeEditor = getActiveEditor();
    
    if (activeEditor) {
        activeEditor.focus();
        const selection = window.getSelection();
        
        // Processa placeholders no conteúdo do snippet
        const contentWithPlaceholders = window.processSnippetPlaceholders 
            ? window.processSnippetPlaceholders(snippet.content) 
            : snippet.content;
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // Verifica se o conteúdo tem placeholders
            if (contentWithPlaceholders.includes('<span class="placeholder"')) {
                // Se tem placeholders, insere como HTML usando createContextualFragment para preservar ordem
                const fragment = range.createContextualFragment(contentWithPlaceholders);
                range.insertNode(fragment);
                
                // Posiciona o cursor após o conteúdo inserido
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Após inserir, foca no primeiro placeholder se existir
                setTimeout(() => {
                    focusFirstNewPlaceholder(fragment);
                }, 50);
            } else {
                // Se não tem placeholders, insere como texto simples
                const textNode = document.createTextNode(snippet.content);
                range.insertNode(textNode);
                
                // Position cursor after inserted content
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            // Create a new range at the end of the editor content
            const range = document.createRange();
            
            // If editor has content, add to end, otherwise add as first content
            if (activeEditor.childNodes.length > 0) {
                range.selectNodeContents(activeEditor);
                range.collapse(false); // Collapse to end
            } else {
                range.setStart(activeEditor, 0);
                range.collapse(true);
            }
            
            // Verifica se o conteúdo tem placeholders
            if (contentWithPlaceholders.includes('<span class="placeholder"')) {
                // Se tem placeholders, insere como HTML usando createContextualFragment para preservar ordem
                const fragment = range.createContextualFragment(contentWithPlaceholders);
                range.insertNode(fragment);
                
                // Posiciona o cursor após o conteúdo inserido
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Após inserir, foca no primeiro placeholder se existir
                setTimeout(() => {
                    focusFirstNewPlaceholder(fragment);
                }, 50);
            } else {
                // Se não tem placeholders, insere como texto simples
                const textNode = document.createTextNode(snippet.content);
                range.insertNode(textNode);
                
                // Position cursor after inserted content
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
}

/**
 * Retorna o editor ativo atual
 */
function getActiveEditor() {
    const editorContent = document.getElementById('editor-content');
    const editorState = document.getElementById('editor-state');

    if (editorContent && editorState && !editorState.classList.contains('hidden')) {
        return editorContent;
    }
    
    return null;
}

/**
 * Manipula busca no header
 */
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

/**
 * Atualiza o indicador de modo no header
 */
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

/**
 * Atualiza o header baseado no contexto do editor
 */
function updateHeaderForEditor(isEditor = false) {
    const exportButton = document.getElementById('export-button');
    const headerSnippetCounter = document.getElementById('header-snippet-counter');
    
    if (isEditor) {
        if (exportButton) exportButton.classList.remove('hidden');
        if (headerSnippetCounter) {
            headerSnippetCounter.classList.remove('hidden');
            updateSnippetCounter();
        }
    } else {
        if (exportButton) exportButton.classList.add('hidden');
        if (headerSnippetCounter) headerSnippetCounter.classList.add('hidden');
    }
}

/**
 * Atualiza contadores de snippets e templates
 */
function updateSnippetCounter() {
    const snippetCount = window.snippets ? Object.keys(window.snippets).length : 0;
    const headerSnippetCount = document.getElementById('header-snippet-count');
    const snippetsCountBadge = document.getElementById('snippets-count-badge');
    
    if (headerSnippetCount) {
        headerSnippetCount.textContent = snippetCount;
    }
    
    if (snippetsCountBadge) {
        snippetsCountBadge.textContent = snippetCount;
    }
}

/**
 * Atualiza contador de templates
 */
function updateTemplateCounter() {
    const templateCount = window.templates ? Object.keys(window.templates).length : 0;
    const templatesCountBadge = document.getElementById('templates-count-badge');
    
    if (templatesCountBadge) {
        templatesCountBadge.textContent = templateCount;
    }
}

/**
 * Esconde todos os estados
 */
function hideAllStates() {
    const states = ['default-state', 'editor-state', 'snippets-state', 'templates-state', 'categories-state'];
    states.forEach(stateId => {
        const element = document.getElementById(stateId);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

/**
 * Copia texto para a área de transferência
 */
function copyToClipboard(text) {
    const textarea = document.getElementById('clipboard-helper');
    if (textarea) {
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
    }
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
    updateTemplateCounter();
}

// ========================================
// FUNÇÕES DE UTILIDADE PARA NAVEGAÇÃO
// ========================================

/**
 * Ativa um link de navegação
 * @param {string} linkId - ID do link a ser ativado
 */
function activateLink(linkId) {
    // Remove estado ativo de todos os links
    document.querySelectorAll('.nav-link, .template-link').forEach(link => {
        link.classList.remove('active', 'bg-gray-700', 'bg-blue-600');
    });
    
    // Ativa o link especificado
    const targetLink = document.getElementById(linkId);
    if (targetLink) {
        targetLink.classList.add('active', 'bg-gray-700');
    }
}

/**
 * Navega para uma seção específica
 * @param {string} section - Nome da seção ('templates', 'snippets', 'default', 'blank-editor')
 */
function navigateToSection(section) {
    switch (section) {
        case 'templates':
            if (window.showTemplatesState) {
                window.showTemplatesState();
            }
            activateLink('manage-templates-link');
            break;
            
        case 'categories':
            if (window.showCategoriesState) {
                window.showCategoriesState();
            }
            activateLink('manage-categories-link');
            break;
            
        case 'snippets':
            if (window.showSnippetsState) {
                window.showSnippetsState();
            }
            activateLink('manage-snippets-link');
            break;
            
        case 'blank-editor':
            showBlankEditor();
            break;
            
        case 'default':
        default:
            if (window.showDefaultState) {
                window.showDefaultState();
            }
            updateModeIndicator('dashboard', 'Dashboard');
            updateHeaderForEditor(false);
            // Remove estado ativo de todos os links
            document.querySelectorAll('.nav-link, .template-link').forEach(link => {
                link.classList.remove('active', 'bg-gray-700', 'bg-blue-600');
            });
            break;
    }
}

// ========================================
// EXPOSIÇÃO DE FUNÇÕES
// ========================================

// Funções que precisam ser acessíveis globalmente
window.setupNavigationListeners = setupNavigationListeners;
window.setupAllListeners = setupAllListeners;
window.activateLink = activateLink;
window.navigateToSection = navigateToSection;
window.showBlankEditor = showBlankEditor;
window.updateModeIndicator = updateModeIndicator;
window.updateHeaderForEditor = updateHeaderForEditor;
window.updateSnippetCounter = updateSnippetCounter;
window.updateTemplateCounter = updateTemplateCounter;
window.hideAllStates = hideAllStates;
window.renderQuickSnippets = renderQuickSnippets;

// Exporta funções para uso em outros módulos
export {
    setupNavigationListeners,
    setupAllListeners,
    activateLink,
    navigateToSection,
    showBlankEditor,
    updateModeIndicator,
    updateHeaderForEditor,
    updateSnippetCounter,
    updateTemplateCounter,
    hideAllStates,
    renderQuickSnippets
};