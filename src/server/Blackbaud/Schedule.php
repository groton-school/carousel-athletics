<?php

namespace GrotonSchool\AthleticsSchedule\Blackbaud;

use JsonSerializable;

class Schedule implements JsonSerializable
{
    public const SKY_PARAMS = [
        'start_date',
        'end_date',
        'school_year',
        'include_practice',
        'team_id',
        'last_modified',
    ];

    private array $params;

    /** @var ScheduleItem[] $items */
    public array $items = [];

    private function extractParam($key, $default = null, $transform = null)
    {
        if (!empty($this->params[$key])) {
            $value = $this->params[$key];
            unset($this->params[$key]);
            if ($transform) {
                return $transform($value);
            } else {
                return $value;
            }
        } else {
            return $default;
        }
    }

    private function __construct(array $params)
    {
        $this->params = $params;
    }

    private static function ymd($value)
    {
        return date('Y-m-d', strtotime($value));
    }

    public static function get($params): Schedule
    {
        $schedule = new Schedule($params);
        Team::getAll($params);

        $hide_scoreless = $schedule->extractParam(
            'hide_scoreless',
            false,
            fn ($val) => $val == 'true'
        );

        date_default_timezone_set('America/New_York');
        $start_relative = $schedule->extractParam('start_relative', null, [
            Schedule::class,
            'ymd',
        ]);
        if ($start_relative) {
            $schedule->params['start_date'] = $start_relative;
        }

        $end_relative = $schedule->extractParam('end_relative', null, [
            Schedule::class,
            'ymd',
        ]);
        if ($end_relative) {
            $schedule->params['end_date'] = $end_relative;
        }

        $future = $schedule->extractParam('future');

        $schedule->params = array_filter(
            $schedule->params,
            fn ($key) => in_array($key, self::SKY_PARAMS),
            ARRAY_FILTER_USE_KEY
        );

        $response = SKY::api()
            ->endpoint('school/v1')
            ->get('athletics/schedules?' . http_build_query($schedule->params));

        foreach ($response['value'] as $value) {
            $item = new ScheduleItem($value);
            $include = true;
            if ($future === 'true') {
                $include = $include && $item->isFuture();
            } elseif ($future === 'false') {
                $include = $include && !$item->isFuture();
            }
            if ($include && $hide_scoreless && empty($item->getScore())) {
                $include = false;
            }

            if ($include) {
                $schedule->items[] = $item;
            }
        }
        return $schedule;
    }

    public function getPage(int $offset, int $length)
    {
        $page = new Schedule($this->params);
        $page->items = array_slice($this->items, $offset, $length);
        return $page;
    }

    public function getFirst()
    {
        if (empty($this->items)) {
            return null;
        }
        return $this->items[0];
    }

    public function getLast()
    {
        if (empty($this->items)) {
            return null;
        }
        return $this->items[count($this->items) - 1];
    }

    public function jsonSerialize(): mixed
    {
        return $this->items;
    }

    public function getParams()
    {
        return $this->params;
    }
}
