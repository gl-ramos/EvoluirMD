/**
 * ========================================
 * CONFIGURAÇÕES DA APLICAÇÃO
 * ========================================
 * 
 * Este arquivo centraliza todas as configurações,
 * constantes e valores padrão da aplicação EvoluirMD
 */

// ========================================
// CATEGORIAS MÉDICAS
// ========================================

export const MEDICAL_CATEGORIES = [
    { value: 'Geral', label: 'Geral', color: '#6B7280' },
    { value: 'Alta', label: 'Alta Hospitalar', color: '#10B981' },
    { value: 'Pneumologia', label: 'Pneumologia', color: '#3B82F6' },
    { value: 'Cardiologia', label: 'Cardiologia', color: '#EF4444' },
    { value: 'Neurologia', label: 'Neurologia', color: '#8B5CF6' },
    { value: 'Gastroenterologia', label: 'Gastroenterologia', color: '#F59E0B' },
    { value: 'Endocrinologia', label: 'Endocrinologia', color: '#06B6D4' },
    { value: 'Nefrologia', label: 'Nefrologia', color: '#84CC16' },
    { value: 'Infectologia', label: 'Infectologia', color: '#F97316' },
    { value: 'Hematologia', label: 'Hematologia', color: '#EC4899' },
    { value: 'Oncologia', label: 'Oncologia', color: '#64748B' },
    { value: 'Psiquiatria', label: 'Psiquiatria', color: '#A855F7' },
    { value: 'Dermatologia', label: 'Dermatologia', color: '#22C55E' },
    { value: 'Ortopedia', label: 'Ortopedia', color: '#8B7355' },
    { value: 'Cirurgia', label: 'Cirurgia', color: '#DC2626' },
    { value: 'Pediatria', label: 'Pediatria', color: '#FF69B4' },
    { value: 'Ginecologia', label: 'Ginecologia', color: '#FFB6C1' },
    { value: 'Pronto Socorro', label: 'Pronto Socorro', color: '#FF4500' },
    { value: 'UTI', label: 'UTI', color: '#800080' },
    { value: 'Procedimentos', label: 'Procedimentos', color: '#20B2AA' }
];

/**
 * Obtém a configuração de uma categoria médica
 * @param {string} categoryValue - Valor da categoria
 * @returns {Object|null} - Configuração da categoria ou null se não encontrada
 */
export function getCategoryConfig(categoryValue) {
    return MEDICAL_CATEGORIES.find(cat => cat.value === categoryValue) || null;
}

/**
 * Obtém a cor de uma categoria médica
 * @param {string} categoryValue - Valor da categoria
 * @returns {string} - Cor da categoria (hex) ou cor padrão
 */
export function getCategoryColor(categoryValue) {
    const category = getCategoryConfig(categoryValue);
    return category ? category.color : '#6B7280'; // Cor padrão (cinza)
}

// ========================================
// CONFIGURAÇÕES GERAIS
// ========================================

export const APP_CONFIG = {
    name: 'EvoluirMD',
    version: '2.0.0',
    description: 'Plataforma para evoluções médicas',
    author: 'Comunidade Médica Brasileira',
    
    // Configurações de localStorage
    storageKeys: {
        snippets: 'evoluirMD_snippets',
        templates: 'evoluirMD_templates',
        navigationHistory: 'evoluirMD_navigation_history',
        userPreferences: 'evoluirMD_preferences'
    },
    
    // Configurações de UI
    ui: {
        animationDuration: 2000, // ms
        tooltipDelay: 100, // ms
        maxNavigationHistory: 10,
        placeholderAnimationDuration: 2000 // ms
    },
    
    // Configurações de validação
    validation: {
        snippetKeyPrefix: '/',
        maxSnippetKeyLength: 50,
        maxSnippetDescriptionLength: 200,
        maxTemplateTitleLength: 100,
        maxTemplateContentLength: 10000
    }
};

// ========================================
// TEMPLATES PADRÃO
// ========================================

export const DEFAULT_TEMPLATES = {
    'template_pac': {
        title: 'Pneumonia Adquirida na Comunidade',
        content: `Paciente {{nome_paciente}}, {{idade_paciente}} anos, admitido(a) com quadro de tosse produtiva, febre e dispneia há {{dias_sintomas}} dias.\nDiagnóstico: Pneumonia Adquirida na Comunidade (CURB-65 = {{curb_65_score}}).\n\nSinais Vitais: FC: {{fc_bpm}}bpm, FR: {{fr_irpm}}irpm, PA: {{pa_mmhg}}mmHg, SatO2: {{sato2_percent}}% em ar ambiente, Tax: {{tax_celsius}}°C.\n\nPlano:\n1. Iniciar Ceftriaxona + Azitromicina.\n2. Oxigenoterapia suplementar se SatO2 < 92%.\n\nDr(a). {{nome_medico}}\nCRM: {{crm_medico}}`
    },
    'template_alta': {
        title: 'Sumário de Alta Padrão',
        content: `Paciente {{nome_paciente}}, {{idade_paciente}} anos, esteve internado(a) no período de {{data_inicio}} a {{data_fim}} para tratamento de {{diagnostico_principal}}.\nEvoluiu com melhora clínica e laboratorial, recebendo alta hospitalar em bom estado geral.\n\nOrientações:\n- Retornar em consulta com {{especialidade_retorno}} em {{prazo_retorno}}.\n\nDr(a). {{nome_medico}}\nCRM: {{crm_medico}}`
    }
};

// ========================================
// SNIPPETS PADRÃO
// ========================================

export const DEFAULT_SNIPPETS = {
    '/efnormal': {
        description: 'Exame físico sem alterações.',
        content: 'Ao exame, paciente em bom estado geral, corado, hidratado, anictérico, acianótico. Aparelho respiratório com murmúrio vesicular presente universalmente, sem ruídos adventícios. Aparelho cardiovascular com bulhas rítmicas normofonéticas em 2 tempos, sem sopros. Abdome flácido, indolor à palpação, sem visceromegalias. Membros inferiores sem edema, com pulsos periféricos presentes e simétricos.'
    },
    '/alta': {
        description: 'Texto padrão para alta hospitalar.',
        content: 'Paciente evoluiu com melhora clínica e laboratorial, recebendo alta hospitalar em bom estado geral, com orientações e prescrição entregues.'
    }
};

// ========================================
// CONFIGURAÇÕES DE ESTILOS
// ========================================

export const STYLE_CONFIG = {
    colors: {
        primary: '#3B82F6',
        primaryHover: '#2563EB',
        secondary: '#6B7280',
        secondaryHover: '#4B5563',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#1A1A1A',
        surface: '#1F1F1F',
        surfaceSecondary: '#2D2D2D',
        text: '#E5E7EB',
        textSecondary: '#9CA3AF',
        border: '#374151'
    },
    
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
    },
    
    borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem'
    },
    
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
};

// ========================================
// CONFIGURAÇÕES DE ANIMAÇÕES
// ========================================

export const ANIMATION_CONFIG = {
    durations: {
        fast: 150,
        normal: 300,
        slow: 500,
        verySlow: 1000
    },
    
    easings: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    keyframes: {
        pulse: {
            '0%, 100%': { 
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)' 
            },
            '50%': { 
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.8)' 
            }
        },
        fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
        },
        slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
        }
    }
};

// ========================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ========================================

export const VALIDATION_RULES = {
    snippet: {
        key: {
            required: true,
            pattern: /^\/[a-zA-Z0-9_-]+$/,
            minLength: 2,
            maxLength: 50,
            message: 'A chave deve começar com / e conter apenas letras, números, hífens e underscores'
        },
        description: {
            required: true,
            minLength: 5,
            maxLength: 200,
            message: 'A descrição deve ter entre 5 e 200 caracteres'
        },
        content: {
            required: true,
            minLength: 10,
            maxLength: 5000,
            message: 'O conteúdo deve ter entre 10 e 5000 caracteres'
        }
    },
    
    template: {
        title: {
            required: true,
            minLength: 3,
            maxLength: 100,
            message: 'O título deve ter entre 3 e 100 caracteres'
        },
        content: {
            required: true,
            minLength: 10,
            maxLength: 10000,
            message: 'O conteúdo deve ter entre 10 e 10000 caracteres'
        }
    }
};

// ========================================
// CONFIGURAÇÕES DE DESENVOLVIMENTO
// ========================================

export const DEV_CONFIG = {
    debug: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enablePerformanceMonitoring: false,
    enableErrorReporting: false,
    mockData: false
};

// ========================================
// FUNÇÕES DE UTILIDADE
// ========================================

/**
 * Obtém uma configuração específica
 * @param {string} path - Caminho da configuração (ex: 'ui.animationDuration')
 * @param {*} defaultValue - Valor padrão se não encontrado
 * @returns {*} - Valor da configuração
 */
export function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = APP_CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Define uma configuração específica
 * @param {string} path - Caminho da configuração
 * @param {*} value - Valor a ser definido
 */
export function setConfig(path, value) {
    const keys = path.split('.');
    let config = APP_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in config) || typeof config[key] !== 'object') {
            config[key] = {};
        }
        config = config[key];
    }
    
    config[keys[keys.length - 1]] = value;
}

/**
 * Verifica se a aplicação está em modo de desenvolvimento
 * @returns {boolean} - True se estiver em desenvolvimento
 */
export function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.protocol === 'file:';
}
