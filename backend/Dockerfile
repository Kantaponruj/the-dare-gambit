# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd/server/main.go

# Run stage
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

# Install ca-certificates for Firestore/Firebase interactions
RUN apk --no-cache add ca-certificates

# Expose port (Cloud Run sets PORT env var, defaulting to 8080)
EXPOSE 8080

CMD ["./main"]
