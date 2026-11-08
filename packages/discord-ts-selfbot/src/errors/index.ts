// Re-export DJSError and attach Messages for side-effect registration.
const DJSError = require('./DJSError');
const Messages = require('./Messages');

const result = DJSError;
result.Messages = Messages;

export = result;
