export default function FleetTrackDevOpsConsole({ env, deployments, toggles, patches }) {
    return (
      <div className="space-y-6">
        <EnvironmentHealthCheck env={env} />
        <DeploymentAuditLog logs={deployments} />
        <FeatureToggleConsole toggles={toggles} updateToggle={() => {}} />
        <OpsCertPatchViewer patches={patches} />
      </div>
    );
  }