const RBACValidator = (user, requiredPermission) => {
    const roles = user.roles ?? [];
    const rolePermissions = {
      admin: ['viewTrips', 'editTrips', 'exportLogs', 'manageUsers'],
      fleet_manager: ['viewTrips', 'editTrips', 'exportLogs'],
      driver: ['viewTrips'],
      auditor: ['viewTrips', 'exportLogs'],
    };
  
    return roles.some(role => rolePermissions[role]?.includes(requiredPermission));
  };
  
  export default RBACValidator;