# 🧠 BrainAI — Brain MRI Analysis & Knowledge Assistant

**An AI-powered research platform combining brain MRI analysis workflows with a Retrieval-Augmented Generation (RAG)-inspired knowledge assistant.**

BrainAI is a research-oriented web platform designed to bring brain MRI analysis, medical-imaging AI, and knowledge retrieval into one accessible interface. The project combines a web-based user experience, a Python FastAPI backend, a curated brain-tumor knowledge base, and an extensible foundation for deep-learning-based MRI segmentation.

The platform explores how medical-imaging workflows and evidence-oriented information retrieval can work together to support research, improve access to relevant information, and make AI-assisted analysis easier to interact with.

> **Project status:** Active research and development. The RAG component implements keyword-overlap retrieval over a local knowledge base. The currently published MRI analysis endpoint is a placeholder and does not yet execute the trained segmentation model.

---

## ✨ Key Features

### 1. 🧠 Brain MRI Analysis Interface

BrainAI provides a web interface for interacting with an MRI analysis workflow.

- MRI file-upload interface.
- Dedicated analysis page and results interface.
- Separate report page for presenting analysis-related information.
- Frontend structure designed to connect with a Python backend.
- A foundation for integrating trained brain-tumor segmentation models.

**Current implementation note:** The published `/analyze` endpoint acknowledges the uploaded file and returns its filename and status. It does not currently perform tumor segmentation, classify a scan, or produce a clinical result. The trained model weights are not included in this repository.

### 2. 📚 RAG-Based Brain-Tumor Knowledge Assistant

The knowledge assistant is a central component of BrainAI. It allows users to ask questions and retrieve relevant passages from a curated collection of brain-tumor information.

Instead of relying on an ungrounded, free-form response, the current implementation retrieves matching passages from local Markdown and text documents and returns them with source information.

**Core capabilities:**

- Natural-language question input.
- Local knowledge-base document loading.
- Paragraph-level passage retrieval.
- Keyword-overlap relevance scoring.
- Ranked retrieval of up to three matching passages.
- Source filenames and relevance scores.
- A fallback response when no relevant passage is found.
- A dedicated health endpoint for checking the knowledge base.

#### How the RAG pipeline works

```text
User Question
     │
     ▼
Question Validation
     │
     ▼
Knowledge Base Loading
     │
     ▼
Text Tokenization
     │
     ▼
Paragraph-Level Retrieval
     │
     ▼
Keyword-Overlap Scoring
     │
     ▼
Rank the Matching Passages
     │
     ▼
Return Evidence + Source Information
```

The retrieval component tokenizes the question and each paragraph into lowercase alphanumeric words. It computes a simple overlap score:

\[
\text{Score}(q,p)=
\frac{|W_q \cap W_p|}{|W_q|}
\]

where \(W_q\) represents the set of words in the question and \(W_p\) represents the set of words in a passage.

The highest-scoring passages are returned, up to a maximum of three. Each passage is limited to 1,800 characters in the response.

#### Why source-aware retrieval matters

- **Traceability:** Retrieved passages include the filename of their source.
- **Transparency:** Users can inspect the evidence returned by the system.
- **Local knowledge control:** The knowledge collection can be extended with additional `.md` and `.txt` documents.
- **Graceful fallback:** The system indicates when it cannot find a relevant passage.
- **Modularity:** Retrieval is implemented separately from the main API routes.

**Technical distinction:** The current assistant is RAG-inspired retrieval, not a complete generative RAG system. It does not use embeddings, a vector database, an external LLM, or generated scientific answers. It returns relevant evidence passages and explicitly communicates this limitation.

### 3. 🌐 Interactive Web Interface

The frontend is organized into separate pages for different parts of the platform:

| Page | Purpose |
|---|---|
| `index.html` | Main landing page and project overview |
| `analysis.html` | MRI analysis interface |
| `results.html` | Analysis results interface and frontend integration |
| `report.html` | Report-oriented interface |
| `about.html` | Project information |

The interface uses HTML, CSS, and JavaScript, with page-specific stylesheets and scripts for maintainability.

### 4. ⚙️ FastAPI Backend

The backend provides an API layer for the web interface and separates MRI upload handling from knowledge retrieval.

- FastAPI application with API metadata.
- MRI upload endpoint.
- Health-check endpoint.
- Dedicated RAG router.
- Request validation using Pydantic.
- Local knowledge-base loading.
- Modular backend organization.

### 5. 🔬 Deep-Learning Integration Foundation

The broader BrainAI project includes trained U-Net brain-tumor segmentation work. The repository is structured as a starting point for integrating model inference into the web application.

Model weights and large generated outputs are intentionally excluded from the public repository. The published code should not be considered a complete, executable segmentation pipeline until model loading, preprocessing, inference, postprocessing, and result generation are connected to the API.

---

## 🏗️ System Architecture

BrainAI is organized into three primary layers.

```text
┌──────────────────────────────────────────────┐
│                 Web Frontend                 │
│                                              │
│  HTML · CSS · JavaScript                     │
│  Home · Analysis · Results · Reports · About │
└──────────────────────┬───────────────────────┘
                       │ HTTP Requests
                       ▼
┌──────────────────────────────────────────────┐
│                 FastAPI Backend              │
│                                              │
│  Health API · MRI Upload API · RAG Router    │
└────────────────┬─────────────────┬───────────┘
                 │                 │
                 ▼                 ▼
┌────────────────────────┐  ┌──────────────────┐
│ MRI Analysis Workflow  │  │ Knowledge        │
│                        │  │ Retrieval        │
│ Current endpoint is a  │  │                  │
│ placeholder            │  │ Markdown / Text  │
│                        │  │ Documents        │
│ Model integration is   │  │                  │
│ a development task     │  │ Ranked Passages  │
└────────────────────────┘  └──────────────────┘
```

The architecture separates the web interface, API routing, and retrieval logic so that model inference and more advanced retrieval methods can be developed independently.

---

## 🛠️ Technology Stack

| Technology | Role |
|---|---|
| Python | Backend and retrieval implementation |
| FastAPI | REST API framework |
| Uvicorn | ASGI application server |
| Pydantic | Request validation |
| HTML5 | Webpage structure |
| CSS3 | Interface styling |
| JavaScript | Frontend interactions and API communication |
| Markdown / Plain Text | Knowledge-base document formats |
| U-Net | Brain-tumor segmentation model work in the broader project |

The current public backend dependencies are listed in `backend/requirements.txt`.

---

## 📂 Project Structure

```text
brain-ai-platform/
│
├── backend/
│   ├── main.py
│   ├── rag.py
│   ├── requirements.txt
│   │
│   └── knowledge_base/
│       └── brain_tumor_info.md
│
├── frontend/
│   ├── index.html
│   ├── analysis.html
│   ├── results.html
│   ├── report.html
│   ├── about.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── home.css
│   │   ├── analysis.css
│   │   ├── results.css
│   │   ├── report.css
│   │   └── about.css
│   │
│   └── js/
│       ├── main.js
│       ├── analysis.js
│       ├── results.js
│       ├── report.js
│       └── about.js
│
├── research/                 # Research-related project files
├── .vscode/
├── .gitignore
└── README.md
```

Generated MRI outputs, model archives, and selected research results are excluded from version control through `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- Python installed on your system.
- Git, if you want to clone the repository.
- A terminal such as PowerShell, Command Prompt, or the VS Code terminal.
- A modern web browser.

### 1. Clone the repository

```bash
git clone https://github.com/Gazi3Jahin/brain-ai-platform.git
cd brain-ai-platform
```

### 2. Create a virtual environment

On Windows PowerShell:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell cannot find Python, install or repair Python first, or use the full path to a working Python executable.

### 3. Install the backend dependencies

From the project root:

```powershell
python -m pip install -r backend/requirements.txt
```

### 4. Start the FastAPI server

Run:

```powershell
python -m uvicorn main:app --reload --app-dir backend
```

The local API will normally be available at:

`http://127.0.0.1:8000`

Open the interactive API documentation at:

`http://127.0.0.1:8000/docs`

The knowledge-base directory is located at `backend/knowledge_base/`. The application reads `.md` and `.txt` files from that directory when a RAG endpoint is called.

### 5. Open the frontend

Open `frontend/index.html` in a browser, or use the VS Code Live Preview extension.

For API-backed browser interactions, configure the API base URL in the frontend JavaScript to point to the running backend. The frontend and backend must be able to communicate successfully; cross-origin browser requests may require CORS middleware in the backend.

**Important:** The current `/analyze` route is only an upload placeholder. Starting the server does not automatically enable trained-model inference.

---

## 🔌 API Reference

The following endpoints are implemented in the current published backend.

### `GET /`

Returns a basic API welcome message.

Example response:

```json
{
  "message": "Brain AI Platform API is running"
}
```

### `GET /health`

Checks whether the API is responding.

Example response:

```json
{
  "status": "healthy"
}
```

This checks API availability only. It does not verify that a trained model is loaded.

### `POST /analyze`

Accepts a file upload under the `file` field.

Example response:

```json
{
  "filename": "example_mri.nii.gz",
  "message": "MRI received successfully",
  "status": "ready_for_analysis"
}
```

The response is illustrative. The endpoint currently acknowledges the upload; it does not run segmentation or validate the medical suitability of the file.

### `GET /rag/health`

Loads the local knowledge documents and reports how many non-empty supported documents were loaded.

Example response:

```json
{
  "status": "ready",
  "documents_loaded": 1
}
```

The count depends on the documents present in the knowledge-base directory.

### `POST /rag/ask`

Accepts a question as JSON.

Example request:

```json
{
  "question": "What is a brain tumor?"
}
```

The question must contain between 3 and 1,000 characters.

The response includes an answer containing retrieved passages and a list of sources with relevance scores. If no matching passages are found, the API returns a fallback message and an empty source list.

Explore and test the endpoints at `/docs` while the backend is running.

---

## 📖 Extending the Knowledge Base

The RAG component reads Markdown and plain-text documents from:

```text
backend/knowledge_base/
```

To extend the collection:

1. Add a relevant `.md` or `.txt` file.
2. Use clear headings and concise paragraphs.
3. Prefer reliable, clearly attributed educational or scientific sources.
4. Restart or query the API and verify that `/rag/health` reports the expected document count.
5. Test several questions using `/rag/ask` and inspect the retrieved passages.

The implementation loads the knowledge documents when the endpoints are called, so the current version does not require a separate indexing job.

Because retrieval is based on word overlap, it may miss relevant passages when the wording differs between a question and a document. It may also rank a passage highly because of shared words without understanding the medical context.

---

## 🧪 Testing and Verification

Basic checks can be performed through the interactive API documentation or directly from a terminal.

### Check API availability

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

### Check the knowledge base

```powershell
Invoke-RestMethod http://127.0.0.1:8000/rag/health
```

### Ask a knowledge-base question

```powershell
$body = @{
    question = "What is a brain tumor?"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://127.0.0.1:8000/rag/ask" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

These checks test API responsiveness and retrieval behavior. They do not validate clinical accuracy, model performance, or MRI segmentation.

---

## 🔐 Data, Privacy, and Model Files

BrainAI is a research project, and responsible handling of medical information is essential.

- Do not commit patient-identifiable information, private MRI scans, credentials, or environment files.
- Large model weights and generated medical-imaging outputs are excluded from the repository.
- The `.gitignore` file excludes common model formats, ZIP archives, DICOM files, and NIfTI imaging files.
- Verify that any additional dataset, model, or knowledge document can legally and ethically be redistributed before adding it to the repository.
- Avoid uploading sensitive data to public services or temporary tunnels.
- A public source-code repository does not itself provide a secure or production-ready medical-data processing service.

Model weights are not included in this repository. Reproducing the trained-model workflow will require the appropriate model artifact, compatible dependencies, preprocessing steps, and inference implementation.

---

## ⚠️ Limitations

The current implementation has several important limitations:

1. **MRI analysis:** The published `/analyze` endpoint acknowledges uploads but does not execute the trained model.
2. **RAG retrieval:** Ranking is based on keyword overlap rather than semantic embeddings.
3. **Answer generation:** The assistant retrieves passages; it does not generate new scientific answers with an LLM.
4. **Source granularity:** Responses identify source filenames, but do not yet provide formal citations, page numbers, or passage-level document metadata.
5. **Medical validation:** Retrieved information and future model outputs require appropriate expert review and validation.
6. **Deployment:** The repository contains application source code, not a deployed production service.
7. **Frontend integration:** API URLs, CORS configuration, and backend availability must be configured correctly for browser-based requests.
8. **Model reproducibility:** Model weights and the complete inference pipeline are not packaged with the public repository.

These limitations define the current development stage and provide a clear path for further engineering and research.

---

## 🗺️ Roadmap

Potential next development milestones include:

- [ ] Integrate the trained U-Net model into the MRI analysis endpoint.
- [ ] Implement input validation and MRI preprocessing.
- [ ] Generate segmentation masks and connect the inference output to the results interface.
- [ ] Add model-loading checks and inference error handling.
- [ ] Improve RAG retrieval using semantic embeddings and a vector index.
- [ ] Add more robust source metadata and passage-level citations.
- [ ] Explore LLM-based answer generation grounded in retrieved evidence.
- [ ] Evaluate retrieval relevance, answer faithfulness, and failure cases.
- [ ] Add automated API tests and frontend integration tests.
- [ ] Configure CORS and deployment settings for a stable environment.
- [ ] Document model provenance, evaluation methodology, and reproducibility requirements.
- [ ] Evaluate reliability and limitations before any clinical or real-world use.

---

## 🎯 Project Vision

BrainAI aims to explore a practical intersection of medical imaging, deep learning, and knowledge retrieval.

The long-term direction is to connect MRI analysis workflows with a transparent, evidence-oriented knowledge assistant, while keeping the components modular and making their limitations visible to users.

The current repository establishes the web interface, API structure, and local knowledge retrieval foundation. Future development can build on this foundation through validated model integration, stronger retrieval methods, systematic testing, and responsible deployment.

---

## 👩‍💻 Author

**G.T.S. Jahin

GitHub: [@Gazi3Jahin](https://github.com/Gazi3Jahin)

Project repository: [BrainAI Platform](https://github.com/Gazi3Jahin/brain-ai-platform)

---

## ⚕️ Disclaimer

BrainAI is an educational and research-oriented software project. It is not a medical device and is not intended to diagnose, treat, prevent, or monitor any disease. The current implementation is not validated for clinical use. Its retrieved information and any future model-generated outputs must not be treated as a substitute for qualified medical judgment.
