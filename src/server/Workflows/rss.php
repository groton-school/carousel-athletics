<?php

use FeedWriter\RSS2;
use GrotonSchool\AthleticsSchedule\Blackbaud\Schedule;
use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;
use GrotonSchool\AthleticsSchedule\Blackbaud\Team;

require __DIR__ . '/../../../vendor/autoload.php';

session_start();
date_default_timezone_set('America/New_York');

if (!SKY::isReady($_SERVER, $_SESSION, $_GET)) {
    echo json_encode(['error' => 'not authenticated']);
    exit();
}

$params = $_GET;
function extractParam($key, $default = null)
{
    global $params;
    if (!empty($params[$key])) {
        $value = $params[$key];
        unset($params[$key]);
        return $value;
    } else {
        return $default;
    }
}

$title = extractParam('title');
$title_position = extractParam('title_position');
$hide_scoreless = extractParam(
    'hide_scoreless',
    false,
    fn($val) => $val == 'true'
);
$tzid = extractParam('tzid', 'America/New_York');
$per_page = extractParam('per_page');
$team_id = empty($params['team_id']) ? null : $params['team_id'];

$schedule = Schedule::get($params);

$start = $schedule->getFirst() ? $schedule->getFirst()->getDate() : '';
$end = $schedule->getLast() ? $schedule->getLast()->getDate() : '';
$baseTitle = $team_id
    ? Team::get($team_id)->getName()
    : $start . ($start != $end ? ' – ' . $end : '');
switch ($title_position) {
    case 'prepend':
        $title = "$title$baseTitle";
        break;
    case 'replace':
        break;
    case 'append':
        $title = "$baseTitle$title";
        break;
    default:
        $title = $baseTitle;
}

$feed = new RSS2();
$url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
$feed->setTitle($title);
$feed->setDescription(
    'Live updating feed of athletics information from Blackbaud'
);
$feed->setAtomLink(str_replace('/rss?', '?', $url . '&mode=edit'), 'via');
$feed->setAtomLink($url, 'self');
$feed->setLink($url);

$updated = null;
foreach ($schedule->items as $item) {
    if (
        !$item->isRescheduled() &&
        (!$hide_scoreless || ($hide_scoreless && !empty($item->getScore())))
    ) {
        $event = $feed->createNewItem();
        $event->setDate($item->getDate());
        //$event->addElement('pubDate', $item->getLastModified());
        $event->addElement('category', $item->getTeamName());
        $event->setDescription(htmlentities($item->getTitle()));

        // combining score/time and outcome/location in one field until Carousel can parse the copyright field
        $event->setTitle(
            $item->isFuture()
                ? $item->getStart() .
                    (empty($item->getHomeOrAway())
                        ? ''
                        : ' (' . $item->getHomeOrAway() . ')')
                : $item->getScore() .
                    (empty($item->getOutcome())
                        ? ''
                        : '    (' . $item->getOutcome() . ')')
        );
        $event->addElement(
            'rights',
            $item->isFuture() ? $item->getHomeOrAway() : $item->getOutcome()
        );
        $event->setId($item->getUuid());

        $feed->addItem($event);

        if (!$updated || $updated < $item->getLastModified()) {
            $updated = $item->getLastModified();
        }
    }
}
$feed->setDate($updated);

//header('Content-Type: application/rss+xml');
header('Content-Type: text/xml');
echo $feed->generateFeed();
exit();
