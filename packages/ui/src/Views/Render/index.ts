import ScheduleItem from '../../SKY/ScheduleItem';
import './styles.scss';

export default async function Render() {
  document.body.classList.add('render');
  document.querySelector('.content')!.innerHTML = '';
  const args = new URLSearchParams(window.location.search);
  const params = new URLSearchParams();
  let clean = true;
  args.forEach((value, key) => {
    if (value.toString().length > 0) {
      if (key === 'start_relative' || key === 'end_relative') {
        if (/\d+$/.test(value)) {
          value = `${value} days`;
        }
        if (/^\d+/.test(value)) {
          value = `+${value}`;
        }
      }
      params.append(key, value);
    } else {
      clean = false;
    }
  });
  if (!clean) {
    window.location.search = params.toString();
  } else {
    const content = document.querySelector('.content') as HTMLDivElement;
    const title = params.get('title');
    const title_position = params.get('title_position');
    const hide_scoreless = !!params.get('hide_scoreless');
    params.delete('title');
    params.delete('title_position');
    params.delete('hide_scoreless');
    const schedule: ScheduleItem[] = await (
      await fetch('schedule?' + params.toString())
    ).json();
    let baseTitle = '';
    if (params.has('team_id')) {
      baseTitle = schedule[0].team.name;
      content.classList.add('team');
    } else {
      baseTitle = `${new Date(schedule[0].game_date).toLocaleDateString(
        'en-us',
        { month: 'long', day: 'numeric' }
      )}${
        schedule[0].game_date != schedule[schedule.length - 1].game_date
          ? ` &ndash; ${new Date(
              schedule[schedule.length - 1].game_date
            ).toLocaleDateString('en-us', {
              month: 'long',
              day: 'numeric'
            })}`
          : ''
      }`;
    }
    switch (title_position) {
      case 'prepend':
        content.innerHTML = `<h1>${title}${baseTitle}</h1>`;
        break;
      case 'replace':
        content.innerHTML = `<h1>${title}</h1>`;
        break;
      case 'append':
        content.innerHTML = `<h1>${baseTitle}${title}</h1>`;
        break;
      default:
        content.innerHTML = `<h1>${baseTitle}</h1>`;
    }
    document.head.title = content.innerText;
    const box = document.createElement('table');
    let prevDate: string;
    schedule.forEach((e: ScheduleItem) => {
      const entry = document.createElement('tr');
      entry.classList.add('entry');
      try {
        entry.innerHTML = `
                <td class="date">${
                  prevDate != e.game_date
                    ? new Date(e.game_date).toLocaleDateString('en-us', {
                        month: 'long',
                        day: 'numeric'
                      })
                    : ''
                }</td>
                <td class="team">${e.team.name}</td>
                <td class="opponent">${e.opponent}</td>
                <td class="${e.is_future ? 'start_time' : 'score'}">${
          e.is_future ? e.game_time.start : e.score
        }</td>
                <td class="${e.is_future ? 'home_or_away' : 'outcome'}">${
          e.is_future ? e.home_or_away || '' : e.outcome
        }</td>
              `;
      } catch (er) {
        console.error({ entry: e, error: er });
      }
      const score = entry.querySelector('.score') as HTMLElement;
      if (
        !hide_scoreless ||
        (hide_scoreless && score && score.innerText != '')
      ) {
        box.appendChild(entry);
        prevDate = e.game_date;
      }
    });
    content.appendChild(box);
  }
}
