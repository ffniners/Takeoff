package backend

import "time"

type Reminder struct {
	ID            string `json:"id"`
	OffsetMinutes int    `json:"offsetMinutes"`
	Label         string `json:"label"`
}

type Event struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	Start          time.Time  `json:"start"`
	End            time.Time  `json:"end"`
	AllDay         bool       `json:"allDay"`
	Status         string     `json:"status"`
	Priority       string     `json:"priority"`
	Deadline       *time.Time `json:"deadline,omitempty"`
	Reminders      []Reminder `json:"reminders"`
	Owner          string     `json:"owner"`
	Assignees      []string   `json:"assignees"`
	Project        *string    `json:"project,omitempty"`
	Dependencies   []string   `json:"dependencies"`
	Description    string     `json:"description"`
	Instructions   string     `json:"instructions"`
	TranscriptRefs []string   `json:"transcriptRefs"`
	AiNotes        *string    `json:"aiNotes,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type Settings struct {
	Timezone       string `json:"timezone"`
	WorkdayStart   string `json:"workdayStart"`
	WorkdayEnd     string `json:"workdayEnd"`
	DefaultSlotMin int    `json:"defaultSlotMin"`
	MaxHoursPerDay int    `json:"maxHoursPerDay"`
	DeepWorkAM     bool   `json:"deepWorkAM"`
}
