<?php

use FeedWriter\ATOM;
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
    fn ($val) => $val == 'true'
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

$feed = new ATOM();
$url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
$feed->setTitle($title);
$feed->setDescription(
    'Live updating feed of athletics information from Blackbaud'
);
$feed->setAtomLink(str_replace('/atom?', '?', $url . '&mode=edit'), 'via');
$feed->setAtomLink($url, 'self');

$updated = null;
foreach ($schedule->items as $item) {
    if (!$hide_scoreless || ($hide_scoreless && !empty($item->getScore()))) {
        $event = $feed->createNewItem();
        $event->setDate($item->getLastModified());
        $event->addElement('published', $item->getDate('c'));
        $event->addElement(
            'rights',
            $item->isFuture() ? $item->getHomeOrAway() : $item->getOutcome()
        );
        $event->setAuthor($item->getTeamName() . ' AUTHOR'); // debugging output for Carousel
        $event->addElement('category', null, [
            'term' => $item->getTeamName(),
            'label' => $item->getTeamName() . ' LABEL', // debugging output for Carousel
        ]);
        $event->setDescription(htmlentities($item->getOpponentName()));

        // combining score/time and outcome/location in one field until Carousel can parse the copyright field
        $event->setTitle(
            $item->isFuture() ? $item->getStart() : $item->getScore()
        );
        $event->setContent(
            $item->isFuture() ? $item->getHomeOrAway() : $item->getOutcome()
        );
        $event->setId($item->getUuid());

        $feed->addItem($event);

        if (!$updated || $updated < $item->getLastModified()) {
            $updated = $item->getLastModified();
        }
    }
    $feed->setDate($updated);
}

//header('Content-Type: application/rss+xml');
header('Content-Type: text/xml');
echo $feed->generateFeed();
exit();
