import { useEffect, useState, useRef } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const previousRanks = useRef({});

  useEffect(() => {
    fetch(`/data/scores.json?ts=${Date.now()}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ textAlign: "center" }}>Loading…</p>;

  const companies = ["WWE", "AEW", "NXT", "TNA"];

  const sum = obj =>
    Object.values(obj || {}).reduce((a, b) => a + b, 0);

  /* ---------------- MAIN TABLE ---------------- */

  const players = data.players
    .map(p => {
      const totals = {
        WWE: sum(p.WWE),
        AEW: sum(p.AEW),
        NXT: sum(p.NXT),
        TNA: sum(p.TNA)
      };

      return {
        name: p.name,
        ...totals,
        total: Object.values(totals).reduce((a, b) => a + b, 0),
        raw: p
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="logo-group left">
          <img src="/img/wwe.png" alt="WWE" />
          <img src="/img/aew.png" alt="AEW" />
        </div>

        <div className="title">
          <h1>League Table</h1>
          <p>Live standings • Read-only</p>
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
              let rowClass = "";
              const prev = previousRanks.current[p.name];

              if (prev !== undefined) {
                if (i < prev) rowClass = "rank-up";
                if (i > prev) rowClass = "rank-down";
              }

              previousRanks.current[p.name] = i;

              if (i === 0) rowClass += " winner";
              if (i === players.length - 1) rowClass += " loser";

              return (
                <tr key={p.name} className={rowClass.trim()}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.WWE}</td>
                  <td>{p.AEW}</td>
                  <td>{p.NXT}</td>
                  <td>{p.TNA}</td>
                  <td><strong>{p.total}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* COMPANY TABLES */}
        {companies.map(company => {
          const maxPoints = data.ppv_max_points[company] || {};

          // Collect PPVs for this company
          const ppvs = [];
          data.players.forEach(player => {
            Object.keys(player[company] || {}).forEach(ppv => {
              if (!ppvs.includes(ppv)) ppvs.push(ppv);
            });
          });

          const companyTotals = {};
          players.forEach(p => (companyTotals[p.name] = 0));

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
                  {ppvs.length === 0 ? (
                    <tr>
                      <td colSpan={players.length + 1} style={{ opacity: 0.6 }}>
                        No PPVs yet
                      </td>
                    </tr>
                  ) : (
                    <>
                      {ppvs.map(ppv => (
                        <tr key={ppv}>
                          <td>
                            {ppv}
                            <span className="ppv-max"> / {maxPoints[ppv]}</span>
                          </td>

                          {players.map(p => {
                            const val = p.raw[company]?.[ppv] ?? 0;
                            companyTotals[p.name] += val;
                            return <td key={p.name}>{val}</td>;
                          })}
                        </tr>
                      ))}

                      {/* TOTAL ROW */}
                      <tr className="company-total-row">
                        <td><strong>Total</strong></td>
                        {players.map(p => {
                          const maxTotal = Math.max(
                            ...players.map(pl => sum(pl.raw[company]))
                          );

                          const isLeader =
                            sum(p.raw[company]) === maxTotal && maxTotal !== 0;

                          return (
                            <td
                              key={p.name}
                              className={isLeader ? "company-leader" : ""}
                            >
                              <strong>{companyTotals[p.name]}</strong>
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </section>
          );
        })}
      </main>
    </>
  );
}
