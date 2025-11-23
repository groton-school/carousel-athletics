import { Request } from 'express';
import { Feed } from 'feed';
import { Schedule, Team } from './Blackbaud/index.js';

export async function feedFromRequest(req: Request) {
  const { title, title_position, team_id, ...params } = req.query;
  const schedule = await Schedule.get(params);

  const base_title = team_id
    ? (await Team.get(team_id.toString()))!.name
    : schedule.length
      ? `${schedule[0].date} &ndash; ${schedule[schedule.length - 1].date}`
      : 'Groton Athletics';
  let actual_title = title?.toString() || base_title;
  switch (title_position) {
    case 'prepend':
      actual_title = `${title}${base_title}`;
      break;
    case 'replace':
      break;
    case 'append':
      actual_title = `${base_title}${title}`;
      break;
  }
  const feed = new Feed({
    id: 'https://groton.myschoolapp.com/app/extracurricular?svcid=edu',
    link: 'https://groton.myschoolapp.com/app/extracurricular?svcid=edu',
    title: actual_title,
    description: 'Live updating feed of athletics information from myGroton',
    language: 'en',
    updated: new Date(),
    copyright: `All rights reserved ${new Date().toLocaleDateString('en', { year: 'numeric' })}, Groton School`
  });
  for (const item of schedule) {
    if (item.rescheduled === false) {
      feed.addItem({
        date: item.last_modified,
        published: item.date,
        copyright: item.future ? item.home_or_away : item.outcome,
        author: [
          {
            name: await item.team_name
          }
        ],
        category: [
          {
            name: await item.team_name,
            term: await item.team_name
          }
        ],
        title: item.future ? item.start.toLocaleString() : item.score,
        content: item.future ? item.home_or_away : item.outcome,
        id: item.uuid,
        link: item.uuid
      });
    }
  }
  return feed;
}
