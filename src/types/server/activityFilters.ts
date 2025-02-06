interface EventTypes {
  [key: string]: string[];
}

interface Actor {
  id: number;
  email: string;
}

interface EventsAndActors {
  events: Partial<EventTypes>;
  actors: Actor[];
}

export { EventTypes, Actor, EventsAndActors };
