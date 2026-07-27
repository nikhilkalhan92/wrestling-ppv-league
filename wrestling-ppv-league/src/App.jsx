import { useEffect, useState } from "react";
import "./style.css";

function App() {
  const [players, setPlayers] = useState([]);
  const [maxPoints, setMaxPoints] = useState({});
  const companyOrder = ["WWE", "AEW", "NXT", "TNA"];

  useEffect(() => {
    const loadScores = () => {
      fetch("/data/scores.json")
        .then((res) => res.json())
        .then((data) => {
          setPlayers(data.players || []);
          setMaxPoints(data.ppv_max_points || {});
        })
        .catch((err) => console.error("JSON Load Error:", err));
    };

    loadScores();
    const intervalId = window.setInterval(loadScores, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Prevent blank screen
  if (!players.length) {
    return (
      <div className="loading-state">
        <h2>Loading your league standings…</h2>
        <p>We’re grabbing the latest scores and PPV updates.</p>
      </div>
    );
  }

  const orderedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));

  // Calculate totals properly
  const leagueTable = orderedPlayers.map((p) => {
    const wweTotal = Object.values(p.WWE || {}).reduce((a, b) => a + b, 0);
    const aewTotal = Object.values(p.AEW || {}).reduce((a, b) => a + b, 0);
    const tnaTotal = Object.values(p.TNA || {}).reduce((a, b) => a + b, 0);
    const nxtTotal = Object.values(p.NXT || {}).reduce((a, b) => a + b, 0);

    const maxTotal = companyOrder.reduce((sum, company) => {
      const companyPPVs = maxPoints[company] || {};
      return sum + Object.values(companyPPVs).reduce((a, b) => a + b, 0);
    }, 0);

    return {
      name: p.name,
      wwe: wweTotal,
      aew: aewTotal,
      nxt: nxtTotal,
      tna: tnaTotal,
      total: wweTotal + aewTotal + nxtTotal + tnaTotal,
      maxTotal,
      raw: p,
    };
  });

  // Sort leaderboard
  leagueTable.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return a.name.localeCompare(b.name);
  });

  const companyMaxes = companyOrder.reduce((acc, company) => {
    acc[company] = Object.values(maxPoints[company] || {}).reduce((a, b) => a + b, 0);
    return acc;
  }, {});

  const latestPPVUpdates = companyOrder
    .flatMap((company) => {
      const companyPPVs = maxPoints[company] || {};
      const ppvNames = Object.keys(companyPPVs);

      if (!ppvNames.length) return [];

      return ppvNames
        .slice(-5)
        .reverse()
        .map((ppv) => ({
          company,
          ppv,
          max: companyPPVs[ppv],
          entries: orderedPlayers.map((p) => ({
            name: p.name,
            score: p[company]?.[ppv] ?? 0,
            max: companyPPVs[ppv],
          })),
        }));
    })
    .slice(0, 8);

  // Mini Table Builder
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
                {orderedPlayers.map((p) => (
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

                  {orderedPlayers.map((p) => (
                    <td key={p.name}>{p[company]?.[ppv] ?? 0}</td>
                  ))}
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="company-total-row">
                <td>
                  <strong>Total</strong>
                </td>

                {orderedPlayers.map((p) => {
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
        <p>Follow the action, see who is leading, and track the latest PPV results.</p>

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

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="card-header">
              <h2>Latest PPV Updates</h2>
              <span>All latest results</span>
            </div>

            <div className="ppv-update-list">
              {latestPPVUpdates.length ? (
                latestPPVUpdates.map((update) => (
                  <article
                    key={`${update.company}-${update.ppv}`}
                    className="ppv-update-item"
                  >
                    <div className="ppv-update-top">
                      <strong>{update.company}</strong>
                      <span>{update.ppv}</span>
                      <span className="ppv-max">{update.max} pts</span>
                    </div>

                    <ul className="ppv-player-list">
                      {update.entries.map((entry) => (
                        <li key={entry.name}>
                          <span>{entry.name}</span>
                          <span>
                            {entry.score}/{entry.max}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))
              ) : (
                <p className="empty-state">No PPVs have been added yet.</p>
              )}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-header">
              <h2>Scores vs Total</h2>
              <span>Company breakdown</span>
            </div>

            <div className="score-progress-list">
              {leagueTable.map((row) => {
                const percent = row.maxTotal
                  ? Math.round((row.total / row.maxTotal) * 100)
                  : 0;

                return (
                  <div key={row.name} className="score-progress-item">
                    <div className="score-progress-top">
                      <span>{row.name}</span>
                      <strong>
                        {row.total}/{row.maxTotal}
                      </strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>

                    <span className="progress-label">{percent}% of possible points</span>

                    <div className="company-breakdown">
                      {companyOrder.map((company) => {
                        const companyCurrent = Object.values(row.raw?.[company] || {}).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const companyMax = Math.max(companyCurrent, companyMaxes[company] || 0);

                        return (
                          <div key={`${row.name}-${company}`} className="company-breakdown-item">
                            <span>{company}</span>
                            <strong>
                              {companyCurrent}/{companyMax}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
