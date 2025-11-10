<?php

use GrotonSchool\AthleticsSchedule\Blackbaud\SKY;

require __DIR__ . '/../../../vendor/autoload.php';

session_id('shared');
session_start();
date_default_timezone_set('America/New_York');

SKY::getToken($_SERVER, $_SESSION, $_GET, true);

header('Location: /');
