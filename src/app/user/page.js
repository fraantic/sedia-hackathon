"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./page.css";

const API_BASE_URL = "/api/backend";

function LocationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("id");
  const [location, setLocation] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [voteInFlight, setVoteInFlight] = useState(false);

  useEffect(() => {
    async function fetchLocationById() {
      if (!locationId) {
        setFetchStatus("error");
        setErrorMessage("No location was selected.");
        return;
      }

      try {
        setFetchStatus("loading");

        const response = await fetch(`${API_BASE_URL}/location/getall`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        const dataMap = result?.data || {};
        const matchedFields = dataMap[locationId];

        if (!matchedFields) {
          setFetchStatus("error");
          setErrorMessage("That location could not be found.");
          return;
        }

        setLocation({ id: locationId, ...matchedFields });
        setFetchStatus("success");

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDate = now.toLocaleDateString();
        setLastUpdatedLabel(`${formattedTime} ${formattedDate}`);

        // Check localStorage for a prior vote on this specific location.
        // Keyed per-locationId so voting on one place doesn't affect another.
        const storedVote = localStorage.getItem(`vote_${locationId}`);
        if (storedVote === "like" || storedVote === "dislike") {
          setUserVote(storedVote);
        }
      } catch (error) {
        console.error(error.message);
        setErrorMessage(error.message || "Could not load this location.");
        setFetchStatus("error");
      }
    }

    fetchLocationById();
  }, [locationId]);

  const handleReportClick = () => {
    router.push(`/user/report?id=${locationId}`);
  };

  function getFieldState(rawValue) {
    const hasData = rawValue !== undefined && rawValue !== null && rawValue !== "";
    const isTruthy = hasData ? Boolean(rawValue) : false;
    return { hasData, isTruthy };
  }

  const walkwayState = getFieldState(location?.walkway);
  const rampState = getFieldState(location?.rampAvailability);
  const parkingState = getFieldState(location?.parking);
  const twsiState = getFieldState(location?.twsi);

  async function handleVote(newVote) {
    if (voteInFlight || !location) return;

    const isUndoingVote = userVote === newVote;
    const nextVote = isUndoingVote ? null : newVote;

  
    let newLikes = location.likes ?? 0;
    let newDislikes = location.dislikes ?? 0;

    if (userVote === "like") newLikes -= 1;
    if (userVote === "dislike") newDislikes -= 1;

    if (nextVote === "like") newLikes += 1;
    if (nextVote === "dislike") newDislikes += 1;

    const previousLocation = location;
    const previousVote = userVote;

    setLocation({ ...location, likes: newLikes, dislikes: newDislikes });
    setUserVote(nextVote);
    setVoteInFlight(true);

    try {
      const response = await fetch(`${API_BASE_URL}/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          likes: newLikes,
          dislikes: newDislikes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      if (nextVote) {
        localStorage.setItem(`vote_${locationId}`, nextVote);
      } else {
        localStorage.removeItem(`vote_${locationId}`);
      }
    } catch (error) {
      console.error(error.message);

      setLocation(previousLocation);
      setUserVote(previousVote);
    } finally {
      setVoteInFlight(false);
    }
  }

  if (fetchStatus === "loading") {
    return (
      <main className="detailPageWrapper">
        <p className="detailStatusMessage">Loading location…</p>
      </main>
    );
  }

  if (fetchStatus === "error") {
    return (
      <main className="detailPageWrapper">
        <div>
          <p className="detailStatusMessage detailStatusMessageError">
            {errorMessage}
          </p>
          <button className="backToSearchButton" onClick={() => router.push("/")}>
            Back to search
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="detailPageWrapper">
      <div className="sidePanel">
        <div className="locationDetails">Accessibility Details</div>

        <ul className="checklistList">
          <li className="checklistItem">
            <span className="checklistLabel">Walkway</span>
            <span
              className={`checklistIcon ${
                !walkwayState.hasData
                  ? "checklistIconNoData"
                  : walkwayState.isTruthy
                  ? "checklistIconChecked"
                  : "checklistIconUnchecked"
              }`}
              title={walkwayState.hasData ? "Reported value" : "Not submitted"}
            >
              {!walkwayState.hasData ? "N/A" : walkwayState.isTruthy ? "✓" : "✕"}
            </span>
          </li>

          <li className="checklistItem">
            <span className="checklistLabel">Ramp Accessibility</span>
            <span
              className={`checklistIcon ${
                !rampState.hasData
                  ? "checklistIconNoData"
                  : rampState.isTruthy
                  ? "checklistIconChecked"
                  : "checklistIconUnchecked"
              }`}
              title={rampState.hasData ? "Reported value" : "Not submitted"}
            >
              {!rampState.hasData ? "N/A" : rampState.isTruthy ? "✓" : "✕"}
            </span>
          </li>

          <li className="checklistItem">
            <span className="checklistLabel">OKU Parking</span>
            <span
              className={`checklistIcon ${
                !parkingState.hasData
                  ? "checklistIconNoData"
                  : parkingState.isTruthy
                  ? "checklistIconChecked"
                  : "checklistIconUnchecked"
              }`}
              title={parkingState.hasData ? "Reported value" : "Not submitted"}
            >
              {!parkingState.hasData ? "N/A" : parkingState.isTruthy ? "✓" : "✕"}
            </span>
          </li>

          <li className="checklistItem">
            <span className="checklistLabel">
              TWSI (Tactile Warning Surface Indicator)
            </span>
            <span
              className={`checklistIcon ${
                !twsiState.hasData
                  ? "checklistIconNoData"
                  : twsiState.isTruthy
                  ? "checklistIconChecked"
                  : "checklistIconUnchecked"
              }`}
              title={twsiState.hasData ? "Reported value" : "Not submitted"}
            >
              {!twsiState.hasData ? "N/A" : twsiState.isTruthy ? "✓" : "✕"}
            </span>
          </li>
        </ul>

        {location.details && (
          <p className="locationExtraDetails">{location.details}</p>
        )}

        <div className="voteRow">
          <button
            type="button"
            className={`voteButton ${userVote === "like" ? "voteButtonActiveLike" : ""}`}
            onClick={() => handleVote("like")}
            disabled={voteInFlight}
          >
            👍 {location.likes ?? 0}
          </button>
          <button
            type="button"
            className={`voteButton ${userVote === "dislike" ? "voteButtonActiveDislike" : ""}`}
            onClick={() => handleVote("dislike")}
            disabled={voteInFlight}
          >
            👎 {location.dislikes ?? 0}
          </button>
        </div>
      </div>

      <div className="mainPanel">
        <button className="addressHeader" onClick={() => router.push("/")}>
          {location.address || "Address unavailable"}
        </button>

        <div className="mapFrameWrapper">
          <iframe
            key={location.address}
            className="mapIframe"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              location.address || ""
            )}&t=h&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location map"
          />
        </div>

        <div className="footerRow">
          <span className="lastUpdatedText">
            Last Updated: {lastUpdatedLabel}
          </span>
          <button className="reportButton" onClick={handleReportClick}>
            Report ⚠
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LocationDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="detailPageWrapper">
          <p className="detailStatusMessage">Loading…</p>
        </main>
      }
    >
      <LocationDetailContent />
    </Suspense>
  );
}