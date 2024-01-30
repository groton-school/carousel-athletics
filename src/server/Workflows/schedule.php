<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

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
if ($params['start_relative']) {
    $params['start_date'] = date('Y-m-d', strtotime($params['start_relative']));
    unset($params['start_relative']);
}
if ($params['end_relative']) {
    $params['end_date'] = date('Y-m-d', strtotime($params['end_relative']));
    unset($params['end_relative']);
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
    $schedule[] = $event;
}

echo json_encode($schedule);
exit();
