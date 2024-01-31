<?php

use FeedWriter\ATOM;
use GrotonSchool\AthleticsSchedule\Blackbaud\Schedule;
use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;
use GrotonSchool\AthleticsSchedule\Blackbaud\Team;

require __DIR__ . '/../../../vendor/autoload.php';

session_start();
date_default_timezone_set('America/New_York');

if (SKY::isReady($_SERVER, $_SESSION, $_GET)) {
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

$per_page = extractParam('per_page', 12);
$title = extractParam('title');
$title_position = extractParam('title_position');
$hide_scoreless = extractParam(
    'hide_scoreless',
    false,
    fn ($val) => $val == 'true'
);
$team_id = empty($params['team_id']) ? null : $params['team_id'];

$schedule = Schedule::get($params);

$feed = new ATOM();

$baseTitle = $team_id
    ? Team::get($team_id)->getName()
    : date('F j', strtotime($schedule->items[0]['game_date'])) .
        ' – ' .
        date(
            'F j',
            strtotime(
                $schedule->items[count($schedule->items) - 1]['game_date']
            )
        );
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
$feed->setTitle($title);
$feed->setLink(
    'https://' .
        $_SERVER['HTTP_HOST'] .
        str_replace('rss', 'schedule.html', $_SERVER['REQUEST_URI'])
);
$feed->setDescription(json_encode($_GET));
$feed->setSelfLink(
    'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']
);

for ($i = 0; $i < count($schedule->items); $i += $per_page) {
    $page = array_slice($schedule->items, $i, $per_page);
    $itemTitle =
        date('F j', strtotime($page[0]['game_date'])) .
        ' – ' .
        date('F j', strtotime($page[count($page) - 1]['game_date']));
    $itemContent =
        '<table><tbody><tr>' .
        join(
            '</tr><tr>',
            array_map(function ($event) {
                $row =
                    '<td class="date">' .
                    date('F j', strtotime($event['game_date'])) .
                    '</td>';
                $row .= '<td class="team">' . $event['team']['name'] . '</td>';
                $row .= '<td class="opponent">' . $event['opponent'] . '</td>';
                $row .= '<td class="score">' . $event['score'] . '</td>';
                $row .= '<td class="outcome">' . $event['outcome'] . '</td>';
                return $row;
            }, $page)
        ) .
        '</tr></tbody></table>';
    $item = $feed->createNewItem();
    $item->setTitle($itemTitle);
    $item->setDate($page[count($page) - 1]['game_date']);
    $item->setDescription(htmlentities($itemContent));

    $feed->addItem($item);
}

$feed->printFeed();
