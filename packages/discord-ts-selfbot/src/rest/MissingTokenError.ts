class MissingTokenError extends Error {
  override name = 'MissingTokenError';

  code = 'TOKEN_MISSING';

  retryable = false;

  constructor(
    message = 'Request to use token, but token was unavailable to the client.'
  ) {
    super(message);
    this.name = 'MissingTokenError';
  }
}

export default MissingTokenError;
export { MissingTokenError };
