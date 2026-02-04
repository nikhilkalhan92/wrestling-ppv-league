import { useEffect, useState } from "react";
import "./style.css";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/scores.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "50px" }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* ✅ CLEAN HEADER LIKE ARCHIVES */}
      <header className="archive-header">
        <h1>Fantasy Wrestling League</h1>
        <p>Live standings</p>

        {/* ✅ NAV BUTTONS */}
        <div className="nav-bar">
          <a href="/">Home</a>
          <a href="/rules.html">Rules</a>
          <a href="/archive/wwe.html">WWE</a>
          <a href="/archive/aew.html">AEW</a>
          <a href="/archive/tna.html">TNA</a>
          <a href="/archive/nxt.html">NXT</a>
        </div>

        {/* ✅ SMALL LOGOS UNDER BUTTONS */}
        <div className="mini-logos">
          <img src="/img/wwe.png" alt="WWE" />
          <img src="/img/aew.png" alt="AEW" />
          <img src="/img/nxt.png" alt="NXT" />
          <img src="/img/tna.png" alt="TNA" />
        </div>
      </header>

      <main>
        {/* ✅ MAIN TABLE CARD */}
        <div className="card">
          <h2>League Table</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>POS</th>
                  <th>PLAYER</th>
                  <th>WWE</th>
                  <th>AEW</th>
                  <th>NXT</th>
                  <th>TNA</th>
                  <th>TOTAL</th>
                </tr>
              </thead>

              <tbody>
                {data.league.map((row, i) => (
                  <tr
                    key={row.player}
                    className={
                      i === 0
                        ? "winner"
                        : i === data.league.length - 1
                        ? "loser"
                        : ""
                    }
                  >
                    <td>{i + 1}</td>
                    <td>{row.player}</td>
                    <td>{row.wwe}</td>
                    <td>{row.aew}</td>
                    <td>{row.nxt}</td>
                    <td>{row.tna}</td>
                    <td>
                      <strong>{row.total}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
