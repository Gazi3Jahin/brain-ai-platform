const API_BASE_URL = "https://road-steering-dry-roses.trycloudflare.com";

const form = document.getElementById("analysis-form");
const fileInput = document.getElementById("mri-zip");
const fileNameElement = document.getElementById("file-name");
const statusElement = document.getElementById("analysis-status");
const analyzeButton = document.getElementById("analyze-button");

function setStatus(message) {
if (!statusElement) return;

statusElement.replaceChildren();

const paragraph = document.createElement("p");
paragraph.textContent = message;
statusElement.appendChild(paragraph);

}

function setButtonLoading(isLoading) {
if (!analyzeButton) return;

analyzeButton.disabled = isLoading;
analyzeButton.textContent = isLoading ? "Analyzing..." : "Run Analysis";

}

// Show the selected archive.
fileInput?.addEventListener("change", () => {
const file = fileInput.files?.[0];

if (!file) {
    if (fileNameElement) fileNameElement.textContent = "No file selected";
    setButtonLoading(false);
    setStatus("Waiting for an MRI archive.");
    return;
}

if (!file.name.toLowerCase().endsWith(".zip")) {
    fileInput.value = "";
    if (fileNameElement) fileNameElement.textContent = "No file selected";
    setButtonLoading(false);
    setStatus("Please select a ZIP archive containing the four MRI modalities.");
    return;
}

if (fileNameElement) fileNameElement.textContent = file.name;
setButtonLoading(false);
setStatus("MRI archive selected. Ready to analyze.");

});

// Upload the archive and run inference.
form?.addEventListener("submit", async (event) => {
event.preventDefault();

const file = fileInput?.files?.[0];

if (!file) {
    setStatus("Please select an MRI ZIP archive first.");
    return;
}

setButtonLoading(true);
setStatus("Uploading MRI data and running segmentation. This may take a few minutes.");

try {
    const formData = new FormData();
    formData.append("file", file);

    let response;

    try {
        response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData
        });
    } catch (networkError) {
        console.error("Network/CORS error:", networkError);

        throw new Error(
            "The browser could not reach the Colab API. " +
            "This may be a CORS or Colab proxy issue. " +
            "Check the browser Console and Network tabs."
        );
    }

    const responseText = await response.text();
    let payload;

    try {
        payload = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error(
            `The API returned an unexpected response (HTTP ${response.status}). ` +
            "Check whether the Colab proxy is forwarding requests to FastAPI."
        );
    }

    if (!response.ok) {
        const detail = typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail || payload);

        throw new Error(`API error (HTTP ${response.status}): ${detail}`);
    }

    if (
        payload.status !== "success" ||
        !payload.result ||
        !payload.previews
    ) {
        throw new Error("The API response is missing expected result or preview data.");
    }

    sessionStorage.setItem(
        "brainAIResult",
        JSON.stringify({
            ...payload,
            api_base_url: API_BASE_URL
        })
    );

    setStatus("Analysis completed. Opening your results...");
    window.location.href = "results.html";

} catch (error) {
    console.error("BrainAI analysis error:", error);
    setStatus(error.message || "An unexpected error occurred.");
} finally {
    setButtonLoading(false);
}

});