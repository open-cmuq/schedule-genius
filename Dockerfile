# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /schedule-genius/backend/

# Copy the current directory contents into the container at /schedule-genius/backend/app
COPY ./backend /schedule-genius/backend
COPY ./utils /schedule-genius/backend/utils

# Copy the requirements.txt file into the container
COPY ./backend/requirements.txt /schedule-genius/backend/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 6667 for FastAPI
EXPOSE 8000
# Set the PYTHONPATH environment variable
# Run the FastAPI app using Uvicorn with reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

