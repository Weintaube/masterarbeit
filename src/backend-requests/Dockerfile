# backend-requests/Dockerfile
FROM python:3.8

WORKDIR /app

# Copy the requirements file into the container at /app
COPY ./requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port your app runs on
# EXPOSE 8002

# Command to run your application
CMD ["gunicorn", "--bind", "0.0.0.0:8002", "--access-logfile=-", "--error-logfile=-", "server:app"]
