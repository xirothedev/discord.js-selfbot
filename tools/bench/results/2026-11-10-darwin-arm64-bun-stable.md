# Node API vs Bun API benchmark

- Runtime: Bun 1.4.4 (3bf1a06469dfb356d5563b7f6f84a3919759c66f)
- Platform: darwin arm64
- Date: 2026-11-10T08:11:19.482Z
- Rounds: 7
- Filter: all

The ratio is Bun API throughput divided by Node API throughput. `1.00x`
means no difference. A value below `1.00x` means the Bun API was slower.

| Group      | Case                 | Node API |  Bun API | Bun/Node |  Node p95 |   Bun p95 |
| ---------- | -------------------- | -------: | -------: | -------: | --------: | --------: |
| filesystem | fs.read.1k           |  46.2k/s |  43.3k/s |    0.94x |  0.030 ms |  0.025 ms |
| filesystem | fs.read.64k          |  36.7k/s |  38.6k/s |    1.05x |  0.031 ms |  0.030 ms |
| filesystem | fs.read.1m           |  13.3k/s |  15.9k/s |    1.20x |  0.147 ms |  0.090 ms |
| filesystem | fs.write.1k          |  41.8k/s |  66.8k/s |    1.60x |  0.030 ms |  0.015 ms |
| filesystem | fs.write.1m          |   6.9k/s |   2.5k/s |    0.36x |  0.163 ms |  0.586 ms |
| filesystem | fs.copy.1m           |   8.7k/s |   2.6k/s |    0.30x |  0.181 ms |  0.485 ms |
| crypto     | crypto.sha256.64b    |  6.80M/s |  7.63M/s |    1.12x |  0.000 ms |  0.000 ms |
| crypto     | crypto.sha256.64k    |  48.5k/s |  49.6k/s |    1.02x |  0.073 ms |  0.029 ms |
| crypto     | crypto.sha256.1m     |   3.1k/s |   3.1k/s |    1.00x |  0.323 ms |  0.322 ms |
| crypto     | crypto.gzip.1m       |   4.0k/s |   4.1k/s |    1.03x |  0.268 ms |  0.254 ms |
| crypto     | crypto.gunzip.1m     |   5.5k/s |   7.6k/s |    1.39x |  0.206 ms |  0.142 ms |
| crypto     | crypto.uuid          | 21.53M/s | 21.19M/s |    0.98x |  0.000 ms |  0.000 ms |
| process    | process.spawnSync    |   1.4k/s |   1.5k/s |    1.05x |  0.723 ms |  0.691 ms |
| process    | process.spawn        |   1.4k/s |   1.5k/s |    1.09x |  1.278 ms |  1.487 ms |
| process    | process.sleep.0      |    869/s |  1.02M/s | 1170.47x |  1.157 ms |  0.001 ms |
| process    | process.sleep.1      |    874/s |    877/s |    1.00x |  1.150 ms |  1.160 ms |
| glob       | glob.ts              |     70/s |    107/s |    1.52x | 14.586 ms | 10.952 ms |
| http       | http.get.1k          |  34.4k/s |  33.4k/s |    0.97x |  0.058 ms |  0.032 ms |
| http       | http.get.1m          |   4.5k/s |   4.9k/s |    1.09x |  0.250 ms |  0.217 ms |
| http       | http.get.1k.x50      |   2.6k/s |   2.7k/s |    1.04x |  0.404 ms |  0.418 ms |
| http       | http.upload.1m       |   3.2k/s |   4.0k/s |    1.25x |  0.387 ms |  0.261 ms |
| http       | http.upload.5m       |    684/s |    885/s |    1.30x |  2.285 ms |  1.266 ms |
| websocket  | ws.echo.64b          |  55.3k/s |  57.6k/s |    1.04x |  0.039 ms |  0.023 ms |
| websocket  | ws.echo.1k           |  58.0k/s |  57.1k/s |    0.98x |  0.018 ms |  0.018 ms |
| voice      | voice.aesgcm.encrypt |  2.67M/s | 125.7k/s |    0.05x |  0.000 ms |  0.010 ms |
| voice      | voice.aesgcm.decrypt |  2.94M/s | 126.0k/s |    0.04x |  0.000 ms |  0.008 ms |

## Summary

- Bun faster (at least 1.05x): 12
- Node faster (at most 0.95x): 5
- Neutral: 9
- Fastest Bun win: process.sleep.0
- Largest Bun loss: voice.aesgcm.decrypt
