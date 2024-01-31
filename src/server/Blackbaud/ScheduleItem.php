<?php

namespace GrotonSchool\AthleticsSchedule\Blackbaud;

use JsonSerializable;

class ScheduleItem implements JsonSerializable
{
    private array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function jsonSerialize(): mixed
    {
        $json = $this->data;
        $json['team'] = Team::get($this->data['section_id']);
        return $json;
    }
}
