import Authorize from './Authorize';
import Deauthorize from './Deauthorize';
import * as Options from './Options';

type Sport = {
  id: number;
  name: string;
};
type Team = {
  id: number;
  name: string;
  sport: Sport;
};

fetch(`${process.env.URL}/ready`)
  .then((response) => response.json())
  .then(({ ready }) => {
    if (ready) {
      Options.add({ title: 'Deauthorize', handler: Deauthorize });
      fetch(`${process.env.URL}/teams`)
        .then((response) => response.json())
        .then((teams): void => {
          const sel: HTMLSelectElement | null =
            document.querySelector('select');
          const sports: Record<string, Team[]> = {};
          teams.value.forEach((team: Team) => {
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
        });
    } else {
      Options.add({ title: 'Authorize', handler: Authorize, primary: true });
    }
  });
