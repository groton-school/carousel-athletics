import { list } from './list.js';

export async function get(team_id: string | number) {
  return (await list()).filter((t) => t.id == team_id).shift();
}
