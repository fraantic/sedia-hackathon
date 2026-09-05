import "./page.css";

export default function Home() {
  return (
    <main className="pageWrapper">
        {/*Search Input*/}
        <div className="pillItem">
          <input
            type="text"
            placeholder="Search for location"
            className="searchInput"
          />
        </div>
    </main>
  );
}
