const TripDetails = ({ trip }) => {
    if (!trip) {
      return (
        <div className="text-center p-10 text-gray-600">
          Select a trip from <strong>"My Trips"</strong> to see the details.
        </div>
      );
    }
  
    const { analysis = {}, routeData } = trip;
    const { profitability, ifta, remarks, dailyLogs } = analysis;
  
    return (
      <div className="space-y-6">
        <TripHeader trip={trip} />
        <TripMap routeData={routeData} />
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profitability ? (
            <ProfitabilityCard data={profitability} />
          ) : (
            <PlaceholderCard title="Profitability" />
          )}
  
          {ifta ? (
            <IftaCard data={ifta} />
          ) : (
            <PlaceholderCard title="IFTA Summary" />
          )}
  
          <DocumentsCard tripId={trip.id} />
        </div>
  
        {remarks ? (
          <HosComplianceCard remarks={remarks} />
        ) : (
          <PlaceholderCard title="HOS Compliance" />
        )}
  
        {Array.isArray(dailyLogs) && dailyLogs.length > 0 ? (
          <div className="space-y-4">
            {dailyLogs.map((log, index) => (
              <EldLogVisualizer key={index} dailyLog={log} />
            ))}
          </div>
        ) : (
          <PlaceholderCard title="ELD Logs" />
        )}
      </div>
    );
  };