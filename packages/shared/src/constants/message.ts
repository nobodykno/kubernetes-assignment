/**
 * All magic string centralized at one place
 */

const MESSAGES = {
  CORS: {
    CORS_ERROR: 'Origin not allowed by CORS',
  },
  SERVICE: {
    STATS: 'Stats Service',
    API_GATEWAY: 'Api Gateway',
    WORKER: 'Worker'
  },
  MESSAGES:{
    API_GATE_WAY:{
       REDIS_TRANSACTION_ABORTED:   'Redis transaction was aborted',
       NOT_FOUND_ID:'Id not Found',
       REDIS_NOT_AVAILABLE: 'Redis unavailable',
       JOB_POSTED_SUCCESSFULLY: 'Job posted Successfully',
       JOB_POSTED_FAILED: 'Job posted failed',
       JOB_STATUS_FETCHED_SUCCESSFULLY: 'Job Status fetched successfully',
       FAILED_JOB_STATUS_FETCHED: 'Failed to fetch job status',
       GRACEFUL_SHUTDOWN_SUCCESS_ERROR: 'System not properly shutdown',
       JOB_RETRY_SUCCESS: 'Job retry successfully',
       JOB_RETRY_FAILED: 'Job retry failed'
    },
    STATS:{
       REDIS_STATS_ERROR: 'Could not read stats from Redis'
    },
    WORKER:{

    },

    COMMON: {
      API_NOT_READY:'Api is not ready',
      GRACEFUL_SHUT_DOWN_TIMEOUT: 'Graceful shutdown timed out'
    }
  },

  COMMON: {
    SERVER_ERROR: 'Something went wrong!',

    T00_MANY_REQUEST: 'Too many requests. Please try again later.',

    VALIDATION_ERROR: 'Validation failed!'
  },

  ACTION: {
    CORS:'CORS',
    UNHANDLED_ERROR: 'Unhandled Error',
    JOB_POST:'Job Created based on type',
    JOB_STATUS: 'Job Status fetched',
    GRACEFUL_SHUTDOWN: 'Graceful shutdown',
    JOB_RETRY: 'Job Retry',
    READY:'Check route ready'

  },

  MODULE:{
    GLOBAL_ERROR: 'Global error',
  },

  
}

export default MESSAGES;
