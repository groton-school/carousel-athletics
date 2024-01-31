<?php

namespace GrotonSchool\AthleticsSchedule\Blackbaud;

use JsonSerializable;

class Team implements JsonSerializable
{
    private static array $teams = [];

    private string $id;
    private string $name;
    private Sport $sport;

    /**
     * @return Team|null
     */
    public static function get($id)
    {
        if (empty(self::$teams)) {
            self::getAll();
        }
        if (empty(self::$teams[$id])) {
            return null;
        }
        return self::$teams[$id];
    }

    /**
     * @return Team[]
     */
    public static function getAll($params = []): array
    {
        $athletics = SKY::api()->endpoint('school/v1/athletics');
        $result = $athletics->get('teams?' . http_build_query($params));

        return array_map(fn ($t) => new Team($t), $result['value']);
    }

    public function __construct(array $data)
    {
        $this->id = $data['id'];
        $this->name = $data['name'];
        $this->sport = new Sport($data['sport']);

        self::$teams[$this->getId()] = $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getSport(): Sport
    {
        return $this->sport;
    }

    public function jsonSerialize(): mixed
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sport' => $this->sport,
        ];
    }
}
