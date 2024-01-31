<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;
use GrotonSchool\AthleticsSchedule\Blackbaud\Team;

require __DIR__ . '/../../../vendor/autoload.php';

session_start();
if (!SKY::isReady($_SERVER, $_SESSION, $_GET)) {
    echo json_encode(['error' => 'not authenticated']);
    exit();
}
echo json_encode(Team::getAll($_GET));
exit();
