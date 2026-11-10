enum Status {
  Ready,
  Connecting,
  Reconnecting,
  Idle,
  Nearly,
  Disconnected,
  WaitingForGuilds,
  Identifying,
  Resuming,
}

export default Status;
export { Status };
