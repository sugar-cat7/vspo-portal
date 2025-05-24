FROM grafana/xk6:0.20 AS k6builder

WORKDIR /xk6

RUN xk6 build \
    --with github.com/LeonAdato/xk6-output-statsd \
    --output /xk6/out

FROM alpine:3.21.3 AS loadtest
WORKDIR /app
RUN apk add --no-cache curl jq
COPY --from=k6builder /xk6/out /usr/bin/k6
COPY ./scenarios /app
CMD ["k6", "run", "/app/script.ts"]