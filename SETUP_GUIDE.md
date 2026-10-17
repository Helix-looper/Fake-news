# Setup & Deployment Guide: Explainable Fake News Detection System

This guide provides step-by-step instructions to set up, configure, and run the **Explainable Fake News Detection System** on a new device (Windows, macOS, or Linux).

---

## 1. System Requirements

| Requirement | Minimum | Recommended | Notes |
|---|---|---|---|
| **Operating System** | Windows 10/11, macOS, Linux | Windows 11 / Ubuntu 22.04+ | Supported cross-platform |
| **Python** | 3.10+ | 3.11 or 3.12 or 3.13 | 64-bit required |
| **Node.js** | 18.0+ | 20.x or 22.x | LTS recommended |
| **npm** | 9.0+ | 10.x+ | Included with Node.js |
| **RAM** | 8 GB | 16 GB | Needed for RoBERTa + LIME perturbations |
| **Disk Space** | 5 GB free | 10 GB free | For PyTorch wheels + Hugging Face model cache |
| **GPU (Optional)** | None (CPU mode works) | NVIDIA GPU (RTX 3050+ or better) | Enables 5x–10x faster LIME explanations |

---

## 2. Directory Structure Overview

Ensure your project contains the following folder structure:

```text
Fake news/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings, device config, thresholds
│   │   ├── explanation_service.py# LIME explainability implementation
│   │   ├── main.py               # FastAPI application & endpoints
│   │   ├── model_service.py      # RoBERTa model loader & inference
│   │   └── schemas.py            # Pydantic request/response models
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Python virtual environment (created in Step 3)
├── frontend/
│   ├── src/
│   │   ├── components/           # React UI components (Analysis, LIME, Limitations)
│   │   ├── services/api.ts       # Backend API client
│   │   ├── types/index.ts        # TypeScript data contracts
│   │   ├── App.tsx               # Main application routing
│   │   └── main.tsx              # React DOM entry point
│   ├── package.json              # Frontend npm dependencies
│   ├── vite.config.ts            # Vite dev server and proxy config
│   └── tailwind.config.js        # Design system styles
├── README.md                     # High-level project summary
└── SETUP_GUIDE.md                # This comprehensive setup manual
```

---

## 3. Backend Setup (FastAPI & Machine Learning)

### Step 3.1: Open a Terminal & Navigate to the Project

#### On Windows (PowerShell):
```powershell
cd "c:\Project\Fake news\backend"
```

#### On macOS / Linux:
```bash
cd "/path/to/Fake news/backend"
```

---

### Step 3.2: Create and Activate a Python Virtual Environment

#### On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts script execution, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once).*

#### On Windows (Command Prompt `cmd`):
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

#### On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3.3: Install PyTorch

Choose either **GPU (CUDA)** or **CPU**:

#### Option A: NVIDIA GPU (CUDA 12.4 / 12.6 - Recommended for Windows/Linux)
```bash
python -m pip install --upgrade pip
pip install torch --index-url https://download.pytorch.org/whl/cu126
```

#### Option B: CPU Only (or Apple Silicon Mac)
```bash
python -m pip install --upgrade pip
pip install torch
```

---

### Step 3.4: Install Remaining Backend Dependencies

```bash
pip install -r requirements.txt
```

> **Note on Python 3.13:** `requirements.txt` specifies `numpy>=2.1.0` which has pre-built wheels for Python 3.13. No local C/C++ compiler is required.

---

### Step 3.5: Verify the Model Download

The fine-tuned RoBERTa model (`hamzab/roberta-fake-news-classification`, ~500 MB) is downloaded automatically on first startup and cached in `backend/.hf_cache/`.

You can test the backend and model loading with a quick one-liner:

#### On Windows:
```powershell
python -c "import sys; sys.path.insert(0, '.'); from app.model_service import load_model, predict; load_model(); print(predict('Scientists discover water on Mars.'))"
```

#### On macOS / Linux:
```bash
python3 -c "import sys; sys.path.insert(0, '.'); from app.model_service import load_model, predict; load_model(); print(predict('Scientists discover water on Mars.'))"
```

You should see an output like:
```python
{'predicted_label': 'Real', 'predicted_index': 1, 'probabilities': {'Fake': 0.0002, 'Real': 0.9998}, ...}
```

---

## 4. Frontend Setup (React, TypeScript & Vite)

Open a **second terminal window** for the frontend.

### Step 4.1: Navigate to the Frontend Directory

```bash
cd "c:\Project\Fake news\frontend"
```

### Step 4.2: Install NPM Dependencies

```bash
npm install
```

---

## 5. Running the Application

Keep two terminals open (one for the backend, one for the frontend):

### Terminal 1: Start the Backend Server

```bash
# Ensure virtual environment is activated
# Windows: .\venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

uvicorn app.main:app --host 127.0.0.1 --port 8000
```

You will see:
```text
INFO:     Started server process
[INFO] app.model_service: Using device: cuda (or cpu)
[INFO] app.model_service: Model loaded: RobertaForSequenceClassification
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### Terminal 2: Start the Frontend Server

```bash
cd frontend
npm run dev
```

You will see:
```text
  VITE v6.4.4  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://127.0.0.1:5173/
```

---

### Step 5.3: Access the Application

Open your browser and navigate to:
👉 **`http://localhost:5173`**

You should see:
1. **Model Status Badge**: Showing **Online** with green pulse indicator.
2. **Analysis Workspace**: Text box with sample news presets.
3. **Model Info Tab**: Technical specifications and hyperparameters.
4. **Limitations Tab**: Explanation of the "Style vs. Fact" dilemma and edge cases.
5. **About Tab**: Explainable AI and transformer research context.

---

## 6. Testing Endpoints Directly

You can test the backend API independently through the interactive OpenAPI Swagger documentation:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`
- **Model Info**: `http://127.0.0.1:8000/api/model-info`

### Example `curl` Prediction Request:
```bash
curl -X POST "http://127.0.0.1:8000/api/predict" \
     -H "Content-Type: application/json" \
     -d "{\"text\": \"NASA confirms discovery of ice caps beneath Martian surface.\"}"
```

---

## 7. Troubleshooting & FAQ

### Q1: `Error: Port 8000 or 5173 already in use`
- **Windows**: Run `Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process` in PowerShell.
- **Mac/Linux**: Run `lsof -ti:8000 | xargs kill -9`.

### Q2: `UserWarning: huggingface_hub cache-system uses symlinks...`
- On Windows without Developer Mode, Hugging Face issues a non-blocking warning that symlinks cannot be created. The application automatically handles this by setting `HF_HUB_DISABLE_SYMLINKS_WARNING=1` and saving actual files in `.hf_cache/`. No action needed.

### Q3: `How do I force CPU mode even if a GPU is detected?`
- Open `backend/app/config.py` and set `device: str = "cpu"`, or define an environment variable:
  ```powershell
  $env:DEVICE = "cpu"
  ```

### Q4: `Why does LIME take 5–10 seconds on the first run?`
- LIME generates 300 perturbed variations of the article and runs inference across them in batches to construct a localized linear surrogate model. On GPU this takes ~2–3 seconds; on CPU it may take 8–12 seconds.

---

## 8. Creating a Production Build (Optional)

If you wish to build the frontend as optimized static assets:

```bash
cd frontend
npm run build
```

The compiled assets will be placed in `frontend/dist/` and can be served via NGINX, Caddy, or FastAPI static file mount.
