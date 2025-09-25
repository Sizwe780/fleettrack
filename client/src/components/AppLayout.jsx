export default function AppLayout({ children }) {
    return (
      <div className="min-h-screen bg-white text-charcoal font-sans">
        <header className="bg-darkBlue text-white p-4 shadow">
          <h1 className="text-xl font-bold">FleetTrack Cockpit</h1>
          <p className="text-sm text-platinum">Secure • Compliant • Role-Aware</p>
        </header>
        <main className="p-6 bg-softGrey">{children}</main>
      </div>
    );
  }