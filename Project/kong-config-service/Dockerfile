FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    deck \
    && rm -rf /var/lib/apt/lists/*

# Install deck
RUN curl -sL https://github.com/Kong/deck/releases/download/v1.37.0/deck_1.37.0_linux_amd64.tar.gz -o deck.tar.gz && \
    tar -xf deck.tar.gz -C /tmp && \
    cp /tmp/deck /usr/local/bin/

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

COPY . /app/

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8021

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8021"]
