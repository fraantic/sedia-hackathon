'use client';
import { useState } from 'react';
import './page.css'

export default async function Home() {
  const [target, setTarget] = useState();


  async function getData() {
    const url = "http://localhost:3001/location/getall";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  const result = await getData();
  const ids = result?.data ? Object.keys(result.data) : [];
  console.log(result);

  return (
    <div className="content">
      <div className="app-container">

        <nav className="sidebar" id="sidebar-links">
          <h1><strong>Report List</strong></h1>
          <ul id="sidebar-list">
            {ids.map((id) => (
              <li key={id} onClick={() => (result.data[id])}>
                {id}
              </li>
            ))}
          </ul>
        </nav>

        <div className="Main-content">
          <nav className="Content" id="main-content">
            <h1><strong>Report content</strong></h1>
            <h3>address: {result?.data && target ? result.data[target]?.address : "No data available"}</h3>
            <p>data</p>
          </nav>
        </div>

      </div>
    </div>
  )
}