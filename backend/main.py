from fastapi import FastAPI, UploadFile, File

app = FastAPI(
    title="Brain AI Platform",
    description="Brain MRI analysis research platform",
    version="0.1.0"
)

from rag import router as rag_router

app.include_router(rag_router)


@app.get("/")
def root():
    return {
        "message": "Brain AI Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
async def analyze_mri(file: UploadFile = File(...)):

    return {
        "filename": file.filename,
        "message": "MRI received successfully",
        "status": "ready_for_analysis"
    }