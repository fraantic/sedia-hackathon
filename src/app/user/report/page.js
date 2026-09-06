"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./page.css";

const API_BASE_URL = "/api/backend";

function ReportFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("id");

  const [address, setAddress] = useState("");
  const [addressLoadStatus, setAddressLoadStatus] = useState("loading"); // loading | success | error

  const [walkway, setWalkway] = useState(null); // null = not yet chosen
  const [rampAvailability, setRampAvailability] = useState(null);
  const [parking, setParking] = useState(null);
  const [twsi, setTwsi] = useState(null);

  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [obstructionLevel, setObstructionLevel] = useState(0); // 0–10 slider
  const [imageFile, setImageFile] = useState(null); // raw File object
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // for on-screen preview only
  const [imageBase64, setImageBase64] = useState(null); // what actually gets submitted

  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | submitting | success | error
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    async function fetchAddress() {
      if (!locationId) {
        setAddressLoadStatus("error");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/location/getall`);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const result = await response.json();
        const dataMap = result?.data || {};
        const matched = dataMap[locationId];
        if (!matched) throw new Error("Location not found");
        setAddress(matched.address || "Unnamed location");
        setAddressLoadStatus("success");
      } catch (error) {
        console.error(error.message);
        setAddressLoadStatus("error");
      }
    }
    fetchAddress();
  }, [locationId]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result); // e.g. "data:image/png;base64,...."
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageBase64(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!locationId) {
      setSubmitErrorMessage("No location was specified — cannot submit report.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("submitting");
    setSubmitErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          walkway,
          rampAvailability,
          parking,
          twsi,
          email,
          details,
          obstruction: obstructionLevel,
          image: imageBase64,
          status: "pending", // flags this location for re-review after a report
        }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      setSubmitStatus("success");
      // Small delay so the user actually sees the success state before leaving
      setTimeout(() => {
        router.push(`/user?id=${locationId}`);
      }, 1200);
    } catch (error) {
      console.error(error.message);
      setSubmitErrorMessage(error.message || "Could not submit report.");
      setSubmitStatus("error");
    }
  }

  function handleCancelClick() {
    setShowCancelConfirm(true);
  }

  function handleConfirmCancel() {
    router.push(`/user?id=${locationId}`);
  }

  function handleDismissCancel() {
    setShowCancelConfirm(false);
  }

  return (
    <main className="reportPageWrapper">
      <div className="reportLayout">
        <div className="sidePanel">
          <ToggleRow label="Walkway" value={walkway} onChange={setWalkway} />
          <ToggleRow label="Ramp Accessibility" value={rampAvailability} onChange={setRampAvailability} />
          <ToggleRow label="OKU Parking" value={parking} onChange={setParking} />
          <ToggleRow
            label="TWSI (Tactile Warning Surface Indicator)"
            value={twsi}
            onChange={setTwsi}
          />

          <div className="imageUploadBox">
            {imagePreviewUrl && (
              <button
                type="button"
                className="imageRemoveButton"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                ✕
              </button>
            )}

            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Uploaded preview" className="imagePreview" />
            ) : (
              <label className="imageUploadLabel">
                <span className="imageUploadIcon">🔗</span>
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="imageUploadInput"
                />
              </label>
            )}
          </div>
        </div>

        <form className="mainPanel" onSubmit={handleSubmit}>
          <div className="locationHeader">
            {addressLoadStatus === "loading" && "Loading location…"}
            {addressLoadStatus === "error" && "Location unavailable"}
            {addressLoadStatus === "success" && address}
          </div>

          <input
            type="email"
            className="emailInput"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="detailsBox">
            <div className="detailsLabel">Details</div>
            <textarea
              className="detailsTextarea"
              placeholder="Text Here"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="obstructionRow">
            <span className="obstructionLabel">Obstruction Level</span>
            <div className="obstructionSliderWrapper">
              <span className="obstructionEndLabel">0</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={obstructionLevel}
                onChange={(e) => setObstructionLevel(Number(e.target.value))}
                className="obstructionSlider"
              />
              <span className="obstructionEndLabel">10</span>
            </div>
            <div className="obstructionSubLabels">
              <span>Minor Inconvenience</span>
              <span>Unable to Cross</span>
            </div>
          </div>

          {submitStatus === "error" && (
            <p className="submitErrorMessage">{submitErrorMessage}</p>
          )}
          {submitStatus === "success" && (
            <p className="submitSuccessMessage">Report submitted — redirecting…</p>
          )}

          <div className="actionRow">
            <button
              type="submit"
              className="submitButton"
              disabled={submitStatus === "submitting" || submitStatus === "success"}
            >
              {submitStatus === "submitting" ? "Submitting…" : "Submit"}
            </button>
            <button type="button" className="cancelButton" onClick={handleCancelClick}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showCancelConfirm && (
        <div className="confirmOverlay">
          <div className="confirmDialog">
            <p className="confirmMessage">
              Discard this report and go back? Anything you've entered will be lost.
            </p>
            <div className="confirmActionRow">
              <button className="confirmDiscardButton" onClick={handleConfirmCancel}>
                Discard
              </button>
              <button className="confirmKeepEditingButton" onClick={handleDismissCancel}>
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Small reusable Yes/No toggle component for the four accessibility fields
function ToggleRow({ label, value, onChange }) {
  return (
    <div className="toggleRow">
      <span className="toggleLabel">{label}</span>
      <div className="toggleButtonGroup">
        <button
          type="button"
          className={`toggleOption ${value === true ? "toggleOptionActive" : ""}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={`toggleOption ${value === false ? "toggleOptionActive" : ""}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ReportFormContent />
    </Suspense>
  );
}