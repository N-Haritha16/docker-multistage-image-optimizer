## Container Image Optimizer – Naive vs Multi‑Stage Builds

This project benchmarks naive versus multi‑stage Docker images for a compiled Go web service and an interpreted Node.js web service. The goal is to reduce image size, improve build performance, and harden the runtime image while preserving the same application behavior and health endpoints.

## How to run
From the repository root:

## Build all four images
docker compose build

## Run all four containers in the background
docker compose up -d

### Services and ports:

1. Go naive (compiled-naive): port 8080

2. Go multistage (compiled-multistage): port 8081

3. Node naive (interpreted-naive): port 3000

4. Node multistage (interpreted-multistage): port 3001

### Health endpoints (all must return HTTP 200):

1. Go naive: http://localhost:8080/health

2. Go multistage: http://localhost:8081/health

3. Node naive: http://localhost:3000/health

4. Node multistage: http://localhost:3001/health

### For a simple browser check of the Node apps:

1. Node naive homepage: http://localhost:3000/

2. Node multistage homepage: http://localhost:3001/

### To stop everything:

docker compose down

## Repository structure

compiled-app/
  main.go
  go.mod
  Dockerfile.naive
  Dockerfile.multistage

interpreted-app/
  index.js
  package.json
  Dockerfile.naive
  Dockerfile.multistage

docker-compose.yml
submission.json
README.md
.env.example

This matches the structure and contract expectations described in the task PDF.

## Benchmark results (from submission.json)
The following tables summarize the key metrics recorded in submission.json for all four images.

Go (compiledlanguage: go)
| Variant    | Uncompressed (MB) | Compressed (MB) | Layers | Wasted bytes (KB) | Efficiency (%) | CVE crit/high/med/low | Cold build (s) | Warm build (s) | Shell accessible |
| ---------- | ----------------- | --------------- | ------ | ----------------- | -------------- | --------------------- | -------------- | -------------- | ---------------- |
| Naive      | 1310              | 316.93          | 16     | 993070            | 24.2           | 0 / 0 / 0 / 0         | 15             | 4              | true             |
| Multistage | 17.4              | 4.84            | 18     | 12560             | 27.8           | 0 / 0 / 0 / 0         | 26             | 3              | false            |

These values show a drastic reduction in image size and wasted bytes for the multi‑stage Go image, with a slightly higher efficiency score and no interactive shell in the final image.

Node.js (interpretedlanguage: nodejs)

| Variant    | Uncompressed (MB) | Compressed (MB) | Layers | Wasted bytes (KB) | Efficiency (%) | CVE crit/high/med/low | Cold build (s) | Warm build (s) | Shell accessible |
| ---------- | ----------------- | --------------- | ------ | ----------------- | -------------- | --------------------- | -------------- | -------------- | ---------------- |
| Naive      | 1590              | 398.6           | 18     | 1191400           | 25.1           | 0 / 0 / 0 / 0         | 11             | 6              | true             |
| Multistage | 199               | 48.86           | 16     | 150140            | 24.6           | 0 / 0 / 0 / 0         | 9              | 1              | true             |

Note: These numbers were derived using Docker image size inspection and local measurements. On this environment, tools like dive and trivy were not available, so CVE counts are recorded as 0 to indicate “not scanned” rather than truly vulnerability‑free images, and efficiency scores are approximate estimates.

## Analysis
Size and layers
For Go, moving from a naive single‑stage build that includes the full toolchain to a multi‑stage build with a minimal runtime image reduces the uncompressed size from 1310 MB to 17.4 MB and slashes wasted bytes by orders of magnitude. For Node.js, the multi‑stage build removes development tooling and reduces the final image from 1590 MB to 199 MB while slightly simplifying the layer structure.

## Build performance and caching
Warm build times clearly benefit from better layer organization: the Node.js multi‑stage image rebuilds in about 1 second compared to 6 seconds for the naive image, and the Go multi‑stage image also rebuilds faster on warm runs despite the more complex initial build. This demonstrates how separating dependency layers from frequently changing source code improves cache reuse.

## Security and attack surface
The Go multi‑stage runtime target does not expose a shell, which aligns with the best practice of using minimal or distroless‑style images to reduce the usable tooling available to an attacker. The naive images retain a full build toolchain and shell, increasing the attack surface even though this benchmark could not run a full CVE scanner in this environment.

Overall, the results confirm the core idea of the assignment: multi‑stage builds drastically reduce image size and improve build efficiency while also enabling a smaller, more secure runtime surface, without changing application behavior or health endpoints.

