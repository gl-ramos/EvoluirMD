/**
 * ======================================== 
 * CONFIGURAÇÕES DA APLICAÇÃO
 * ======================================== 
 *
 * Este arquivo centraliza todas as configurações,
 * constantes e valores padrão da aplicação EvoluirMD
 */

// ========================================
// TEMPLATES PADRÃO
// ========================================

export const DEFAULT_TEMPLATES = {
    'template_pac': {
        title: 'Pneumonia Adquirida na Comunidade',
        content: `Paciente {{nome_paciente}}, {{idade_paciente}} anos, admitido(a) com quadro de tosse produtiva, febre e dispneia há {{dias_sintomas}} dias.\nDiagnóstico: Pneumonia Adquirida na Comunidade (CURB-65 = {{curb_65_score}}).\n\nSinais Vitais: FC: {{fc_bpm}}bpm, FR: {{fr_irpm}}irpm, PA: {{pa_mmhg}}mmHg, SatO2: {{sato2_percent}}% em ar ambiente, Tax: {{tax_celsius}}°C.\n\nPlano:\n1. Iniciar Ceftriaxona + Azitromicina.\n2. Oxigenoterapia suplementar se SatO2 < 92%.\n\nDr(a). {{nome_medico}}\nCRM: {{crm_medico}}`,
        categoryId: 'pneumologia'
    },
    'template_alta': {
        title: 'Sumário de Alta Padrão',
        content: `Paciente {{nome_paciente}}, {{idade_paciente}} anos, esteve internado(a) no período de {{data_inicio}} a {{data_fim}} para tratamento de {{diagnostico_principal}}.\nEvoluiu com melhora clínica e laboratorial, recebendo alta hospitalar em bom estado geral.\n\nOrientações:\n- Retornar em consulta com {{especialidade_retorno}} em {{prazo_retorno}}.\n\nDr(a). {{nome_medico}}\nCRM: {{crm_medico}}`,
        categoryId: 'alta'
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

