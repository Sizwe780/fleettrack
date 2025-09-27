export const purchaseModule = async (studentId, moduleId, cost) => {
    // Simulate credit deduction and log transaction
    return {
      success: true,
      newBalance: 100 - cost,
      auditLog: `Student ${studentId} purchased ${moduleId} for ${cost} credits`
    };
  };