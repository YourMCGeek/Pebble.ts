// TODO: Are there any other status that we need to add?

export type ServerStatus = 'starting' | 'stopping' | 'online' | 'offline';

export enum SERVER_SIGNAL {
  'START' = 'start',
  'STOP' = 'stop',
  'RESTART' = 'restart',
  'KILL' = 'kill',
}

export type ServerSignalOption = 'start' | 'stop' | 'restart' | 'kill';
