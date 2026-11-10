import DJSError from "./DJSError";
import Messages from "./Messages";
// Re-export DJSError and attach Messages for side-effect registration.

const result = Object.assign(DJSError, { Messages });

export default result;
export { result };
