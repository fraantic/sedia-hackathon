"use client";

import { useEffect, useState } from "react";
import "./page.css";

const API_BASE_URL = "/api/backend";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allLocations, setAllLocations] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchAllLocations() {
      const url = `${API_BASE_URL}/location/getall`;

      try {
        setFetchStatus("loading");

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        const dataMap = result?.data || {};
        const locationsArray = Object.entries(dataMap).map(([id, fields]) => ({
          id,
          ...fields,
        }));

        setAllLocations(locationsArray);
        setFetchStatus("success");
      } catch (error) {
        console.error(error.message);
        setErrorMessage(
          error.message ||
            "Backend not found"
        );
        setFetchStatus("error");
      }
    }

    fetchAllLocations();
  }, []);

  const matchingLocations = allLocations.filter((location) => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return true;

    const searchableText = `${location.address || ""} ${location.description || ""}`.toLowerCase();
    return searchableText.includes(trimmedQuery);
  });

  return (
    <main className="pageWrapper">
      <div className="searchPanel">
        <div>
          <h1> Hello user! </h1>
        </div>
        <div className="searchBarWrapper">
          <input
            type="text"
            placeholder="Search for location"
            className="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {fetchStatus === "loading" && (
          <p className="statusMessage">Loading locations…</p>
        )}

        {fetchStatus === "error" && (
          <p className="statusMessage statusMessageError">{errorMessage}</p>
        )}

        {fetchStatus === "success" && (
          <ul className="locationResultsList">
            {matchingLocations.length === 0 && (
              <li className="statusMessage">No locations found.</li>
            )}

            {matchingLocations.map((location) => (
              <li key={location.id} className="locationCard">
                <p className="locationAddress">{location.address}</p>

                {location.description && (
                  <p className="locationDescription">{location.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}