import { useEffect, useState, useRef } from "react";

/*---------------- APP COMPONENT ---------------- */
export default function App() {
  const [data, setData] = useState(null);
  const prevTotals = useRef({});
  const prevCompanyTotals = useRef({});

  useEffect(() => {
    fetch(`/data/scores.json?ts=${Date.now()}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ textAlign: "center" }}>Loading…</p>;

  const companies = ["WWE", "AEW", "NXT", "TNA"];

  const sum = obj =>
    Object.values(obj || {}).reduce((a, b) => a + b, 0);

  /* ---------------- DETECT LATEST PPV ---------------- */

  let latestPPV = null;
  let latestCompany = null;

  companies.forEach(company => {
    data.players.forEach(p => {
      Object.keys(p[company] || {}).forEach(ppv => {
        latestPPV = ppv;
        latestCompany = company;
      });
    });
  });

  /* ---------------- MAIN TABLE DATA ---------------- */

  const players = data.players
    .map(p => {
      const totals = {
        WWE: sum(p.WWE),
        AEW: sum(p.AEW),
        NXT: sum(p.NXT),
        TNA: sum(p.TNA)
      };

      const total = Object.values(totals).reduce((a, b) => a + b, 0);
      const prev = prevTotals.current[p.name] ?? total;
      const diff = total - prev;

      prevTotals.current[p.name] = total;

      return {
        name: p.name,
        ...totals,
        total,
        diff,
        raw: p
      };
    })
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(...players.map(p => p.total));

  /* ---------------- MOMENTUM (LAST 2 PPVs) ---------------- */

  const getMomentum = (player, company) => {
    const ppvs = Object.entries(player.raw[company] || {});
    if (ppvs.length < 2) return null;

    const lastTwo = ppvs.slice(-2).map(p => p[1]);
    const sumLastTwo = lastTwo.reduce((a, b) => a + b, 0);

    if (sumLastTwo >= 6) return "hot";
    if (sumLastTwo <= 1) return "cold";
    return null;
  };

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="logo-group left">
          <img src="/img/wwe.png" alt="WWE" />
          <img src="/img/aew.png" alt="AEW" />
        </div>

        <div className="title">
          <h1>Fantasy Wrestling League</h1>
          <p>Live standings</p>
          <div className="nav-buttons">
             <div className="nav-buttons">
          <a href="/rules.html" className="nav-btn">Rules</a>
          <a href="/archive/tna.html" className="nav-btn">TNA Archive</a>
          <a href="/archive/wwe.html" className="nav-btn">WWE Archive</a>
          <a href="/archive/aew.html" className="nav-btn">AEW Archive</a>
          <a href="/archive/nxt.html" className="nav-btn">NXT Archive</a>
        </div>
        </div>
        </div>
        

        <div className="logo-group right">
          <img src="/img/nxt.png" alt="NXT" />
          <img src="/img/tna.png" alt="TNA" />
        </div>
      </header>

      <main>
        {/* MAIN LEAGUE TABLE */}
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Player</th>
              <th>WWE</th>
              <th>AEW</th>
              <th>NXT</th>
              <th>TNA</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {players.map((p, i) => {
              const isLeader = p.total === maxTotal && maxTotal !== 0;
              const isBottom = i === players.length - 1;

              return (
                <tr
                  key={p.name}
                  className={`${isLeader ? "winner" : ""} ${isBottom ? "loser" : ""}`}
                >
                  <td>{i + 1}</td>

                  <td className="player-cell">
                    {p.name}

                    {p.diff !== 0 && (
                      <span
                        className={`change ${p.diff > 0 ? "up" : "down"}`}
                        title={`${p.diff > 0 ? "+" : ""}${p.diff} points (${latestPPV})`}
                      >
                        {p.diff > 0 ? "▲" : "▼"}
                      </span>
                    )}

                    {isLeader && <span className="icon">👑</span>}
                    {isBottom && <span className="icon">🔻</span>}
                  </td>

                  {companies.map(c => {
                    const momentum = getMomentum(p, c);
                    return (
                      <td key={c}>
                        {p[c]}
                        {momentum === "hot" && <span className="momentum hot">🔥</span>}
                        {momentum === "cold" && <span className="momentum cold">❄️</span>}
                      </td>
                    );
                  })}

                  <td><strong>{p.total}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* COMPANY TABLES */}
        {companies.map(company => {
          const maxPoints = data.ppv_max_points[company] || {};

          const ppvs = [];
          data.players.forEach(p => {
            Object.keys(p[company] || {}).forEach(ppv => {
              if (!ppvs.includes(ppv)) ppvs.push(ppv);
            });
          });

          const totals = {};
          players.forEach(p => (totals[p.name] = 0));

          return (
            <section key={company}>
              <h2>{company}</h2>

              <table>
                <thead>
                  <tr>
                    <th>PPV</th>
                    {players.map(p => (
                      <th key={p.name}>{p.name}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {ppvs.map(ppv => (
                    <tr
                      key={ppv}
                    >
                      <td>
                        {ppv} / {maxPoints[ppv]}
                        {ppv === latestPPV && company === latestCompany && (
                          <span className="latest-tag">LATEST</span>
                        )}
                      </td>

                      {players.map(p => {
                        const val = p.raw[company]?.[ppv] ?? 0;
                        totals[p.name] += val;
                        return <td key={p.name}>{val}</td>;
                      })}
                    </tr>
                  ))}

                  <tr className="company-total-row">
                    <td><strong>Total</strong></td>
                    {players.map(p => (
                      <td key={p.name}><strong>{totals[p.name]}</strong></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </section>
          );
        })}
      </main>
    </>
  );
}
