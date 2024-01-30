<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

session_start();

$token = SKY::getToken($_SERVER, $_SESSION, $_GET, false);
if (empty($token)) {
    echo json_encode(['error' => 'not authenticated']);
    exit();
}

$athletics = SKY::api()->endpoint('school/v1/athletics');
$result = $athletics->get('teams?' . http_build_query($_GET));
echo json_encode($result);
exit();
