# EvoluirMD - Plataforma de Evoluções Médicas

## 📋 Descrição

O EvoluirMD é uma plataforma web desenvolvida para ajudar estudantes de medicina brasileiros e residentes a escrever evoluções de pacientes de forma rápida e segura. A aplicação oferece um editor guiado com templates pré-definidos e um sistema de snippets para agilizar a documentação médica.

## ✨ Funcionalidades Principais

- **Editor de Templates**: Sistema de placeholders editáveis usando sintaxe `[[campo]]`
- **Navegação por Tab**: Navegação rápida entre campos usando Tab/Shift+Tab
- **Sistema de Snippets**: Atalhos rápidos com digitação de `/` + texto
- **Gerenciamento de Templates**: Criação, edição e exclusão de templates personalizados
- **Gerenciamento de Snippets**: Biblioteca de textos padrão reutilizáveis
- **Persistência Local**: Dados salvos no localStorage do navegador
- **Interface Responsiva**: Design adaptável para diferentes tamanhos de tela

## 🏗️ Estrutura do Projeto

```
EvoluirMD/
├── index.html          # Arquivo HTML principal
├── css/
│   └── styles.css      # Estilos customizados da aplicação
├── js/
│   ├── app.js          # Arquivo principal (ponto de entrada)
│   ├── config.js       # Configurações e constantes
│   ├── stateManager.js # Gerenciamento de estados da UI
│   ├── storage.js      # Persistência de dados (localStorage)
│   ├── editor.js       # Editor de templates e placeholders
│   ├── snippets.js     # Sistema de snippets e autocompletar
│   ├── templates.js    # Gerenciamento de templates
│   ├── keyboard.js     # Eventos de teclado e navegação
│   └── navigation.js   # Links de navegação e event listeners
└── README.md           # Documentação do projeto
```

### 📁 Organização dos Arquivos

#### `index.html`
- Estrutura HTML limpa e semântica
- Referências para arquivos CSS e JavaScript externos
- Interface dividida em estados (padrão, editor, snippets, templates)

#### `css/styles.css`
- Estilos customizados organizados por seções
- Animações para placeholders e interações
- Customização de scrollbars e tooltips
- Estilos para modais e componentes da UI

#### `js/app.js`
- **Ponto de Entrada**: Importa todos os módulos e inicializa a aplicação
- **Verificação de Dependências**: Garante que todos os módulos estejam carregados
- **Inicialização**: Configura e inicia todos os sistemas
- **Debug**: Funções para desenvolvimento e troubleshooting

#### `js/config.js`
- **Configurações**: Constantes e valores padrão da aplicação
- **Templates Padrão**: Templates iniciais para novos usuários
- **Snippets Padrão**: Snippets iniciais para novos usuários
- **Validação**: Regras de validação para formulários
- **Estilos**: Configurações de cores, espaçamentos e animações

#### `js/stateManager.js`
- **Estados da UI**: Controle de visibilidade entre diferentes telas
- **Navegação**: Funções para alternar entre estados
- **Transições**: Gerenciamento de mudanças de estado

#### `js/storage.js`
- **Persistência**: Gerenciamento do localStorage
- **Dados Padrão**: Inicialização com templates e snippets padrão
- **Backup**: Funções de exportação e importação de dados
- **Limpeza**: Reset de dados da aplicação

#### `js/editor.js`
- **Editor de Templates**: Carregamento e edição de templates
- **Placeholders**: Sistema de campos editáveis
- **Foco**: Gerenciamento de foco e seleção
- **Cópia**: Funcionalidade de copiar notas para clipboard

#### `js/snippets.js`
- **Sistema de Snippets**: CRUD completo de snippets
- **Tooltip**: Interface de autocompletar
- **Inserção**: Lógica para inserir snippets no editor
- **Validação**: Regras de validação para snippets

#### `js/templates.js`
- **Gerenciamento de Templates**: CRUD completo de templates
- **Sidebar**: Renderização da lista na barra lateral
- **Modais**: Interface para criar/editar templates
- **Validação**: Regras de validação para templates

#### `js/keyboard.js`
- **Eventos de Teclado**: Handlers para todas as teclas
- **Navegação por Tab**: Sistema de navegação entre placeholders
- **Tooltip**: Navegação por setas no autocompletar
- **Atalhos**: Teclas de função (Escape, Enter, etc.)

#### `js/navigation.js`
- **Links de Navegação**: Event listeners para menus
- **Editor**: Event listeners para interações do editor
- **Histórico**: Sistema de histórico de navegação
- **Configuração**: Setup de todos os event listeners

## 🚀 Como Usar

### 1. Seleção de Template
- Clique em um template na barra lateral esquerda
- O editor será carregado com placeholders editáveis

### 2. Preenchimento de Campos
- Use **Tab** para navegar entre campos
- Use **Shift+Tab** para navegar para trás
- Campos preenchidos são marcados como "completos"

### 3. Sistema de Snippets
- Digite `/` no editor para ativar sugestões
- Use **↑/↓** para navegar nas sugestões
- Pressione **Enter** ou **Tab** para inserir

### 4. Gerenciamento
- **Meus Templates**: Crie e edite templates personalizados
- **Meus Snippets**: Gerencie atalhos de texto rápidos

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos customizados e animações
- **JavaScript ES6+**: Lógica da aplicação e manipulação DOM
- **Tailwind CSS**: Framework CSS utilitário
- **Google Fonts**: Tipografia Inter para melhor legibilidade

## 🔧 Desenvolvimento

### Pré-requisitos
- Navegador web moderno com suporte a ES6+
- Servidor local para desenvolvimento (opcional)

### Estrutura de Dados

#### Templates
```javascript
{
  "template_key": {
    "title": "Nome do Template",
    "content": "Conteúdo com [[campo]] para áreas editáveis"
  }
}
```

#### Snippets
```javascript
{
  "/atalho": {
    "description": "Descrição do snippet",
    "content": "Texto que será inserido"
  }
}
```

### Padrões de Código

- **Comentários**: Todo o código está documentado com JSDoc
- **Organização**: Funções agrupadas por funcionalidade
- **Nomenclatura**: Variáveis e funções com nomes descritivos
- **Separação**: HTML, CSS e JavaScript em arquivos distintos

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🔒 Segurança

- Dados armazenados localmente no navegador
- Sem envio de informações para servidores externos
- Validação de entrada em formulários
- Sanitização de dados antes da renderização

## 🚧 Limitações Atuais

- Dados salvos apenas no navegador local
- Sem sincronização entre dispositivos
- Sem backup automático
- Funcionalidade offline limitada

## 🔮 Futuras Melhorias

- [ ] Sincronização com backend
- [ ] Sistema de usuários e autenticação
- [ ] Backup na nuvem
- [ ] Compartilhamento de templates
- [ ] Histórico de versões
- [ ] Exportação para PDF
- [ ] Integração com sistemas hospitalares

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de uso pessoal.

## 👥 Contribuição

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

---

**Desenvolvido com ❤️ para a comunidade médica brasileira**
