import {
  BooleanString,
  DateString,
  DateTimeString,
  NumericString
} from '@battis/descriptive-types';
import { SKY } from '../SKY.js';
import { toURLQueryString } from '../toURLQueryString.js';
import { Data, Item } from './Item.js';

type Query = {
  start_relative?: NumericString;
  end_relative?: NumericString;
  start_date?: DateString<'ISO'>;
  end_date?: DateString<'ISO'>;
  school_year?: string;
  include_practice?: BooleanString;
  hide_scoreless?: BooleanString;
  team_id?: NumericString;
  last_modified?: DateTimeString<'ISO'>;
};

type Response = {
  count: number;
  value: Data[];
};

export async function get(args: Query = {}) {
  const { start_relative, end_relative, hide_scoreless, ...query } = args;
  if (start_relative) {
    query.start_date = toDate(start_relative);
  }
  if (end_relative) {
    query.end_date = toDate(end_relative);
  }
  return (
    await SKY.getInstance().fetch<Response>(
      `/school/v1/athletics/schedules${toURLQueryString(query)}`
    )
  ).value
    .map((data) => new Item(data))
    .filter(
      (item) =>
        hide_scoreless === 'false' || (item.score && item.score.length > 0)
    );
}

function toDate(relative: NumericString) {
  return new Date(Date.now() + parseInt(relative) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}
