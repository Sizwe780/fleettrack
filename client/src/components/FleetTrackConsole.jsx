import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SessionGuard from './security/SessionGuard';
import SecureRouteWrapper from './security/SecureRouteWrapper';
import SidebarLayout from './layout/SidebarLayout';

// Core Modules
import TripDashboard from './modules/TripDashboard';
import FleetHealthTrends from './modules/FleetHealthTrends';
import ComplianceDashboard from './modules/ComplianceDashboard';
import FleetTrackDevOpsConsole from './modules/FleetTrackDevOpsConsole';
import AdminConsole from './modules/AdminConsole';
import AuditViewer from './modules/AuditViewer';
import TripViewer from './modules/TripViewer';
import ComplianceArchiveDashboard from './modules/ComplianceArchiveDashboard';
import PitchDeckHighlights from './modules/PitchDeckHighlights';

// v3.0 Modules
import FleetAnalyticsDashboard from './modules/FleetAnalyticsDashboard';
import DriverHandoff from './modules/DriverHandoff';
import IncidentReportForm from './modules/IncidentReportForm';
import SentimentDashboard from './modules/SentimentDashboard';

export default function FleetTrackConsole({ user }) {
  const {
    role,
    uid,
    fleetStats,
    envStatus,
    deploymentLogs,
    featureToggles,
    patchRegistry
  } = user;

  return (
    <SessionGuard>
      <Routes>
        <Route path="/" element={
          <SidebarLayout role={role} title="Fleet Intelligence Console">
            <TripDashboard userId={uid} />
          </SidebarLayout>
        } />
        <Route path="/analytics" element={
          <SidebarLayout role={role} title="Fleet Analytics">
            <FleetHealthTrends data={fleetStats?.monthlyScores} />
          </SidebarLayout>
        } />
        <Route path="/fleet-analytics" element={
          <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
            <SidebarLayout role={role} title="Fleet Analytics Dashboard">
              <FleetAnalyticsDashboard />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/compliance" element={
          <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
            <SidebarLayout role={role} title="Compliance Dashboard">
              <ComplianceDashboard fleetStats={fleetStats} />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/compliance-archive" element={
          <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
            <SidebarLayout role={role} title="Compliance Archive">
              <ComplianceArchiveDashboard userId={uid} />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/devops" element={
          <SecureRouteWrapper allowedRoles={['admin']}>
            <SidebarLayout role={role} title="DevOps Console">
              <FleetTrackDevOpsConsole
                env={envStatus}
                deployments={deploymentLogs}
                toggles={featureToggles}
                patches={patchRegistry}
              />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/admin" element={
          <SecureRouteWrapper allowedRoles={['admin']}>
            <SidebarLayout role={role} title="Admin Console">
              <AdminConsole user={user} />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/audit" element={
          <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
            <SidebarLayout role={role} title="Audit Trail Viewer">
              <AuditViewer />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/trip/:tripId" element={
          <SidebarLayout role={role} title="Trip Viewer">
            <TripViewer />
          </SidebarLayout>
        } />
        <Route path="/pitch" element={
          <SecureRouteWrapper allowedRoles={['admin']}>
            <SidebarLayout role={role} title="Pitch Deck Highlights">
              <PitchDeckHighlights />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/driver-handoff" element={
          <SecureRouteWrapper allowedRoles={['driver', 'admin']}>
            <SidebarLayout role={role} title="Driver Handoff">
              <DriverHandoff />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/incident-report" element={
          <SecureRouteWrapper allowedRoles={['driver', 'admin']}>
            <SidebarLayout role={role} title="Incident Report">
              <IncidentReportForm />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="/sentiment" element={
          <SecureRouteWrapper allowedRoles={['admin']}>
            <SidebarLayout role={role} title="Sentiment Dashboard">
              <SentimentDashboard />
            </SidebarLayout>
          </SecureRouteWrapper>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SessionGuard>
  );
}