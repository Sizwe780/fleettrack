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

export default function FleetTrackConsole({ user }) {
  const { role, uid, fleetStats, envStatus, deploymentLogs, featureToggles, patchRegistry } = user;

  return (
    <SessionGuard>
      <Routes>
        <Route
          path="/"
          element={
            <SidebarLayout role={role} title="Fleet Intelligence Console">
              <TripDashboard userId={uid} />
            </SidebarLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <SidebarLayout role={role} title="Fleet Analytics">
              <FleetHealthTrends data={fleetStats?.monthlyScores} />
            </SidebarLayout>
          }
        />
        <Route
          path="/compliance"
          element={
            <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
              <SidebarLayout role={role} title="Compliance Dashboard">
                <ComplianceDashboard fleetStats={fleetStats} />
              </SidebarLayout>
            </SecureRouteWrapper>
          }
        />
        <Route
          path="/devops"
          element={
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
          }
        />
        <Route
          path="/admin"
          element={
            <SecureRouteWrapper allowedRoles={['admin']}>
              <SidebarLayout role={role} title="Admin Console">
                <AdminConsole user={user} />
              </SidebarLayout>
            </SecureRouteWrapper>
          }
        />
        <Route
          path="/audit"
          element={
            <SecureRouteWrapper allowedRoles={['admin', 'compliance']}>
              <SidebarLayout role={role} title="Audit Trail Viewer">
                <AuditViewer />
              </SidebarLayout>
            </SecureRouteWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SessionGuard>
  );
}