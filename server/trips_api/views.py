from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import math
import datetime

# NOTE: Replace with your actual Mapbox public access token
MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2l6d2U3OCIsImEiOiJjbWZncWkwZnIwNDBtMmtxd3BkeXVtYjZzIn0.niS9m5pCbK5Kv-_On2mTcg'
MAPBOX_DIRECTIONS_API = "https://api.mapbox.com/directions/v5/mapbox/driving"
MAPBOX_GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places"

def get_coordinates(location_name):
    """
    Geocodes a location name to get its coordinates.
    """
    url = f"{MAPBOX_GEOCODING_API}/{location_name}.json"
    params = {
        'access_token': MAPBOX_ACCESS_TOKEN,
        'limit': 1
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    if data['features']:
        return data['features'][0]['geometry']['coordinates']
    return None

def reverse_geocode(lng, lat):
    """
    Reverse geocodes coordinates to get a location name.
    """
    url = f"{MAPBOX_GEOCODING_API}/{lng},{lat}.json"
    params = {
        'access_token': MAPBOX_ACCESS_TOKEN
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    if data['features']:
        return data['features'][0]['place_name']
    return f"Unnamed Location ({lat}, {lng})"

@csrf_exempt
def calculate_trip(request):
    """
    Calculates trip details, HOS, fuel stops, and rest stops.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are supported.'}, status=405)

    try:
        data = json.loads(request.body)
        origin_name = data.get('origin')
        destination_name = data.get('destination')
        cycle_used_hours = float(data.get('cycleUsed', 0))

        if not origin_name or not destination_name:
            return JsonResponse({'error': 'Origin and destination are required.'}, status=400)

        # Get coordinates for origin and destination
        origin_coords = get_coordinates(origin_name)
        destination_coords = get_coordinates(destination_name)
        if not origin_coords or not destination_coords:
            return JsonResponse({'error': 'Could not find coordinates for one or both locations.'}, status=404)

        # Get route details from Mapbox Directions API
        coords_str = f"{origin_coords[0]},{origin_coords[1]};{destination_coords[0]},{destination_coords[1]}"
        url = f"{MAPBOX_DIRECTIONS_API}/{coords_str}"
        params = {
            'access_token': MAPBOX_ACCESS_TOKEN,
            'geometries': 'geojson',
            'overview': 'full'
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        route_data = response.json()

        if not route_data.get('routes'):
            return JsonResponse({'error': 'No route found between the specified locations.'}, status=404)

        route = route_data['routes'][0]
        distance_meters = route['distance']
        duration_seconds = route['duration']

        # HOS, Fuel, and Rest Stop Calculations
        distance_miles = distance_meters * 0.000621371
        total_driving_hours = duration_seconds / 3600
        total_trip_hours = total_driving_hours + 1  # 1 hour for pickup/dropoff

        fuel_stops_needed = max(0, math.floor(distance_miles / 1000))
        rest_stops_needed = max(0, math.floor(total_driving_hours / 10)) # 10-hour rule

        # Create remarks and logs
        remarks = []
        if fuel_stops_needed > 0:
            remarks.append(f"Estimated {fuel_stops_needed} fuel stop(s) needed.")
        if rest_stops_needed > 0:
            remarks.append(f"Estimated {rest_stops_needed} rest stop(s) needed.")

        # Simulate HOS log
        current_time = datetime.datetime.strptime(data.get('departureTime'), '%H:%M')
        driver_logs = []
        
        # Add 1 hour for pickup/on duty
        driver_logs.append({
            'status': 'On Duty',
            'start_time': (current_time + datetime.timedelta(hours=0)).strftime('%H.%M'),
            'end_time': (current_time + datetime.timedelta(hours=1)).strftime('%H.%M')
        })
        current_time += datetime.timedelta(hours=1)
        
        # Driving segments
        remaining_driving_hours = total_driving_hours
        while remaining_driving_hours > 0:
            drive_segment = min(10, remaining_driving_hours)
            driver_logs.append({
                'status': 'Driving',
                'start_time': current_time.strftime('%H.%M'),
                'end_time': (current_time + datetime.timedelta(hours=drive_segment)).strftime('%H.%M')
            })
            current_time += datetime.timedelta(hours=drive_segment)
            remaining_driving_hours -= drive_segment
            
            # Add a rest break if more driving is needed and it's not the end of the trip
            if remaining_driving_hours > 0:
                rest_break = min(10, remaining_driving_hours)
                driver_logs.append({
                    'status': 'Off Duty',
                    'start_time': current_time.strftime('%H.%M'),
                    'end_time': (current_time + datetime.timedelta(hours=rest_break)).strftime('%H.%M')
                })
                current_time += datetime.timedelta(hours=rest_break)
                remaining_driving_hours -= rest_break

        # Calculate coordinates for fuel and rest stops for the map
        stop_locations = []
        if route['geometry']['coordinates']:
            total_route_points = len(route['geometry']['coordinates'])
            # Fuel Stops
            for i in range(1, fuel_stops_needed + 1):
                idx = math.floor((total_route_points / (fuel_stops_needed + 1)) * i)
                coords = route['geometry']['coordinates'][idx]
                name = reverse_geocode(coords[0], coords[1])
                stop_locations.append({'type': 'fuel', 'coordinates': coords, 'name': name})
                remarks.append(f"Fuel Stop #{i}: {name}")

            # Rest Stops
            for i in range(1, rest_stops_needed + 1):
                idx = math.floor((total_route_points / (rest_stops_needed + 1)) * i)
                coords = route['geometry']['coordinates'][idx]
                name = reverse_geocode(coords[0], coords[1])
                stop_locations.append({'type': 'rest', 'coordinates': coords, 'name': name})
                remarks.append(f"Rest Stop #{i}: {name}")

        return JsonResponse({
            'total_miles': distance_miles,
            'total_hours': total_trip_hours,
            'remarks': remarks,
            'driver_logs': driver_logs,
            'route': {
                'route': route,
                'origin': {'coordinates': origin_coords, 'name': origin_name},
                'destination': {'coordinates': destination_coords, 'name': destination_name}
            },
            'fuel_stops': [s for s in stop_locations if s['type'] == 'fuel'],
            'rest_stops': [s for s in stop_locations if s['type'] == 'rest']
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body.'}, status=400)
    except requests.exceptions.RequestException as e:
        print(f"Mapbox API error: {e}")
        return JsonResponse({'error': f'Failed to connect to map service: {e}'}, status=500)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)
