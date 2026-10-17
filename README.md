# Explainable Fake News Detection

An interactive research demonstration of **transformer-based fake news detection** with **LIME word-level explanations**, built with React + FastAPI + PyTorch.

> **Educational prototype** — predictions do not establish factual truth.

---

## Prerequisites

| Requirement | Minimum | Notes |
|---|---|---|
| Python | 3.13 | Via `py` launcher |
| Node.js | 22.9+ | For frontend |
| npm | 11+ | Comes with Node |
| RAM | 8 GB | 16 GB recommended |
| Storage | ~5 GB free | For model + PyTorch |
| GPU | Optional | RTX 3050+ with CUDA 12.6 supported |

---

## Installation

### 1. Clone or open the project

```powershell
cd "c:\Project\Fake news"
```

### 2. Set up the Python backend

```powershell
# Create virtual environment (already done if you followed setup)
py -3 -m venv backend\venv

# Activate
backend\venv\Scripts\activate

# Install PyTorch with CUDA 12.6 (for NVIDIA GPU)
python -m pip install torch --index-url https://download.pytorch.org/whl/cu126

# Install remaining backend dependencies (supports Python 3.13)
python -m pip install -r requirements.txt
```

> **CPU only?** Replace the torch install line with:
> ```powershell
> python -m pip install torch==2.14.1
> ```

### 3. Set up the frontend

```powershell
cd frontend
npm install
cd ..
```

---

## Model Download

The model (`hamzab/roberta-fake-news-classification`) is downloaded automatically from Hugging Face the **first time** the backend starts. It will be cached in `backend/.hf_cache/`.

- **Model size:** ~500 MB
- **Cache location:** `backend/.hf_cache/`
- **Subsequent starts:** no download needed

---

## Starting the Application

### Quick Start (Windows)

Simply double-click [`start.bat`](file:///c:/Project/Fake%20news/start.bat) or run:
```cmd
start.bat
```
This automatically starts both the FastAPI backend and Vite frontend in dedicated terminal windows and opens your browser to **http://localhost:5173**.

To stop all servers at once, double-click [`stop_servers.bat`](file:///c:/Project/Fake%20news/stop_servers.bat).

---

### Manual Start

### Step 1: Start the FastAPI backend

Open a PowerShell terminal:

```powershell
cd "c:\Project\Fake news\backend"
..\backend\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for the log line: `Model ready.`

### Step 2: Start the frontend (new terminal)

```powershell
cd "c:\Project\Fake news\frontend"
npm run dev
```

### Step 3: Open the browser

Navigate to: **http://localhost:5173**

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/model-info` | Model metadata and label mapping |
| POST | `/api/predict` | Run classifier inference |
| POST | `/api/explain` | Run inference + LIME explanation |

### Example: Predict

```powershell
Invoke-RestMethod -Uri http://localhost:8000/api/predict -Method Post `
  -ContentType 'application/json' `
  -Body '{"text": "Congress passed a bipartisan infrastructure bill worth $1.2 trillion."}'
```

### Example: Explain

```powershell
Invoke-RestMethod -Uri http://localhost:8000/api/explain -Method Post `
  -ContentType 'application/json' `
  -Body '{"text": "Scientists proved that lemon water cures cancer and diabetes."}'
```

---

## Configuration

Edit `backend/.env` to adjust:

| Variable | Default | Description |
|---|---|---|
| `MODEL_ID` | `hamzab/roberta-fake-news-classification` | HF model checkpoint |
| `HF_CACHE_DIR` | `.hf_cache` | Local cache for weights |
| `MAX_ARTICLE_LENGTH` | `5000` | Max characters per request |
| `LIME_NUM_SAMPLES` | `300` | Perturbation count (higher = slower, more accurate) |
| `DEVICE` | `auto` | `auto` / `cuda` / `cpu` |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |

---

## Troubleshooting

### Backend not reachable
- Ensure `uvicorn` is running and shows no errors
- Check that the virtual environment is activated
- The frontend status pill in the header will show "Offline" if it can't connect

### CUDA not detected
- Run `python -c "import torch; print(torch.cuda.is_available())"` in the venv
- Ensure NVIDIA drivers are up to date
- Set `DEVICE=cpu` in `.env` to force CPU mode

### LIME is slow
- Reduce `LIME_NUM_SAMPLES` in `.env` (e.g., `100`)
- Use GPU (CUDA) for much faster perturbation evaluation
- LIME on CPU with 300 samples takes ~15–40 seconds depending on article length

### Model download fails
- Check your internet connection
- Increase timeout by setting `HF_HUB_DOWNLOAD_TIMEOUT=600` environment variable
- Download manually: `huggingface-cli download hamzab/roberta-fake-news-classification`

### Port conflicts
- Backend: change `--port 8000` in the uvicorn command
- Frontend: update `vite.config.ts` proxy target if changing backend port
- Frontend port: set `--port 5174` in `npm run dev`

---

## Architecture

```
explainable-fake-news/
  backend/
    app/
      main.py             FastAPI application + endpoints
      config.py           Pydantic-settings configuration
      schemas.py          Request/response schemas
      model_service.py    Model loading + inference
      explanation_service.py  LIME explanation generation
    .env                  Environment variables
    requirements.txt      Python dependencies
    venv/                 Virtual environment (git-ignored)
    .hf_cache/            Hugging Face model cache (git-ignored)
  frontend/
    src/
      components/         React UI components
      services/api.ts     Backend API calls
      types/index.ts      TypeScript type definitions
      App.tsx             Main application + routing
    vite.config.ts        Dev server + proxy config
    tailwind.config.js    Design system tokens
```

---

## Model: hamzab/roberta-fake-news-classification

- **Architecture:** RoBERTa for sequence classification
- **Fine-tuning dataset:** ISOT Fake News Dataset
- **Labels:** `0 → Fake`, `1 → Real` (verified from model config)
- **Max tokens:** 512 (longer inputs are truncated)
- **License:** Apache 2.0
- **HF Hub:** https://huggingface.co/hamzab/roberta-fake-news-classification

---

## Adding More Models

1. Add a new model ID to `.env` or build a model selector on the frontend
2. Create a second model service instance in `model_service.py`
3. Accept a `model_id` field in `ArticleRequest` and route accordingly

## Adding SHAP

Replace or extend `explanation_service.py`:

```python
import shap

explainer = shap.KernelExplainer(predict_proba_fn, background_data)
shap_values = explainer.shap_values(text, nsamples=100)
```

The `/api/explain` response schema and all frontend rendering code can remain unchanged if you return the same `contributions` format.

---

## Model Limitations

- English-language news only
- Fine-tuned on a specific corpus with a fixed date range
- High confidence ≠ factual correctness
- Short headlines may produce less reliable predictions
- Reflects statistical biases from training data
- Not suitable as a sole fact-checking tool

---

*Educational Research Prototype — Explainable Fake News Detection Using Transformers and LIME*
