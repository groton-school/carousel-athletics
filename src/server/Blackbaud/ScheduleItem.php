<?php

namespace GrotonSchool\AthleticsSchedule\Blackbaud;

use DateTime;
use JsonSerializable;

class ScheduleItem implements JsonSerializable
{
    public const OPPONENTS = 'opponents';
    public const TEAM_ID = 'team_id';
    public const GAME_TIME = 'game_time';
    public const TITLE = 'title';
    public const RESCHEDULED = 'rescheduled';

    private array $data;
    private $future = null;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function getUuid(): string
    {
        // return "faux" URL to API endpoint for schedule item
        return SKY::api()->getBaseApiUrl() .
            '/school/v1/athletics/schedules/' .
            $this->data['id'];
    }

    public function isFuture(): bool
    {
        if ($this->future === null) {
            $this->future = strtotime($this->getEnd('c')) > time();
        }
        return $this->future;
    }

    public function isRescheduled(): bool
    {
        return boolval($this->data[self::RESCHEDULED]);
    }

    public function getDate($format = 'F j'): string
    {
        return $this->getStart($format);
    }

    public function getStart($format = 'g:i A'): string
    {
        return (new DateTime(
            (new DateTime($this->data[self::GAME_TIME]['date']))->format(
                'Y-m-d'
            ) .
                ' ' .
                (new DateTime($this->data[self::GAME_TIME]['start']))->format(
                    'g:i A'
                )
        ))->format($format);
    }

    public function getEnd($format = 'g:i A'): string
    {
        return (new DateTime(
            (new DateTime($this->data[self::GAME_TIME]['date']))->format(
                'Y-m-d'
            ) .
                ' ' .
                (new DateTime($this->data[self::GAME_TIME]['end']))->format(
                    'g:i A'
                )
        ))->format($format);
    }

    public function getLastModified($format = 'c'): string
    {
        return (new DateTime($this->data['last_modified']))->format($format);
    }

    public function getHomeOrAway(): string
    {
        return $this->data['home_or_away'];
    }

    public function getTeamName(): string
    {
        return Team::get($this->data[self::TEAM_ID])->getName();
    }

    public function getTitle(): string
    {
        if (!empty($this->data[self::TITLE])) {
            return $this->data[self::TITLE];
        } else {
            return join(
                ', ',
                array_filter(
                    array_map(
                        fn ($o) => empty($o['name']) ? '' : $o['name'],
                        $this->data[self::OPPONENTS] ?? []
                    ),
                    fn ($n) => !empty($n)
                )
            );
        }
    }

    public function getScore(): string
    {
        if (empty($this->data[self::OPPONENTS])) {
            return '';
        } else {
            return join(
                ', ',
                array_filter(
                    array_map(
                        fn ($o) => $o['score'],
                        $this->data[self::OPPONENTS] ?? []
                    ),
                    fn ($s) => !empty($s)
                )
            );
        }
    }

    public function getOutcome(): string
    {
        if (empty($this->data['scrimmage'])) {
            if (empty($this->data[self::OPPONENTS])) {
                return '';
            } else {
                return join(
                    ', ',
                    array_filter(
                        array_map(
                            fn ($o) => $o['win_loss'],
                            $this->data[self::OPPONENTS] ?? []
                        ),
                        fn ($o) => !empty($o)
                    )
                );
            }
        } else {
            return 'Scrimmage';
        }
    }

    public function jsonSerialize(): mixed
    {
        $json = $this->data;
        $json['is_future'] = $this->isFuture();
        $json['team'] = Team::get($this->data[self::TEAM_ID]);
        $json['opponent'] = $this->getTitle();
        $json['score'] = $this->getScore();
        $json['outcome'] = $this->getOutcome();
        return $json;
    }
}
