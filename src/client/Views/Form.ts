import Authorize from '../Authorize';
import Deauthorize from '../Deauthorize';
import * as Options from '../Options';
import Team from '../SKY/Team';
import 'bootstrap/dist/css/bootstrap.min.css';

export default async function Form() {
  if (await (await fetch(`${process.env.URL}/ready`)).json()) {
    Options.add({ title: 'Deauthorize', handler: Deauthorize });

    function params() {
      const form = document.querySelector('form') as HTMLFormElement;
      const data = new FormData(form);
      const params = new URLSearchParams(data as unknown as []);
      return params.toString();
    }

    const ical = document.querySelector('#ical') as HTMLButtonElement;
    ical.addEventListener('click', () => {
      window.location.href = `${process.env.URL}/ical?` + params();
    });

    const teams = await (await fetch(`${process.env.URL}/teams`)).json();
    const sel: HTMLSelectElement | null = document.querySelector('select');
    const sports: Record<string, Team[]> = {};
    teams.forEach((team: Team) => {
      if (!sports[team.sport.name]) {
        sports[team.sport.name] = [];
      }
      sports[team.sport.name].push(team);
    });
    for (const sport in sports) {
      const grp = document.createElement('optgroup');
      grp.label = sport;
      sports[sport].forEach((team) => {
        const opt = document.createElement('option');
        opt.value = team.id.toString();
        opt.innerText = team.name;
        grp.appendChild(opt);
      });
      sel?.appendChild(grp);
    }
    sel?.closest('form')?.classList.add('ready');
  } else {
    Options.add({ title: 'Authorize', handler: Authorize, primary: true });
  }
}
