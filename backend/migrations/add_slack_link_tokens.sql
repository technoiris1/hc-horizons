CREATE TABLE slack_link_tokens (
  id VARCHAR(255) PRIMARY KEY,
  slack_user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slack_link_tokens_token ON slack_link_tokens(token);
CREATE INDEX idx_slack_link_tokens_slack_user_id ON slack_link_tokens(slack_user_id);

