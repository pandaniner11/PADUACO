// Returns latest TSP fund share prices from tsp.gov (official source).
export default async function handler(req, res) {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 45 * 864e5);
    const f = d => d.toISOString().slice(0, 10);
    const url = `https://www.tsp.gov/data/fund-price-history.csv?startdate=${f(start)}&enddate=${f(end)}&Lfunds=1&InvFunds=1&download=0`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (paduaco.com TSP ticker)' } });
    if (!r.ok) throw new Error('tsp.gov ' + r.status);
    const lines = (await r.text()).trim().split('\n').map(l => l.split(','));
    const head = lines[0];
    const rows = lines.slice(1).filter(x => x[0]).sort((a, b) => a[0] < b[0] ? -1 : 1).slice(-22);
    if (rows.length < 2) throw new Error('no data');
    const order = ['G Fund','F Fund','C Fund','S Fund','I Fund','L Income','L 2030','L 2035','L 2040','L 2045','L 2050','L 2055','L 2060','L 2065','L 2070','L 2075'];
    const funds = order.map(name => {
      const i = head.indexOf(name);
      if (i < 0) return null;
      const series = rows.map(x => parseFloat(x[i])).filter(n => !isNaN(n));
      const price = series[series.length - 1], prev = series[series.length - 2];
      return { name, price, change: price - prev, pct: (price - prev) / prev * 100, series };
    }).filter(Boolean);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ asOf: rows[rows.length - 1][0], funds });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
}
