import { useEffect, useState } from "react";
import "./style.css";

function App() {
  const [players, setPlayers] = useState([]);
  const [maxPoints, setMaxPoints] = useState({});

  useEffect(() => {
    fetch("/data/scores.json")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || []);
        setMaxPoints(data.ppv_max_points || {});
      })
      .catch((err) => console.error("JSON Load Error:", err));
  }, []);

  // Prevent blank screen
  if (!players.length) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "60px" }}>
        Loading League Table...
      </div>
    );
  }

  // ✅ Calculate totals properly
  const leagueTable = players.map((p) => {
    const wweTotal = Object.values(p.WWE || {}).reduce((a, b) => a + b, 0);
    const aewTotal = Object.values(p.AEW || {}).reduce((a, b) => a + b, 0);
    const tnaTotal = Object.values(p.TNA || {}).reduce((a, b) => a + b, 0);
    const nxtTotal = Object.values(p.NXT || {}).reduce((a, b) => a + b, 0);

    return {
      name: p.name,
      wwe: wweTotal,
      aew: aewTotal,
      nxt: nxtTotal,
      tna: tnaTotal,
      total: wweTotal + aewTotal + nxtTotal + tnaTotal,
      raw: p,
    };
  });

  // Sort leaderboard
  leagueTable.sort((a, b) => b.total - a.total);

  // ✅ Mini Table Builder
  const renderCompanyTable = (company) => {
    const ppvs = Object.keys(maxPoints[company] || {});

    return (
      <section key={company}>
        <h2>{company}</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>PPV</th>
                {players.map((p) => (
                  <th key={p.name}>{p.name.toUpperCase()}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Each PPV Row */}
              {ppvs.map((ppv) => (
                <tr key={ppv}>
                  <td>
                    {ppv} / {maxPoints[company][ppv]}
                  </td>

                  {players.map((p) => (
                    <td key={p.name}>
                      {p[company]?.[ppv] ?? 0}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="company-total-row">
                <td>
                  <strong>Total</strong>
                </td>

                {players.map((p) => {
                  const total = Object.values(p[company] || {}).reduce(
                    (a, b) => a + b,
                    0
                  );

                  return (
                    <td key={p.name}>
                      <strong>{total}</strong>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <>
      {/* HEADER */}
      <header className="archive-header">
        <h1>Fantasy Wrestling League</h1>
        <p>Live standings</p>

        {/* NAV BUTTONS */}
        <div className="nav-bar">
          <a href="/">Home</a>
          <a href="/rules.html">Rules</a>
          <a href="/archive/wwe.html">WWE</a>
          <a href="/archive/aew.html">AEW</a>
          <a href="/archive/tna.html">TNA</a>
          <a href="/archive/nxt.html">NXT</a>
        </div>

        {/* LOGOS */}
        <div className="mini-logos">
          <img src="/img/wwe.png" alt="WWE" />
          <img src="/img/aew.png" alt="AEW" />
          <img src="/img/nxt.png" alt="NXT" />
          <img src="/img/tna.png" alt="TNA" />
        </div>
      </header>

      {/* MAIN */}
      <main>
        {/* MAIN LEAGUE TABLE */}
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
                {leagueTable.map((row, index) => (
                  <tr
                    key={row.name}
                    className={
                      index === 0
                        ? "winner"
                        : index === leagueTable.length - 1
                        ? "loser"
                        : ""
                    }
                  >
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
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

        {/* MINI COMPANY TABLES */}
        {renderCompanyTable("WWE")}
        {renderCompanyTable("AEW")}
        {renderCompanyTable("NXT")}
        {renderCompanyTable("TNA")}
      </main>
    </>
  );
}

export default App;
