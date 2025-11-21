export default function Deauthorize() {
  fetch(`/deauthorize`)
    .then((response) => response.json())
    .then(() => window.location.reload());
}
