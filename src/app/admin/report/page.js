'use client';
import { useState, useEffect } from 'react';
import './page.css'

async function getData() {
  const url = "http://localhost:3001/location/report/getpending";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

async function updateDecision(id, status) {
  const url = "http://localhost:3001/location/report/approve";
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ locationId: id, status: status }),
  });
  console.log(response)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const result = await response.json();
  return result;
}

export default function Home() {
  const [target, setTarget] = useState();
  const [result, setResult] = useState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  getData().then((a) => setResult(a)).catch((error) => console.log(error))

  const ids = result?.data ? Object.keys(result.data) : [];

  const handleDecision = async (status) => {
    if (!target) return;
    setSaving(true);
    setError(null);
    try {
      await updateDecision(target, status);
      // refresh data after update
      const refreshed = await getData();
      setResult(refreshed);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <h1><strong>Admin Panel</strong></h1>
      <div className="app-container">

        <nav className="sidebar" id="sidebar-links">
          <h1><strong>Report List</strong></h1>
          <ul id="sidebar-list">
            {ids.map((id) => (
              <li key={id} onClick={() => setTarget(id)}>
                {id}
              </li>
            ))}
          </ul>
        </nav>

        <div className="Main-content">
          <nav className="Content" id="main-content">
            <h1><strong>Report content</strong></h1>
            <h3>address: {result?.data && target ? result.data[target]?.address : "No data available"}</h3>
            <h3>description: {result?.data && target ? result.data[target]?.description : "No data available"}</h3>
            <h3>details: {result?.data && target ? result.data[target]?.details : "No data available"}</h3>
            <h3>dislikes: {result?.data && target ? result.data[target]?.dislikes : "No data available"}</h3>
            <h3>email: {result?.data && target ? result.data[target]?.email : "No data available"}</h3>
            <h3>likes: {result?.data && target ? result.data[target]?.likes : "No data available"}</h3>
            <h3>obstruction: {result?.data && target ? result.data[target]?.obstruction : "No data available"}</h3>
            <h3>parking: {result?.data && target ? result.data[target]?.parking : "No data available"}</h3>
            <h3>rampAvailability: {result?.data && target ? result.data[target]?.rampAvailability : "No data available"}</h3>
            <h3>status: {result?.data && target ? result.data[target]?.status : "No data available"}</h3>
            <h3>twst: {result?.data && target ? result.data[target]?.twsi : "No data available"}</h3>
            <h3>walkway: {result?.data && target ? result.data[target]?.walkway : "No data available"}</h3>
          </nav>
        </div>

        {target && (
          <div className="decision-buttons">
            <button onClick={() => handleDecision('approved')} disabled={saving}>
              Accept
            </button>
            <button onClick={() => handleDecision('rejected')} disabled={saving}>
              Reject
            </button>
            {saving && <p>Saving...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}