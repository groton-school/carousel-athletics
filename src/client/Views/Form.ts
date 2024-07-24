import Authorize from '../Authorize';
import Deauthorize from '../Deauthorize';
import * as Options from '../Options';
import Team from '../SKY/Team';
import './styles.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

export default async function Form() {
  if ((await (await fetch(`${process.env.URL}/ready`)).json()).ready) {
    Options.add({ title: 'Deauthorize', handler: Deauthorize });

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

    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      const inputs = document.querySelectorAll(
        `input[name="${key}"]`
      ) as NodeListOf<HTMLInputElement>;
      inputs.forEach((input) => {
        switch (input.type) {
          case 'text':
            input.value = value;
            break;
          case 'radio':
          case 'checkbox':
            input.checked = input.value === value;
            break;
        }
      });
      if (inputs.length === 0) {
        const options = document.querySelectorAll(
          `select[name="${key} option"`
        ) as NodeListOf<HTMLOptionElement>;
        options.forEach((option) => (option.selected = option.value === value));
      }
    });

    document.forms.namedItem('edit')?.classList.add('ready');
  } else {
    Options.add({ title: 'Authorize', handler: Authorize, primary: true });
  }
}
