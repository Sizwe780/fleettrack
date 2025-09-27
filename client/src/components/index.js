// src/components/index.js
import "./index.css"; // or "./styles/index.css"
// Core cockpit modules
export { default as SidebarLayout } from './SidebarLayout';
export { default as TripDashboard } from './TripDashboard';
export { default as TripPlanner } from './TripPlanner';
export { default as TripMap } from './TripMap';
export { default as TripHistoryViewer } from './TripHistoryViewer';
export { default as TripLogsheetViewer } from './TripLogsheetViewer';
export { default as TripTamperDetector } from './TripTamperDetector';
export { default as TripReplayWithStops } from './TripReplayWithStops';
export { default as TripStatusManager } from './TripStatusManager';
export { default as TripStatusBadge } from './TripStatusBadge';
export { default as ComplianceSummary } from './ComplianceSummary';
export { default as TripProfitCard } from './TripProfitCard';
export { default as IncidentReporter } from './IncidentReporter';
export { default as TripInsightsPanel } from './TripInsightsPanel';
export { default as TripSignatureBlock } from './TripSignatureBlock';
export { default as AuditTrailViewer } from './AuditTrailViewer';
export { default as LogsheetCanvas } from './LogsheetCanvas';

// Intelligence & analytics
export { default as Leaderboard } from './Leaderboard';
export { default as HeatMap } from './HeatMap';
export { default as FleetAnalytics } from './FleetAnalytics';

// Operational modules
export { default as ClusterMap } from './ClusterMap';
export { default as MaintenanceTracker } from './MaintenanceTracker';
export { default as OfflineTripLogger } from './OfflineTripLogger';
export { default as AdvancedRBACEditor } from './AdvancedRBACEditor';

// Platform infrastructure
export { default as NotificationCenter } from './NotificationCenter';
export { default as FleetAssistantBot } from './FleetAssistantBot';
export { default as HelpCenter } from './HelpCenter';
export { default as AboutFleetTrack } from './AboutFleetTrack';
export { default as ContactUs } from './ContactUs';
export { default as PrivacyPolicy } from './PrivacyPolicy';
export { default as TermsOfService } from './TermsOfService';
export { default as SubscriptionManager } from './SubscriptionManager';
export { default as UserProfile } from './UserProfile';

// FleetAI & Command
export { default as FleetAIConsole } from './FleetAIConsole';
export { default as FleetOpsTelemetryPanel } from './FleetOpsTelemetryPanel';
export { default as AdminConsole } from './AdminConsole';
export { default as FleetBillingDashboard } from './FleetBillingDashboard';
export { default as MobileSyncStatus } from './MobileSyncStatus';

// Export & signature
export { default as TripExportPreview } from './TripExportPreview';
export { default as TripExportSignatureBlock } from './TripExportSignatureBlock';

// Centurion Grid (corrected spelling and path)
export { default as CenturionGrid } from './CenturionGrid';