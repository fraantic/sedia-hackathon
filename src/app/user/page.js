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
          <span>👍 {location.likes ?? 0}</span>
          <span>👎 {location.dislikes ?? 0}</span>
        </div>

                      <div className="recentReportRow">
          <span className="recentReportLabel">Recent Report:</span>
          <span className="recentReportValue">
            {location.recentReport || "No recent report"}
          </span>
        </div>
        <div> 
            <button className="Reports" onClick={handleReportClick}>
            Report ⚠
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

        <div className="locationFieldList">
  <h1 className="locationFieldListTitle">Reports</h1>

  <div className="locationFieldGrid">
    <div className="locationFieldItem">
      <span className="locationFieldLabel">ID</span>
      <span className="locationFieldValue">{location?.id || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Address</span>
      <span className="locationFieldValue">{location?.address || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Description</span>
      <span className="locationFieldValue">{location?.description || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Details</span>
      <span className="locationFieldValue">{location?.details || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Dislikes</span>
      <span className="locationFieldValue">{location?.dislikes ?? "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Email</span>
      <span className="locationFieldValue">{location?.email || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Likes</span>
      <span className="locationFieldValue">{location?.likes ?? "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Obstruction</span>
      <span className="locationFieldValue">{location?.obstruction || "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Parking</span>
      <span className="locationFieldValue">{location?.parking ?? "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Ramp Availability</span>
      <span className="locationFieldValue">{location?.rampAvailability ?? "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">TWSI</span>
      <span className="locationFieldValue">{location?.twsi ?? "No data available"}</span>
    </div>
    <div className="locationFieldItem">
      <span className="locationFieldLabel">Walkway</span>
      <span className="locationFieldValue">{location?.walkway ?? "No data available"}</span>
    </div>
  </div>
</div>

        <div className="footerRow">
          <span className="lastUpdatedText">
            Last Updated: {lastUpdatedLabel}
          </span>
      
        </div>

        <div> 
          
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