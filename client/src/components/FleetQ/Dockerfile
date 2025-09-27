FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install flask numpy
EXPOSE 5000
CMD ["python", "FleetCoreAPI.py"]

# Build container
docker build -t fleetcorequantumx .

# Run container
docker run -p 5000:5000 fleetcorequantumx