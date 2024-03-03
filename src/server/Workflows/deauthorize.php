<?php

require __DIR__ . '/../../../vendor/autoload.php';

use Battis\LazySecrets\Cache;

$cache = new Cache($_ENV['GOOGLE_CLOUD_PROJECT']);

$cache->delete('BLACKBAUD_API_TOKEN');

echo json_encode(['status' => 'deauthorized']);
