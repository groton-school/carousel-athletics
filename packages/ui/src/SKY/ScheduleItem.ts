import Team from './Team';

type BlackbaudID = string | number;
type ISODateTimeString = string;
type TimeString = string;
type DurationString = string;
type URLString = string;

type Base = {
  id: BlackbaudID;
  alumni: boolean;
  cancelled: boolean;
  created: ISODateTimeString;
  departure_location: string;
  departure_time: TimeString;
  description: string;
  directions: string;
  dismissal_time: TimeString;
  end_time: TimeString;
  end_time_span: DurationString;
  title: string;
  faculty: boolean;
  game_date: ISODateTimeString;
  game_time: {
    date: ISODateTimeString;
    start: TimeString;
    end: TimeString;
    duration: DurationString;
  };
  highlight_id: BlackbaudID;
  home_or_away: string;
  invitational: boolean;
  last_modified: ISODateTimeString;
  league: boolean;
  location: string;
  map_url: URLString;
  meet: BlackbaudID;
  opponents?: [
    {
      id: BlackbaudID;
      name: string;
      score: string;
      win_loss: string;
      opponent_score: string;
      team_score: string;
    }
  ];
  pickup_time: TimeString;
  playoff: boolean;
  practice: boolean;
  published: boolean;
  require_dinner: boolean;
  require_lunch: boolean;
  rescheduled: boolean;
  rescheduled_date: ISODateTimeString;
  rescheduled_note: string;
  room_id: BlackbaudID;
  schedule_type: BlackbaudID;
  scrimmage: boolean;
  section_id: BlackbaudID;
  show_details: boolean;
  show_directions: boolean;
  show_versus: boolean;
  start_time: TimeString;
  team_id: BlackbaudID;
  time: TimeString;
  tournament: boolean;
  uniform_color: string;
};

type ScheduleItem = Base & {
  opponent: string;
  score: string;
  outcome: string;
  team: Team;
  is_future: boolean;
};
export default ScheduleItem;
