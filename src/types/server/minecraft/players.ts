export interface OpPlayer {
  uuid: string;
  name: string;
  level: number;
  bypassesPlayerLimit: boolean;
  avatar: string;
  render: string;
}

export interface BannedPlayer {
  uuid: string;
  name: string;
  reason: string;
  avatar: string;
  render: string;
}

export interface BannedIP {
  ip: string;
  reason: string;
}

export interface Banned {
  players: BannedPlayer[];
  ips: BannedIP[];
}

export interface WhitelistEntry {
  uuid: string;
  name: string;
  avatar: string;
  render: string;
}

export interface Whitelist {
  enabled: boolean;
  list: WhitelistEntry[];
}

export interface PlayerInfo {
  uuid: string;
  name: string;
  avatar: string;
  render: string;
}

export interface Players {
  online: number;
  max: number;
  list: PlayerInfo[];
}

export interface ServerPlayersResponse {
  success: boolean;
  online: boolean;
  online_mode: boolean;
  oped: OpPlayer[];
  banned: Banned;
  whitelist: Whitelist;
  players: Players;
}
