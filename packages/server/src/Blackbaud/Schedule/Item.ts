import { DateTimeString, URLString } from '@battis/descriptive-types';
import { Team } from '../index.js';

export type Data = {
  id: number;
  alumni: boolean;
  cancelled: boolean;
  created: DateTimeString<'iSO'>;
  departure_location: string;
  departure_time: DateTimeString;
  description: string;
  directions: string;
  dismissal_time: DateTimeString;
  end_time: DateTimeString;
  end_time_span: DateTimeString;
  event_time: {
    date: DateTimeString<'ISO'>;
    start: DateTimeString;
    end: DateTimeString;
    duration: DateTimeString;
  };
  title: string;
  faculty: boolean;
  game_date: DateTimeString<'ISO'>;
  game_time: {
    date: DateTimeString<'ISO'>;
    start: DateTimeString;
    end: DateTimeString;
    duration: DateTimeString;
  };
  highlight_id: number;
  home_or_away: string;
  invitational: boolean;
  last_modified: DateTimeString<'ISO'>;
  league: boolean;
  location: string;
  location_address: {
    address_line1: string;
    address_line2: string;
    address_line3: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    province: string;
  };
  map_url: URLString;
  meet: number;
  opponents?: [
    {
      id: number;
      name?: string;
      score?: string;
      win_loss?: string;
      opponent_score?: string;
      team_score?: string;
    }
  ];
  pickup_time: DateTimeString;
  playoff: boolean;
  practice: boolean;
  published: boolean;
  require_dinner: boolean;
  require_lunch: boolean;
  rescheduled: boolean;
  rescheduled_date: DateTimeString<'ISO'>;
  rescheduled_note: string;
  room_id: number;
  schedule_type: number;
  scrimmage?: boolean;
  section_id: number;
  show_details: boolean;
  show_directions: boolean;
  show_versus: boolean;
  start_time: DateTimeString;
  team_id: number;
  time: DateTimeString;
  tournament: boolean;
  uniform_color: string;
};

export class Item {
  public constructor(private data: Data) {}

  public get uuid() {
    return `https://api.sky.blackbaud.com/school/v1/athletics/schedules/${this.data.id}`;
  }

  private _future: boolean | null = null;
  public get future() {
    if (this._future === null) {
      this._future = new Date(this.end).getTime() > Date.now();
    }
    return this._future;
  }

  public get rescheduled() {
    return !!this.data.rescheduled;
  }

  private _start: Date | null = null;
  public get start() {
    if (this._start === null) {
      const stringified_date = `${new Date(
        this.data.game_time['date']
      ).toLocaleDateString('en', {
        dateStyle: 'medium'
      })} ${this.data.game_time['start']}`;
      this._start = new Date(stringified_date);
    }
    return this._start;
  }

  private _end: Date | null = null;
  public get end() {
    if (this._end === null) {
      const stringified_date = `${new Date(
        this.data.game_time['date']
      ).toLocaleDateString('en', {
        dateStyle: 'medium'
      })} ${this.data.game_time['end']}`;
      this._end = new Date(stringified_date);
    }
    return this._end;
  }

  public get date() {
    return this.start;
  }

  public get last_modified() {
    return new Date(this.data.last_modified);
  }

  public get home_or_away() {
    return this.data.home_or_away;
  }

  public get team_name() {
    return Team.get(this.data.team_id).then((team) => team?.name);
  }

  public get title() {
    return (
      this.data.title ||
      (this.data.opponents || [])
        .map((opponent) => opponent.name)
        .filter((name) => name && name.length > 0)
        .join(', ')
    );
  }

  public get opponents() {
    return this.data.opponents?.map((opponent) => opponent.name).join(', ');
  }

  public get score() {
    return this.data.opponents
      ? (this.data.opponents || [])
          .map((opponent) => opponent.score)
          .filter((score) => score && score.length > 0)
          .join(', ')
      : '';
  }

  public get outcome() {
    return this.data.scrimmage
      ? 'Scrimmage'
      : (this.data.opponents || [])
          .map((opponent) => opponent.win_loss)
          .filter((win_loss) => win_loss && win_loss.length > 0)
          .join(', ');
  }
}
