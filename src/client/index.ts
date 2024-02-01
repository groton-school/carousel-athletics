import Form from './Views/Form';
import Render from './Views/Render';

if (window.location.search.length) {
  Render();
} else {
  Form();
}
