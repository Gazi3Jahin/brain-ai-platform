document.addEventListener("DOMContentLoaded", function () {
    const printButton = document.getElementById("print-report");

    if (printButton) {
        printButton.addEventListener("click", function () {
            window.print();
        });
    }

    const analysisId = document.getElementById("analysis-id");
    const sampleName = document.getElementById("sample-name");
    const prediction = document.getElementById("report-prediction");
    const confidence = document.getElementById("report-confidence");
    const volume = document.getElementById("report-volume");
    const observations = document.getElementById("observations");

    function setText(element, value) {
        if (element) {
            element.textContent = value;
        }
    }

    let data;

    try {
        const saved = sessionStorage.getItem("brainAIResult");
        data = saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error("Could not read saved analysis:", error);
        data = null;
    }

    if (!data || !data.result) {
        setText(analysisId, "No analysis loaded");
        setText(sampleName, "No saved MRI analysis");
        setText(prediction, "Analysis results unavailable");
        setText(confidence, "Not provided");
        setText(volume, "Not available");
        setText(
            observations,
            "No saved analysis was found in this browser session. " +
            "Run an analysis first, then open the report from the results page."
        );
        return;
    }

    const result = data.result;

    // Use actual metadata returned by the backend.
    const id = result.result_id || result.analysis_id || "Not provided";

    setText(analysisId, id);
    setText(sampleName, result.sample_name || "Uploaded MRI sample");

    const voxelCount = Number(
        result.tumor_voxels ??
        result.segmented_voxels ??
        result.volume_voxels
    );

    if (Number.isFinite(voxelCount) && voxelCount >= 0) {
        setText(
            volume,
            voxelCount.toLocaleString()
        );

        setText(
            prediction,
            voxelCount > 0
                ? "Target region segmented"
                : "No target voxels identified"
        );

        setText(
            observations,
            `The model produced a segmentation containing ${voxelCount.toLocaleString()} target voxels. ` +
            "This is a model-generated result, not a confirmed tumor diagnosis. " +
            "Review the segmentation alongside the original MRI."
        );
    } else {
        setText(volume, "Not provided");
        setText(prediction, "Segmentation result available");

        setText(
            observations,
            "The analysis response was loaded, but a valid segmented-voxel count " +
            "was not available in its metadata. Review the results page for the " +
            "available segmentation output."
        );
    }

    // Do not invent a confidence score if the model doesn't return one.
    const confidenceValue =
        result.confidence ??
        result.mean_confidence ??
        result.model_confidence;

    if (
        confidenceValue !== undefined &&
        confidenceValue !== null &&
        Number.isFinite(Number(confidenceValue))
    ) {
        const numericConfidence = Number(confidenceValue);
        const percentage = numericConfidence <= 1
            ? numericConfidence * 100
            : numericConfidence;

        setText(confidence, `${percentage.toFixed(1)}%`);
    } else {
        setText(confidence, "Not provided");
    }
});