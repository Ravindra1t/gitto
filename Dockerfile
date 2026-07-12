# Use the official Python 3.12 slim image as the base
FROM python:3.12-slim

# Install system dependencies:
# 1. curl: Required to fetch the NodeSource Node.js setup script.
# 2. nodejs: Required because the Model Context Protocol (MCP) server for GitHub runs on Node.js and is executed via 'npx'.
# 3. git: Often useful if tools or dependencies require cloning.
# We run clean up commands in the same layer to minimize image size.
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy requirements file first to take advantage of Docker caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Run Python with unbuffered output so container logs flush immediately to stdout/stderr
CMD ["python", "-u", "analyzer.py"]
