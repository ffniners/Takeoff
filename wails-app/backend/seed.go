package backend

import "time"

func defaultSettings() Settings {
	return Settings{
		Timezone:       "America/Los_Angeles",
		WorkdayStart:   "08:00",
		WorkdayEnd:     "17:00",
		DefaultSlotMin: 60,
		MaxHoursPerDay: 5,
		DeepWorkAM:     true,
	}
}

func seededEvents(now time.Time) []Event {
	base := now.Truncate(24 * time.Hour)
	if now.Sub(base) > 0 {
		base = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	}

	mkTime := func(dayOffset int, hour, minute int) time.Time {
		return base.AddDate(0, 0, dayOffset).Add(time.Duration(hour)*time.Hour + time.Duration(minute)*time.Minute)
	}

	created := now

	addReminder := func(mins int, label string) []Reminder {
		return []Reminder{{
			ID:            generateID(),
			OffsetMinutes: mins,
			Label:         label,
		}}
	}

	events := []Event{
		{
			ID:             "evt-launch-sync",
			Title:          "Weekly Launch Sync",
			Start:          mkTime(1, 9, 0),
			End:            mkTime(1, 10, 0),
			AllDay:         false,
			Status:         "scheduled",
			Priority:       "P1",
			Deadline:       ptrTime(mkTime(1, 17, 0)),
			Reminders:      []Reminder{{ID: generateID(), OffsetMinutes: -120, Label: "-2h"}, {ID: generateID(), OffsetMinutes: -15, Label: "-15m"}},
			Owner:          "Avery",
			Assignees:      []string{"Avery", "Jordan", "Maya"},
			Project:        ptrString("Liftoff"),
			Dependencies:   []string{},
			Description:    "Critical go/no-go review for this sprint.",
			Instructions:   "Prep launch readiness checklist. AI: summarise blockers.",
			TranscriptRefs: []string{"launch-sync-2024-01"},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
		{
			ID:             "evt-deep-work",
			Title:          "Prototype Deep Work",
			Start:          mkTime(3, 8, 30),
			End:            mkTime(3, 11, 30),
			AllDay:         false,
			Status:         "in_progress",
			Priority:       "P2",
			Reminders:      addReminder(-60, "-1h"),
			Owner:          "Maya",
			Assignees:      []string{"Maya"},
			Project:        ptrString("Orion"),
			Dependencies:   []string{"evt-launch-sync"},
			Description:    "Heads-down block to integrate telemetry feed.",
			Instructions:   "Future AI: flag risks if data drift >2%.",
			TranscriptRefs: []string{},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
		{
			ID:             "evt-stakeholder-demo",
			Title:          "Stakeholder Demo",
			Start:          mkTime(7, 13, 0),
			End:            mkTime(7, 14, 0),
			AllDay:         false,
			Status:         "proposed",
			Priority:       "P1",
			Deadline:       ptrTime(mkTime(7, 18, 0)),
			Reminders:      []Reminder{{ID: generateID(), OffsetMinutes: -24 * 60, Label: "-24h"}, {ID: generateID(), OffsetMinutes: -30, Label: "-30m"}},
			Owner:          "Jordan",
			Assignees:      []string{"Jordan", "Dev"},
			Project:        ptrString("Habitat"),
			Dependencies:   []string{"evt-launch-sync"},
			Description:    "Demo of habitat planning dashboard.",
			Instructions:   "Draft follow-up email template. Future AI can summarize Q&A.",
			TranscriptRefs: []string{"stakeholder-notes"},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
		{
			ID:             "evt-team-offsite",
			Title:          "Team Offsite",
			Start:          mkTime(5, 0, 0),
			End:            mkTime(6, 0, 0),
			AllDay:         true,
			Status:         "scheduled",
			Priority:       "P3",
			Reminders:      addReminder(-24*60, "-24h"),
			Owner:          "People Ops",
			Assignees:      []string{"Team"},
			Project:        ptrString("Team Health"),
			Dependencies:   []string{},
			Description:    "Offsite planning day.",
			Instructions:   "AI: gather fun retro prompts later.",
			TranscriptRefs: []string{},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
		{
			ID:             "evt-cx-review",
			Title:          "Customer Insights Review",
			Start:          mkTime(10, 15, 0),
			End:            mkTime(10, 16, 30),
			AllDay:         false,
			Status:         "scheduled",
			Priority:       "P2",
			Reminders:      []Reminder{{ID: generateID(), OffsetMinutes: -90, Label: "-90m"}},
			Owner:          "Dev",
			Assignees:      []string{"Dev", "Avery"},
			Project:        ptrString("Liftoff"),
			Dependencies:   []string{"evt-stakeholder-demo"},
			Description:    "Review support transcripts and churn signals.",
			Instructions:   "Flag AI summary gaps for automation.",
			TranscriptRefs: []string{"support-weekly"},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
		{
			ID:             "evt-sprint-planning",
			Title:          "Sprint Planning",
			Start:          mkTime(0, 11, 0),
			End:            mkTime(0, 12, 30),
			AllDay:         false,
			Status:         "done",
			Priority:       "P1",
			Reminders:      []Reminder{{ID: generateID(), OffsetMinutes: -30, Label: "-30m"}},
			Owner:          "Avery",
			Assignees:      []string{"Avery", "Jordan", "Maya", "Dev"},
			Project:        ptrString("Orion"),
			Dependencies:   []string{},
			Description:    "Kick off sprint with backlog review.",
			Instructions:   "Capture retro actions for AI follow-up.",
			TranscriptRefs: []string{"planning-notes"},
			CreatedAt:      created,
			UpdatedAt:      created,
		},
	}

	return events
}

func ptrTime(t time.Time) *time.Time { return &t }

func ptrString(s string) *string { return &s }
