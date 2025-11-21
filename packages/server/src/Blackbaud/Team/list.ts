import { SKY } from '../SKY.js';
import { toURLQueryString } from '../toURLQueryString.js';
import { Team } from './Team.js';

type Query = { school_year?: string };

type Response = {
  count: number;
  value: Team[];
};

let teams: Team[] | undefined = undefined;

export async function list(query?: Query) {
  if (!teams) {
    teams = (
      await SKY.getInstance().fetch<Response>(
        `school/v1/athletics/teams${toURLQueryString(query)}`
      )
    ).value;
    setTimeout(() => (teams = undefined), 60 * 60 * 1000);
  }
  return teams;
}
