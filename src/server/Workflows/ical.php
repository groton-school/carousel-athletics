<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\Schedule;
use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;
use GrotonSchool\AthleticsSchedule\Blackbaud\Team;
use Kigkonsult\Icalcreator\Vcalendar;

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
$offset = extractParam('offset');
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

$ics = new Vcalendar([
    Vcalendar::UNIQUE_ID => 'org.groton.carousel-athletics',
]);
$ics->setMethod('PUBLISH');
$ics->setXprop('X-WR-CALNAME', $title);
$ics->setXprop(
    'X-WR-CALDESC',
    'Live updating feed of athletics information from Blackbaud'
);
$ics->setUrl(
    'https://' .
        $_SERVER['HTTP_HOST'] .
        str_replace('/ical?', '?', $_SERVER['REQUEST_URI']) .
        '&mode=edit'
);

foreach ($schedule->items as $item) {
    if (
        !$item->isRescheduled() &&
        (!$hide_scoreless || ($hide_scoreless && !empty($item->getScore())))
    ) {
        $event = $ics->newVevent();
        $event->setDtstart(
            $offset
                ? date('c', strtotime($offset, strtotime($item->getStart('c'))))
                : $item->getStart('c')
        );
        $event->setSummary($item->getDate());
        $event->setDescription($item->getTeamName());
        $event->setLocation($item->getTitle());
        $event->setComment(
            $item->isFuture() ? $item->getStart() : $item->getScore()
        );
        $event->setCategories(
            $item->isFuture() ? $item->getHomeOrAway() : $item->getOutcome()
        );
    }
}

header('Content-Type: text/calendar');
echo $ics->vtimezonePopulate($tzid)->createCalendar();
exit();
