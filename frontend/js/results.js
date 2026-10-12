const API_BASE_URL = "https://road-steering-dry-roses.trycloudflare.com";

const RESULT_ID = "2d46c48d4b994b4fb3426a6467fae922";

const statusElement = document.getElementById("results-status");
const resultContainer = document.getElementById("results-container");

function setStatus(message) {
    statusElement.replaceChildren();
    const p = document.createElement("p");
    p.textContent = message;
    statusElement.appendChild(p);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function showImage(panelId, dataUrl, alt) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.replaceChildren();

    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
        const p = document.createElement("p");
        p.textContent = "Preview unavailable.";
        panel.appendChild(p);
        return;
    }

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = alt;
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    panel.appendChild(img);
}

function displayResults(data) {
    const result = data.result;
    const previews = data.previews;

    if (!result || !previews) {
        throw new Error("The backend result is missing analysis details or previews.");
    }

    const voxels = Number(result.tumor_voxels);

    setText("prediction", voxels > 0
        ? "Region segmented"
        : "No voxels segmented");

    setText("prediction-description",
        "Experimental U-Net prediction of the whole-tumor region. This is not a diagnosis.");

    setText("tumor-volume", Number.isFinite(voxels)
        ? voxels.toLocaleString()
        : "Unavailable");

    setText("preview-slice", result.preview_slice_index ?? "—");
    setText("result-id", result.result_id ?? RESULT_ID);
    setText("modalities", Array.isArray(result.modalities)
        ? result.modalities.join(", ").toUpperCase()
        : "—");

    setText("volume-shape", Array.isArray(result.volume_shape)
        ? result.volume_shape.join(" × ")
        : "—");

    setText("threshold", Number.isFinite(Number(result.threshold))
        ? Number(result.threshold).toFixed(2)
        : "—");

    showImage("flair-panel", previews.flair, "FLAIR MRI preview");
    showImage("mask-panel", previews.mask, "Predicted tumor segmentation mask");
    showImage("overlay-panel", previews.overlay, "MRI with predicted segmentation overlay");

    const download = document.getElementById("download-results");
    download.href =
        `${API_BASE_URL}/results/${encodeURIComponent(result.result_id)}/download`;
    download.setAttribute("download", "brainai-analysis-results.zip");

    resultContainer.hidden = false;
    setStatus("Real backend analysis results loaded.");
}

async function loadResults() {
    setStatus("Loading saved analysis results...");

    try {
        const saved = sessionStorage.getItem("brainAIResult");

        if (saved) {
            const data = JSON.parse(saved);
            if (data.result && data.previews) {
                displayResults(data);
                return;
            }
        }

        setStatus(
            "The analysis result is saved on the backend, but its preview data is not available in this browser session. Please reconnect the saved result."
        );
    } catch (error) {
        console.error("Results loading error:", error);
        setStatus(error.message || "Could not load analysis results.");
    }
}

/* =========================
   BrainAI RAG Assistant
========================= */

const ragForm = document.getElementById("rag-form");
const ragQuestion = document.getElementById("rag-question");
const ragSubmit = document.getElementById("rag-submit");
const ragStatus = document.getElementById("rag-status");
const ragAnswerContainer = document.getElementById("rag-answer-container");
const ragAnswer = document.getElementById("rag-answer");
const ragSources = document.getElementById("rag-sources");

if (ragForm) {
    ragForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const question = ragQuestion.value.trim();

        if (!question) {
            ragStatus.textContent = "Please enter a question.";
            return;
        }

        ragSubmit.disabled = true;
        ragSubmit.textContent = "Searching...";
        ragStatus.textContent = "Retrieving relevant information...";
        ragAnswerContainer.hidden = true;
        ragAnswer.replaceChildren();
        ragSources.replaceChildren();

        try {
            const response = await fetch(`${API_BASE_URL}/rag/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.detail || `Request failed (${response.status}).`
                );
            }

            if (typeof data.answer !== "string") {
                throw new Error("The API did not return an answer.");
            }

            // Display the answer safely as plain text.
            ragAnswer.textContent = data.answer;

            const sources = Array.isArray(data.sources)
                ? data.sources
                : [];

            if (sources.length > 0) {
                sources.forEach((source) => {
                    const item = document.createElement("li");
                    const name = document.createElement("strong");
                    const relevance = document.createElement("span");

                    name.textContent = source.name || "Knowledge-base document";

                    relevance.textContent =
                        source.relevance !== undefined
                            ? ` — relevance: ${source.relevance}`
                            : "";

                    item.append(name, relevance);
                    ragSources.appendChild(item);
                });
            } else {
                const item = document.createElement("li");
                item.textContent = "No source references were returned.";
                ragSources.appendChild(item);
            }

            ragAnswerContainer.hidden = false;
            ragStatus.textContent = "Answer retrieved successfully.";

        } catch (error) {
            console.error("BrainAI RAG error:", error);

            ragStatus.textContent =
                "Could not reach the RAG assistant. Check your internet connection, public API URL, and browser Console for CORS errors.";
        } finally {
            ragSubmit.disabled = false;
            ragSubmit.textContent = "Ask BrainAI";
        }
    });
}

loadResults();