<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;
use FeedWriter\RSS2;

require __DIR__ . '/../../../vendor/autoload.php';

session_start();
date_default_timezone_set('America/New_York');

$token = SKY::getToken($_SERVER, $_SESSION, $_GET, false);
if (empty($token)) {
    echo json_encode(['error' => 'not authenticated']);
    exit();
}

$athletics = SKY::api()->endpoint('school/v1/athletics');

$params = $_GET;
function extractParam($key, $default = null, $transform = null)
{
    global $params;
    if (!empty($params[$key])) {
        $value = $params[$key];
        unset($params[$key]);
        if ($transform) {
            return $transform($value);
        } else {
            return $value;
        }
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

$start_relative = extractParam(
    'start_relative',
    null,
    fn ($value) => date('Y-m-d', strtotime($value))
);
if ($start_relative) {
    $params['start_date'] = $start_relative;
}

$end_relative = extractParam(
    'end_relative',
    null,
    fn ($value) => date('Y-m-d', strtotime($value))
);
if ($end_relative) {
    $params['end_date'] = $end_relative;
}

$response = $athletics->get('teams?' . http_build_query($params));
$teams = [];
foreach ($response['value'] as $team) {
    $teams[$team['id']] = $team;
}

$response = $athletics->get('schedules?' . http_build_query($params));
$schedule = [];
foreach ($response['value'] as $event) {
    $event['team'] = $teams[$event['section_id']];
    if (!empty($event['opponents'])) {
        $event['opponent'] = join(
            ', ',
            array_map(fn ($o) => $o['name'], $event['opponents'])
        );
        $event['score'] = join(
            ', ',
            array_map(fn ($o) => $o['score'], $event['opponents'])
        );
        $event['outcome'] = $event['scrimmage']
            ? 'Scrimmage'
            : join(
                ', ',
                array_map(fn ($o) => $o['win_loss'], $event['opponents'])
            );
    } else {
        $event['opponent'] = $event['title'];
    }
    if (!$hide_scoreless || ($hide_scoreless && !empty($event['score']))) {
        $schedule[] = $event;
    }
}

$feed = new RSS2();

$baseTitle = $team_id
    ? $team[$team_id]['name']
    : date('F j', strtotime($schedule[0]['game_date'])) .
        ' – ' .
        date('F j', strtotime($schedule[count($schedule) - 1]['game_date']));
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
$feed->setAtomLink(
    'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
    'self'
);

for ($i = 0; $i < count($schedule); $i += $per_page) {
    $batch = array_slice($schedule, $i, $per_page);
    $item = $feed->createNewItem();
    $t =
        date('F j', strtotime($batch[0]['game_date'])) .
        ' – ' .
        date('F j', strtotime($batch[count($batch) - 1]['game_date']));
    $item->setTitle($t);
    $item->setId(time() . '-' . md5($t));
    $item->setDate($batch[count($batch) - 1]['game_date']);
    $item->setDescription(
        '<table><tbody><tr>' .
            join(
                '</tr><tr>',
                array_map(function ($event) {
                    $row =
                        '<td class="date">' .
                        date('F j', strtotime($event['game_date'])) .
                        '</td>';
                    $row .=
                        '<td class="team">' . $event['team']['name'] . '</td>';
                    $row .=
                        '<td class="opponent">' . $event['opponent'] . '</td>';
                    $row .= '<td class="score">' . $event['score'] . '</td>';
                    $row .=
                        '<td class="outcome">' . $event['outcome'] . '</td>';
                    return $row;
                }, $batch)
            ) .
            '</tr></tbody></table>'
    );
    $feed->addItem($item);
}

$feed->printFeed();
