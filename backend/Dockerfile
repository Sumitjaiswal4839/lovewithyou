FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o dating-backend main.go

FROM alpine:latest

WORKDIR /app

# Install CA certificates for HTTPS requests (e.g., Supabase)
RUN apk --no-cache add ca-certificates

COPY --from=builder /app/dating-backend .

# Copy environment variables or config if required
# COPY .env .env

EXPOSE 8080

CMD ["./dating-backend"]
