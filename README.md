# EvoluirMD - Plataforma de Evoluções Médicas 🩺✨

## 📋 Descrição

O **EvoluirMD** é uma plataforma web feita para ajudar estudantes e médicos a escreverem evoluções com mais rapidez, organização e segurança no dia a dia. Tudo funciona direto no navegador, sem complicação 😊

---

## ✨ O que você pode fazer

- 🧾 **Usar templates prontos** com campos editáveis (`[[campo]]`)
- ⌨️ **Navegar pelos campos com Tab e Shift+Tab**
- ⚡ **Inserir snippets rápidos** digitando `/atalho`
- 🗂️ **Criar, editar e excluir templates**
- 🏷️ **Organizar por categorias** com cores
- ⭐ **Favoritar templates** importantes
- 🕘 **Acessar templates recentes** no dashboard
- 💾 **Salvar tudo localmente** no navegador (localStorage)

---

## 🏠 Como funciona na prática

### 1) Dashboard
Você encontra:
- templates usados recentemente;
- todos os templates cadastrados;
- busca por texto;
- filtro por categoria.

### 2) Editor
- Abra um template e preencha os campos;
- ou use o **Editor em Branco** para começar do zero.

### 3) Snippets
No editor, digite `/` para ver sugestões e inserir textos prontos mais rápido 🚀

### 4) Gestão de conteúdo
- **Meus Templates**: biblioteca dos seus modelos
- **Minhas Categorias**: organização por tema/área
- **Meus Snippets**: atalhos de texto reutilizáveis

---

## ⌨️ Atalhos úteis

- `Tab` → próximo campo
- `Shift + Tab` → campo anterior
- `Esc` → fechar sugestões/modais
- `↑ / ↓` → navegar nas sugestões de snippet
- `Enter` ou `Tab` → inserir snippet selecionado
- `Ctrl/Cmd + S` (no editor em branco) → salvar como template

---

## 🧱 Estrutura do projeto

```text
EvoluirMD/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── stateManager.js
│   ├── storage.js
│   ├── editor.js
│   ├── snippets.js
│   ├── templates.js
│   ├── categories.js
│   ├── keyboard.js
│   └── navigation.js
├── LICENSE.md
└── README.md
```

---

## 💾 Sobre os dados

Seus dados ficam salvos no próprio navegador:
- templates
- snippets
- categorias

🔒 Nada é enviado para servidor externo por padrão.

---

## 🎨 Tecnologias

- HTML5
- CSS3
- JavaScript (ES Modules)
- Tailwind via CDN

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

Para mais detalhes, consulte o arquivo [LICENSE.md](./LICENSE.md).

---

**Feito com ❤️ para a comunidade médica brasileira 🇧🇷**
