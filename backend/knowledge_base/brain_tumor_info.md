# Brain Tumors: Educational Reference

## Overview
A brain tumor is an abnormal growth of cells in or around the brain. Tumors may be benign or malignant. Imaging findings alone do not establish a definitive diagnosis.

## MRI Modalities
- T1-weighted MRI helps show anatomical structures.
- T1-contrast-enhanced (T1ce) MRI can help reveal regions that enhance after contrast administration.
- T2-weighted MRI highlights differences in tissue water content.
- FLAIR suppresses much of the signal from cerebrospinal fluid and can help visualize abnormalities near fluid spaces.

## MRI Segmentation
Segmentation identifies regions of interest within medical images at the voxel level. A machine-learning model may produce a predicted mask, but its reliability depends on training data, image quality, scanner differences, and model validation.

## Important Limitations
An AI-generated segmentation is a research aid, not a clinical diagnosis. Predictions should be reviewed by qualified medical professionals. Model confidence, when available, is not the same as diagnostic certainty.

## Evaluation
Segmentation models may be evaluated using Dice similarity coefficient, intersection over union (IoU), sensitivity, and specificity. Evaluation should use appropriate held-out data and avoid patient-level data leakage.
