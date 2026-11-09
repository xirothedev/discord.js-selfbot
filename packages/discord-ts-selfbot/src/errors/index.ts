import DJSError from './DJSError';
import Messages from './Messages';
// Re-export DJSError and attach Messages for side-effect registration.

const result: any = DJSError;
result.Messages = Messages;

export default result;
export { result };
