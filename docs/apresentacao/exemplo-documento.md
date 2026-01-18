# Arquivo de Contexto de Projeto

## 1. Visão Geral do Projeto

**Objetivo:** Desenvolver uma aplicação fullstack (API + Web Client) para conversão de documentação técnica. O sistema recebe Markdown + Anexos, valida a integridade dos arquivos e gera documentos formatados (PDF ou Docx) baseados em templates corporativos e variáveis dinâmicas.

**Prioridade:** Robustez na validação de arquivos (frontend) e fidelidade visual na conversão (backend).

## 2. Stack Tecnológica

* **Backend:** Python 3.11+ (FastAPI).
* **Motores de Conversão:**
* `Pandoc` (Core engine).
* `WeasyPrint` (para renderização PDF via HTML).
* `Jinja2` (para injeção de variáveis em templates HTML).


* **Frontend:** React (Vite) + TailwindCSS + `lucide-react` (ícones).
* **Infra:** Docker (essencial para empacotar binários do Pandoc e fontes).

---

## 3. Regras de Negócio (Business Logic)

### 3.1. Frontend (O "Gatekeeper")

1. **Input Misto:** O usuário pode colar texto Markdown OU fazer upload de um arquivo `.md`.
2. **Validação de Integridade (Crítico):**
* O sistema deve fazer *parse* do texto Markdown em tempo real procurando o padrão `![alt](src)`.
* Deve comparar a lista de `src` encontrados com a lista de arquivos anexados pelo usuário (drag & drop).
* **Bloqueio:** O botão "Gerar Documento" deve ficar desabilitado se houver imagens no Markdown que não foram anexadas.
* **Feedback:** Exibir lista visual: "Esperado: `img1.png` (❌ Faltando)".


3. **Configuração de Template:**
* O usuário seleciona o formato de saída: PDF ou Docx.
* Inputs opcionais para variáveis: `{{NAME}}`, `{{DATE}}`, `{{VERSION}}`.



### 3.2. Backend (A Fábrica)

1. **Endpoint:** `POST /api/convert`.
2. **Tratamento de Quebra de Página:**
* O usuário usará a string `<<<PAGEBREAK>>>` no Markdown.
* Se Output == PDF: Substituir por `<div style="page-break-after: always;"></div>`.
* Se Output == Docx: Substituir por XML OpenXML de quebra de página (raw block do Pandoc).


3. **Fluxo de Conversão PDF:**
* Markdown  HTML (Pandoc).
* Injeção do HTML no Template Jinja2 (Header/Footer).
* Renderização final via `WeasyPrint`.


4. **Fluxo de Conversão Docx:**
* Uso do argumento `--reference-doc` do Pandoc.
* Variáveis são passadas via metadados do Pandoc.



---

## 4. Estrutura de Arquivos Sugerida

```text
/project-root
├── docker-compose.yml
├── /backend
│   ├── Dockerfile            # Deve instalar pandoc e weasyprint dependencies
│   ├── requirements.txt
│   ├── main.py               # Setup FastAPI
│   ├── /routers
│   │   └── convert.py        # Lógica de recebimento de arquivos
│   ├── /services
│   │   ├── converter_pdf.py  # Lógica MD -> HTML -> PDF
│   │   └── converter_docx.py # Lógica MD -> Docx (Pandoc wrapper)
│   ├── /templates
│   │   ├── base_layout.html  # Jinja2 template para PDF
│   │   └── reference.docx    # Template padrão Word
│   └── /utils
│       └── file_manager.py   # Gestão de arquivos temporários
├── /frontend
│   ├── package.json
│   ├── tailwind.config.js
│   └── /src
│       ├── /components
│       │   ├── EditorArea.jsx      # Onde cola o MD
│       │   ├── AttachmentZone.jsx  # Drag & drop de imagens
│       │   └── ValidationStatus.jsx # Lista de checagem (match MD vs Files)
│       └── App.jsx

```

---

## 5. Plano de Implementação (Passo a Passo para o Agente)

### Fase 1: Setup do Ambiente (Docker)

* **Tarefa:** Criar o `backend/Dockerfile`.
* **Requisito:** Base image `python:3.11-slim`. Instalar `pandoc` (via apt-get), `texlive` (opcional, se usar xelatex, mas preferir weasyprint para HTML->PDF) e bibliotecas do Pango/GDK para o WeasyPrint.

### Fase 2: Backend - Core Logic

* **Tarefa:** Criar `services/converter_pdf.py`.
* Deve receber texto MD e um dicionário de variáveis.
* Converter MD para HTML fragment.
* Renderizar template Jinja2 (inserindo o fragmento no body e as variáveis no Header/Footer).
* Gerar binário PDF.


* **Tarefa:** Criar `services/converter_docx.py`.
* Usar `pypandoc` ou `subprocess` para chamar pandoc.
* Mapear variáveis do request para `-M key=value` do pandoc.
* Tratar a tag `<<<PAGEBREAK>>>` antes da conversão.



### Fase 3: Backend - API Router

* **Tarefa:** Criar rota `POST /convert`.
* **Inputs:** `Form(...)` para metadados e `UploadFile` (lista) para anexos e template customizado (opcional).
* **Processo:**
1. Criar diretório temporário único (UUID).
2. Salvar todos os anexos lá.
3. Ajustar caminhos das imagens no Markdown para apontar para esse diretório temporário.
4. Chamar o service de conversão adequado.
5. Limpar diretório temporário (`finally`).
6. Retornar `FileResponse`.



### Fase 4: Frontend - Lógica de Validação

* **Tarefa:** Criar componente `EditorArea`.
* **Lógica:** Usar Regex `/!\[.*?\]\((.*?)\)/g` no `onChange` do texto. Extrair array de filenames esperados.
* **Tarefa:** Criar componente `AttachmentZone` usando `react-dropzone`. Manter estado `files[]`.
* **Tarefa:** Lógica de Cruzamento.
* `missingFiles = expectedFiles.filter(f => !uploadedFiles.includes(f))`
* Se `missingFiles.length > 0`, desabilitar botão de envio.



### Fase 5: Integração

* **Tarefa:** Conectar o `FormData` do Frontend com o endpoint FastAPI.
* **Requisito:** Garantir que o download do Blob (PDF/Docx) inicie automaticamente após a resposta da API.

---

## 6. Prompt Inicial para o Agente

"Atue como um Engenheiro de Software Sênior Especialista em Python e React. Eu tenho um arquivo de especificação (`PROJECT_SPEC.md`) acima. Quero que você comece implementando a **Fase 1 e Fase 2** (Ambiente Docker e Lógica Core do Backend). Por favor, escreva o `backend/Dockerfile` robusto para suportar Pandoc e WeasyPrint, e em seguida escreva o código Python para os serviços de conversão (`converter_pdf.py` e `converter_docx.py`) focando no tratamento da quebra de página customizada e substituição de variáveis."
