FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim AS backend
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy frontend build output
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Create data and uploads directories
RUN mkdir -p data uploads/audio uploads/images

# Generate JWT secret at startup if not provided
ENV BACKEND_PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${BACKEND_PORT:-8080} --workers 2 'app:create_app()'"]
