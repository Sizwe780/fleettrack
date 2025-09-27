const handleSubmit = (e) => {
    e.preventDefault();
    onPublish({ moduleName, type });
    updateCredits(prev => prev + 15);
    updateAuditLogs(prev => [...prev, `Published ${moduleName} +15 credits`]);
  };