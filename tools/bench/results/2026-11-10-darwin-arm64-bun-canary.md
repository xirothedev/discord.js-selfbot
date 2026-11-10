# Node API vs Bun API benchmark

- Runtime: Bun 1.4.4 (2596ac5d391d47804c93a42bdbe615804aa62387)
- Platform: darwin arm64
- Date: 2026-11-10T08:12:03.997Z
- Rounds: 7
- Filter: all

The ratio is Bun API throughput divided by Node API throughput. `1.00x`
means no difference. A value below `1.00x` means the Bun API was slower.

| Group      | Case                 | Node API |  Bun API | Bun/Node |  Node p95 |   Bun p95 |
| ---------- | -------------------- | -------: | -------: | -------: | --------: | --------: |
| filesystem | fs.read.1k           |  35.2k/s |  35.1k/s |    1.00x |  0.036 ms |  0.036 ms |
| filesystem | fs.read.64k          |  28.4k/s |  23.9k/s |    0.84x |  0.062 ms |  0.121 ms |
| filesystem | fs.read.1m           |  11.1k/s |  10.8k/s |    0.98x |  0.332 ms |  0.212 ms |
| filesystem | fs.write.1k          |  33.6k/s |  51.9k/s |    1.54x |  0.037 ms |  0.021 ms |
| filesystem | fs.write.1m          |   7.0k/s |   3.6k/s |    0.52x |  0.180 ms |  0.681 ms |
| filesystem | fs.copy.1m           |   8.7k/s |   2.8k/s |    0.33x |  0.124 ms |  0.416 ms |
| crypto     | crypto.sha256.64b    |  6.97M/s |  7.62M/s |    1.09x |  0.000 ms |  0.000 ms |
| crypto     | crypto.sha256.64k    |  49.3k/s |  49.5k/s |    1.00x |  0.031 ms |  0.074 ms |
| crypto     | crypto.sha256.1m     |   3.1k/s |   3.1k/s |    1.00x |  0.322 ms |  0.323 ms |
| crypto     | crypto.gzip.1m       |   4.0k/s |   4.0k/s |    1.01x |  0.268 ms |  0.264 ms |
| crypto     | crypto.gunzip.1m     |   5.3k/s |   7.7k/s |    1.45x |  0.204 ms |  0.144 ms |
| crypto     | crypto.uuid          | 19.76M/s | 21.39M/s |    1.08x |  0.000 ms |  0.000 ms |
| process    | process.spawnSync    |   1.4k/s |   1.5k/s |    1.05x |  0.810 ms |  0.825 ms |
| process    | process.spawn        |   1.3k/s |   1.5k/s |    1.16x |  1.085 ms |  0.923 ms |
| process    | process.sleep.0      |    862/s |  1.31M/s | 1519.86x |  1.174 ms |  0.001 ms |
| process    | process.sleep.1      |    873/s |    875/s |    1.00x |  1.196 ms |  1.176 ms |
| glob       | glob.ts              |     64/s |     98/s |    1.54x | 23.423 ms | 12.836 ms |
| http       | http.get.1k          |  28.1k/s |  29.4k/s |    1.05x |  0.059 ms |  0.048 ms |
| http       | http.get.1m          |   4.6k/s |   4.6k/s |    1.00x |  0.322 ms |  0.297 ms |
| http       | http.get.1k.x50      |   2.7k/s |   2.7k/s |    1.01x |  0.616 ms |  0.563 ms |
| http       | http.upload.1m       |   3.2k/s |   3.9k/s |    1.22x |  0.427 ms |  0.343 ms |
| http       | http.upload.5m       |    585/s |    622/s |    1.06x |  2.175 ms |  1.911 ms |
| websocket  | ws.echo.64b          |  59.6k/s |  57.5k/s |    0.96x |  0.023 ms |  0.019 ms |
| websocket  | ws.echo.1k           |  54.5k/s |  53.6k/s |    0.98x |  0.029 ms |  0.021 ms |
| voice      | voice.aesgcm.encrypt |  2.61M/s |  80.7k/s |    0.03x |  0.001 ms |  0.022 ms |
| voice      | voice.aesgcm.decrypt |  2.89M/s | 120.2k/s |    0.04x |  0.000 ms |  0.009 ms |

## Summary

- Bun faster (at least 1.05x): 9
- Node faster (at most 0.95x): 5
- Neutral: 12
- Fastest Bun win: process.sleep.0
- Largest Bun loss: voice.aesgcm.encrypt
