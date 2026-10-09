

const ROUTE = {
     HEALTH: '/health',
     READY: '/ready',
     METRICS: '/metrics',
     STATS: '/stats',
     SUBMIT: '/submit',
     RETRY: '/retry'
}

const TIMER = {
    STUCK_AFTER_MS:60_000,
    GRACEFUL_SHUTDOWN_API_GATEWAY_STATS:10_000,
    GRACEFUL_SHUTDOWN_WORKER:25_000
}


const routerAndTimer={
    ROUTE,
    TIMER
}


export default routerAndTimer;

