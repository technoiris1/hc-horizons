ALTER TABLE users ADD COLUMN slack_user_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_slack_user_id ON users(slack_user_id);


