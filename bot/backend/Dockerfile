FROM golang:1.23-alpine AS builder

WORKDIR /src

COPY . .

RUN mkdir -p /src/avatar \
    && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/backend ./main.go

FROM gcr.io/distroless/base-debian12:nonroot

WORKDIR /app

COPY --from=builder /out/backend /app/backend
COPY --from=builder --chown=nonroot:nonroot /src/monkeys /app/monkeys
COPY --from=builder --chown=nonroot:nonroot /src/avatar /app/avatar

ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["/app/backend"]
