import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from .models import Trip

@csrf_exempt
def trip_list(request):
    """
    A view that handles incoming trip data via POST requests.
    """
    if request.method == 'POST':
        try:
            # Decode the incoming JSON data from the request body.
            data = json.loads(request.body)
            
            # Extract data, handling potential missing fields gracefully.
            driver_name = data.get('driverName')
            vehicle_number = data.get('vehicleNumber')
            origin = data.get('origin')
            destination = data.get('destination')
            departure_time_str = data.get('departureTime')
            current_location = data.get('currentLocation')
            cycle_used = data.get('cycleUsed')

            # Validate required fields
            if not all([driver_name, vehicle_number, origin, destination, departure_time_str, current_location, cycle_used]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            # Convert the string timestamp to a datetime object
            departure_time = datetime.fromisoformat(departure_time_str.replace('Z', '+00:00'))

            # Create and save a new Trip instance to the database.
            trip = Trip.objects.create(
                driverName=driver_name,
                vehicleNumber=vehicle_number,
                origin=origin,
                destination=destination,
                departureTime=departure_time,
                currentLocation=current_location,
                cycleUsed=cycle_used
            )
            
            # Return a success response.
            return JsonResponse({
                'message': 'Trip created successfully!', 
                'tripId': trip.id
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            # Handle other potential errors.
            return JsonResponse({'error': str(e)}, status=500)
            
    elif request.method == 'GET':
        # Retrieve all trips from the database.
        trips = list(Trip.objects.values())
        
        # Return a list of trips as a JSON response.
        return JsonResponse(trips, safe=False)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
```
eof

### Step 4: Connect the New URLs to Your Main Project

1.  Open the main URL file for your project, which is likely **`fleettrack/server/fleettrack/urls.py`**.
2.  Import `include` from `django.urls`.
3.  Add a new path to your `urlpatterns` list to include the URLs from your new app.

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add your new API endpoint here
    path('api/', include('trips_api.urls')),
]
```

### Step 5: Run Migrations

Now that your model is defined and your app is connected, you need to tell Django to create the corresponding table in your database. Make sure you are in your project's root directory (`/c/fleettrack/server`) and run:

```bash
python manage.py makemigrations trips_api
python manage.py migrate
