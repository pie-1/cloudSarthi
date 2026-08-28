// centralized configuration for the entire application

module.exports = {

  SERVICE_TYPES: {
    AWS: 'aws',
    VERCEL: 'vercel',
    SUPABASE: 'supabase'
  },
  SEVERITY: {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info'
  },
  INCIDENT_STATUS: {
    OPEN: 'open',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved'
  },
  ALERT_CHANNELS: {
    WHATSAPP: 'whatsapp',    
    EMAIL: 'email'
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  METRIC_INTERVALS: {
    AWS: 60,        // in seconds
    VERCEL: 30,     
    SUPABASE: 30    
  },
  ANOMALY: {
    CONFIDENCE_THRESHOLD: 0.7,
    MIN_DATA_POINTS: 30,
    WINDOW_SIZE: 10  // in minutes
  }
}