from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime

class TripPlannerView(APIView):
    """
    Handles trip planning logic, including route calculation and ELD log generation.
    This view now dynamically generates a response based on the input data.
    """
    def post(self, request, *args, **kwargs):
        origin = request.data.get('origin')
        destination = request.data.get('destination')
        current_cycle_used = request.data.get('cycleUsed', 0)

        if not all([origin, destination]):
            return Response({"error": "Origin and destination are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Simulate trip data. In a real-world app, this would be from a mapping API.
        # Let's assume a fixed distance per trip for this example.
        base_distance = 1500  # miles
        distance_per_trip = abs(hash(origin) - hash(destination)) % 2000 + 500  # A pseudo-random distance
        distance_miles = distance_per_trip + base_distance
        
        # Calculate trip details based on HOS rules and assumptions
        trip_details = self.calculate_trip_details(distance_miles, current_cycle_used)
        
        return Response(trip_details, status=status.HTTP_200_OK)

    def calculate_trip_details(self, distance_miles, current_cycle_used):
        # HOS rules: 11 hours driving, 14 hours on-duty, 10 hours off-duty
        # Assumptions: 60 mph average speed, 1 hour for each on-duty activity
        
        # Total driving hours
        total_driving_hours = distance_miles / 60
        
        # Calculate the number of driving days and required rest breaks
        hours_per_day = 11  # Max driving hours per day
        off_duty_break = 10 # Required off-duty rest
        on_duty_activities_per_day = 2 # e.g., fueling, pre-trip inspection
        on_duty_hours_per_day = on_duty_activities_per_day # 1 hour per activity
        
        # Total hours on duty
        total_on_duty_hours = total_driving_hours + (total_driving_hours / hours_per_day) * on_duty_hours_per_day
        
        # Account for the 70 hours / 8 days rule
        # A simple check to see if the trip exceeds the remaining cycle hours
        remaining_cycle_hours = 70 - float(current_cycle_used)
        if total_driving_hours >= remaining_cycle_hours:
            # Add an extra rest day to reset the cycle
            total_driving_hours += off_duty_break

        num_driving_days = int(total_driving_hours / hours_per_day) + 1
        
        route_info = {
            "distance_miles": round(distance_miles, 2),
            "duration_hours": round(total_driving_hours + (num_driving_days * off_duty_break), 2),
            "stops": []
        }
        
        # Generate stops: 10-hour rest after every 11 hours of driving
        for i in range(num_driving_days - 1):
            route_info['stops'].append({
                "type": "rest",
                "location": f"Rest Stop {i+1} at a convenient location.",
                "duration": 10,
                "notes": "Mandatory 10-hour rest break."
            })
            if (i+1) % 2 == 0:  # Add a fuel stop every two driving periods (simulating every ~1000 miles)
                route_info['stops'].append({
                    "type": "fuel",
                    "location": f"Fuel Stop {i+1} along the route.",
                    "notes": "Fueling and inspection."
                })

        # Generate daily logs
        logs = []
        today = datetime.date.today()
        driving_hours_left = total_driving_hours
        
        for i in range(num_driving_days):
            day_log = {
                "date": (today + datetime.timedelta(days=i)).isoformat(),
                "log_entries": []
            }
            
            day_log["log_entries"].append({"time": "00:00", "status": "Sleeper Berth"})
            
            # Start driving after a rest period
            start_driving = datetime.datetime.strptime("07:00", "%H:%M")
            day_log["log_entries"].append({"time": start_driving.strftime("%H:%M"), "status": "Driving"})
            
            daily_driving = min(driving_hours_left, hours_per_day)
            
            # After 5 hours of driving, take a short break
            break_time = start_driving + datetime.timedelta(hours=5)
            day_log["log_entries"].append({"time": break_time.strftime("%H:%M"), "status": "Off Duty"})
            
            # Resume driving for the remaining hours
            resume_driving = break_time + datetime.timedelta(hours=0.5)
            day_log["log_entries"].append({"time": resume_driving.strftime("%H:%M"), "status": "Driving"})
            
            driving_end = resume_driving + datetime.timedelta(hours=daily_driving - 5)
            day_log["log_entries"].append({"time": driving_end.strftime("%H:%M"), "status": "On Duty"})
            
            # End the day with a mandatory sleeper berth period
            end_of_day = driving_end + datetime.timedelta(hours=1)
            day_log["log_entries"].append({"time": end_of_day.strftime("%H:%M"), "status": "Sleeper Berth"})
            
            driving_hours_left -= daily_driving
            logs.append(day_log)
            
        return {
            "route": route_info,
            "logs": logs
        }
