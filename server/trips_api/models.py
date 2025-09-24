from django.db import models

class Trip(models.Model):
    """
    Defines the data structure for a trip.
    This model corresponds to the data sent from the React frontend.
    """
    driverName = models.CharField(max_length=100)
    vehicleNumber = models.CharField(max_length=50)
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    departureTime = models.DateTimeField()
    currentLocation = models.CharField(max_length=255)
    cycleUsed = models.DecimalField(max_digits=5, decimal_places=2)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Trip by {self.driverName} on {self.departureTime.date()}"
