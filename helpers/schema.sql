CREATE TABLE token (
  token_hash VARCHAR(64) NOT NULL,
  client_id VARCHAR(16) NOT NULL,
  username VARCHAR(16) NOT NULL,
  expiration INT(64) NOT NULL,
  PRIMARY KEY (`token_hash`),
  KEY username (client_id),
  KEY target (username)
);

CREATE TABLE metadata (
  client_id VARCHAR(16) NOT NULL,
  username VARCHAR(16) NOT NULL,
  metadata TEXT NOT NULL,
  PRIMARY KEY (`client_id`,`username`),
  KEY username (client_id),
  KEY target (username)
);
