<?php

namespace GrotonSchool\AthleticsSchedule\Blackbaud;

use JsonSerializable;

class Schedule implements JsonSerializable
{
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
            $params['end_date'] = $end_relative;
        }

        $schedule->params = array_filter(
            $schedule->params,
            fn ($key) => in_array($key, [
                'start_date',
                'end_date',
                'school_year',
                'include_practice',
                'team_id',
                'last_modified',
            ]),
            ARRAY_FILTER_USE_KEY
        );

        $response = SKY::api()
            ->endpoint('school/v1/athletics')
            ->get('schedules?' . http_build_query($schedule->params));

        foreach ($response['value'] as $event) {
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
            if (
                !$hide_scoreless ||
                ($hide_scoreless && !empty($event['score']))
            ) {
                $schedule->items[] = new ScheduleItem($event);
            }
        }
        return $schedule;
    }

    public function jsonSerialize(): mixed
    {
        return $this->items;
    }
}
