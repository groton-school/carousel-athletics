import Form from './Views/Form';
import Render from './Views/Render';

const params = new URLSearchParams(window.location.search);

const mode = params.get('mode');
params.delete('mode');
switch (mode) {
  case 'rss':
    params.delete('offset');
    window.location.href = `https://${
      window.location.hostname
    }/rss?${params.toString()}`;
    break;
  case 'ical':
    window.location.href = `https://${
      window.location.hostname
    }/ical?${params.toString()}`;
    break;
  case 'render':
    Render();
    break;
  default:
    Form();
}
