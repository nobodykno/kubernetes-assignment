

const keys = {
    REDIS_KEYS: {
        SUBMITTED: 'stats:submitted',
        COMPLETED: 'stats:completed',
        FAILED: 'stats:failed',
        TOTAL_DURATION_MS: 'stats:total_duration_ms',
        DEAD_LETTER_QUEUE: 'jobs:dead-letter'
      },
    
      METRICS: {
        WORKER: {
          JOB_PROCESSED_TOTAL: {
            NAME: 'jobs_processed_total',
            HELP: 'Total number of jobs processed successfully',
          },
      
          JOB_PROCESSING_TIME_SECONDS: {
            NAME: 'job_processing_time_seconds',
            HELP: 'Time taken to process a job, in seconds',
          },
      
          JOB_ERRORS_TOTAL: {
            NAME: 'job_errors_total',
            HELP: 'Total number of jobs that failed',
          },

          JOBS_DEAD_LETTER:{
            NAME: 'jobs_dead_lettered_total',
            HELP: 'Total number of jobs moved to the dead-letter queue'
          }
        },
    
        STATS:{
          TOTAL_JOBS_SUBMITTED: {
            NAME: 'total_jobs_submitted',
            HELP: 'Total number of jobs submitted to the gateway',
          },
      
          TOTAL_JOBS_COMPLETED: {
            NAME: 'total_jobs_completed',
            HELP: 'Total number of jobs completed successfully by all workers',
          },
      
          QUEUE_LENGTH: {
            NAME: 'queue_length',
            HELP: 'Number of jobs waiting in the Redis queue',
          },
      
          TOTAL_JOBS_FAILED: {
            NAME: 'total_jobs_failed',
            HELP: 'Total number of jobs that failed',
          },
      
          JOBS_IN_PROGRESS: {
            NAME: 'jobs_in_progress',
            HELP: 'Jobs taken by a worker but not finished yet',
          },
      
          AVG_JOB_PROCESSING_TIME_SECONDS: {
            NAME: 'avg_job_processing_time_seconds',
            HELP: 'Average processing time of successful jobs, in seconds (all-time)',
          },

          DEAD_LETTER_QUEUE_LENGTH: {
            NAME: 'dead_letter_queue_length',
            HELP: 'Current number of jobs in the dead-letter queue',
          },
        }
    
      }
}


const JOB_TYPES = ['primes', 'bcrypt', 'sort'] 



const sharedMetricsConstant = {
  keys,
  JOB_TYPES
}


export default sharedMetricsConstant;