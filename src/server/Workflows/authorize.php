<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

SKY::getToken($_SERVER, $_SESSION, $_GET, true);

header('Location: /');
