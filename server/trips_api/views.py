import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from pymongo import MongoClient

# Get MongoDB connection string from environment variables
# This variable is automatically set by Railway
MONGO_URI = 'mongodb://mongo:MQKjuIimPXmtlatpGfWhslgZMSqgWkmm@mongodb.railway.internal:27017'

# Connect to MongoDB client and select the database
# You can use your MongoDB database name here
client = MongoClient(MONGO_URI)
db = client['FleetTrack']
trips_collection = db['trips']

@csrf_exempt
def trip_list(request):
    """
    A view that handles incoming trip data via POST requests and retrieves trips via GET requests.
    """
    if request.method == 'POST':
        try:
            # Decode the incoming JSON data from the request body.
            data = json.loads(request.body)
            
            # The data sent from the React frontend
            trip_data = {
                'driverName': data.get('driverName'),
                'origin': data.get('origin'),
                'destination': data.get('destination'),
                'date': data.get('date'),
                'currentLocation': data.get('currentLocation'),
                'cycleUsed': data.get('cycleUsed'),
                'departureTime': data.get('departureTime'),
                'createdAt': datetime.now().isoformat(),
            }

            # Insert the document into the MongoDB collection
            result = trips_collection.insert_one(trip_data)

            # Return a success response.
            return JsonResponse({
                'message': 'Trip created successfully!', 
                'tripId': str(result.inserted_id) # Convert ObjectId to string
            }, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            # Handle other potential errors.
            return JsonResponse({'error': str(e)}, status=500)
            
    elif request.method == 'GET':
        try:
            # Retrieve all trips from the database and sort by creation time
            all_trips = list(trips_collection.find().sort("createdAt", -1))
            
            # Convert ObjectId to string for JSON serialization
            for trip in all_trips:
                trip['_id'] = str(trip['_id'])
            
            # Return a list of trips as a JSON response.
            return JsonResponse(all_trips, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
