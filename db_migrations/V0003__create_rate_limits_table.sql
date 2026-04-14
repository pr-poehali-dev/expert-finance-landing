CREATE TABLE t_p68343413_expert_finance_landi.rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_ip_created ON t_p68343413_expert_finance_landi.rate_limits (ip_address, created_at);
