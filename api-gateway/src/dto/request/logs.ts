
/**
 * DTO for  logs
 */



export interface ILog {
    action: string;
    module: string;
    message?: string;
    data?: unknown;
  
    errorName?: string;
    stack?: string;
  
    method?: string;
    url?: string;
    ip?: string;
  }
  