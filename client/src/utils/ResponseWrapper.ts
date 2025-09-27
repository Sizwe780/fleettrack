type ErrorPayload = {
    error: string;
    code: string;
    traceId: string;
    timestamp: string;
  };
  
  type SuccessPayload<T> = {
    status: 'success';
    timestamp: string;
    data: T;
  };
  
  /**
   * ❌ Standardized error response with trace ID and timestamp
   */
  export const errorResponse = (code: string, message: string): ErrorPayload => ({
    error: message,
    code,
    traceId: `trace-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  
  /**
   * ✅ Standardized success response with timestamp
   */
  export const wrapResponse = <T>(data: T): SuccessPayload<T> => ({
    status: 'success',
    timestamp: new Date().toISOString(),
    data,
  });