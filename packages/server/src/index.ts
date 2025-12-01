import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import path from 'node:path';
import { SKY, Team } from './Blackbaud/index.js';
import { feedFromRequest } from './feedFromRequest.js';

const app = express();
const sky = SKY.getInstance();

async function requireAuthorization(
  handler: RequestHandler,
  ...args: [Request, Response, NextFunction]
) {
  if (await sky.ready()) {
    await handler(...args);
  } else {
    const [, res] = args;
    res.sendStatus(400);
    res.send({ error: 'unauthorized' });
  }
}

app.get('/ready', async (_, res) => {
  res.send({ ready: await sky.ready() });
});
app.get('/authorize', async (_, res) => {
  res.redirect(await sky.getAuthorizeUrl());
});
app.get('/redirect', sky.handleRedirect.bind(sky));
app.get('/deauthorize', async (_, res) => {
  await sky.deauthorize();
  res.redirect('/');
});

app.get('/teams', async (...args) => {
  await requireAuthorization(
    async (req, res) => {
      res.send(await Team.list(req.query));
    },
    ...args
  );
});

app.get('/atom', async (...args) => {
  await requireAuthorization(
    async (req, res) => {
      const feed = await feedFromRequest(req);
      res.appendHeader('Content-Type', 'application/rss+xml');
      res.send(feed.atom1());
    },
    ...args
  );
});
app.get('/rss', async (...args) => {
  await requireAuthorization(
    async (req, res) => {
      const feed = await feedFromRequest(req);
      res.appendHeader('Content-Type', 'text/xml');
      res.send(feed.rss2());
    },
    ...args
  );
});

app.use(express.static(path.join(import.meta.dirname, '../public')));

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
