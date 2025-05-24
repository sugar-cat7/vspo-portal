# Load Testing with K6

This directory contains load testing configurations and scripts using K6.

## Usage

```bash
docker build -t vspo-portal-loadtest-k6:latest .
docker run -it vspo-portal-loadtest-k6:latest
```

## Load Test Configuration Examples

### 1-minute test (targeting max 200 RPS, 5-second warm-up)

```bash
# default scenario (all 15 endpoints × VU count)
docker run -it \
  -e USE_STAGES=true \
  -e RAMP_UP_TARGET=5 \
  -e RAMP_UP_DURATION=5s \
  -e PEAK_TARGET=40 \
  -e PEAK_DURATION=50s \
  -e RAMP_DOWN_TARGET=0 \
  -e RAMP_DOWN_DURATION=5s \
  -e TARGET_HOST=http://localhost:3000 \
  -e SCENARIO_NAME=default \
  -e CF_ACCESS_CLIENT_ID=your_client_id \
  -e CF_ACCESS_CLIENT_SECRET=your_client_secret \
  vspo-portal-loadtest-k6:latest
```

## RPS Guidelines (assuming 200ms response time)

| Scenario | Requests/execution | Recommended VUs | Expected RPS |
|----------|-------------------|-----------------|--------------|
| default  | 15 requests       | 40 VUs          | ~200 RPS     |
