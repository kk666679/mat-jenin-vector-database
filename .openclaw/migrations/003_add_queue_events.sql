-- Add queue events table

CREATE TABLE IF NOT EXISTS queue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queue_events_job_id ON queue_events(job_id);
CREATE INDEX idx_queue_events_type ON queue_events(type);
CREATE INDEX idx_queue_events_timestamp ON queue_events(timestamp);
