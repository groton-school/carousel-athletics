<?php

require __DIR__ . '/../../../vendor/autoload.php';

use Battis\LazySecrets\Cache;

session_id('shared');
session_start();
date_default_timezone_set('America/New_York');

$cache = new Cache($_ENV['GOOGLE_CLOUD_PROJECT']);

$cache->delete('BLACKBAUD_API_TOKEN');

echo json_encode(['status' => 'deauthorized']);
