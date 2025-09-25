export const errorResponse = (code: string, message: string) => ({
    error: message,
    code,
    traceId: `trace-${Date.now()}`
  });
  
  export const wrapResponse = (data: any) => ({
    timestamp: new Date().toISOString(),
    data,
    status: 'success'
  });