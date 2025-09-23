export const enableComplianceMode = (trip) => {
    return {
      ...trip,
      complianceMode: true,
      auditTrailEnabled: true,
      exportIncludesSignature: true,
      RBACEnforced: true,
    };
  };