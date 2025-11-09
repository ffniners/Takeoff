package backend

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"sort"
	"sync"
	"time"
)

type App struct {
	ctx        context.Context
	events     []Event
	settings   Settings
	eventsMu   sync.RWMutex
	settingsMu sync.RWMutex
}

func NewApp() *App {
	now := time.Now().In(time.Local)

	events, err := loadEventsFromFile()
	if err != nil {
		if !isNotFound(err) {
			log.Printf("failed to load events.json: %v", err)
		}
		events = seededEvents(now)
		if err := persistEvents(events); err != nil {
			log.Printf("failed to persist seeded events: %v", err)
		}
	} else if len(events) == 0 {
		events = seededEvents(now)
		if err := persistEvents(events); err != nil {
			log.Printf("failed to persist seeded events: %v", err)
		}
	}

	sort.SliceStable(events, func(i, j int) bool {
		if events[i].Start.Equal(events[j].Start) {
			return events[i].ID < events[j].ID
		}
		return events[i].Start.Before(events[j].Start)
	})

	settings, err := loadSettingsFromFile()
	if err != nil {
		if !isNotFound(err) {
			log.Printf("failed to load settings.json: %v", err)
		}
		settings = defaultSettings()
		if err := persistSettings(settings); err != nil {
			log.Printf("failed to persist default settings: %v", err)
		}
	}

	return &App{
		events:   events,
		settings: settings,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Shutdown(ctx context.Context) {
	_ = ctx
}

func (a *App) GetEvents() ([]Event, error) {
	a.eventsMu.RLock()
	defer a.eventsMu.RUnlock()

	out := make([]Event, len(a.events))
	copy(out, a.events)
	return out, nil
}

func (a *App) SaveEvent(e Event) (Event, error) {
	a.eventsMu.Lock()
	defer a.eventsMu.Unlock()

	now := time.Now().In(time.Local)

	if e.ID == "" {
		e.ID = "evt-" + generateID()
		e.CreatedAt = now
	} else {
		existingIndex := -1
		for i, item := range a.events {
			if item.ID == e.ID {
				existingIndex = i
				break
			}
		}
		if existingIndex >= 0 {
			e.CreatedAt = a.events[existingIndex].CreatedAt
		} else {
			e.CreatedAt = now
		}
	}

	e.UpdatedAt = now
	if e.Assignees == nil {
		e.Assignees = []string{}
	}
	if e.Dependencies == nil {
		e.Dependencies = []string{}
	}
	if e.Reminders == nil {
		e.Reminders = []Reminder{}
	}
	if e.TranscriptRefs == nil {
		e.TranscriptRefs = []string{}
	}
	if e.Project != nil && *e.Project == "" {
		e.Project = nil
	}
	if e.Deadline != nil && e.Deadline.IsZero() {
		e.Deadline = nil
	}

	replaced := false
	for i, item := range a.events {
		if item.ID == e.ID {
			a.events[i] = e
			replaced = true
			break
		}
	}
	if !replaced {
		a.events = append(a.events, e)
	}

	sort.SliceStable(a.events, func(i, j int) bool {
		if a.events[i].Start.Equal(a.events[j].Start) {
			return a.events[i].ID < a.events[j].ID
		}
		return a.events[i].Start.Before(a.events[j].Start)
	})

	if err := persistEvents(a.events); err != nil {
		return Event{}, err
	}

	return e, nil
}

func (a *App) DeleteEvent(id string) error {
	if id == "" {
		return errors.New("id is required")
	}

	a.eventsMu.Lock()
	defer a.eventsMu.Unlock()

	index := -1
	for i, event := range a.events {
		if event.ID == id {
			index = i
			break
		}
	}

	if index == -1 {
		return fmt.Errorf("event %s not found", id)
	}

	a.events = append(a.events[:index], a.events[index+1:]...)

	return persistEvents(a.events)
}

func (a *App) GetSettings() (Settings, error) {
	a.settingsMu.RLock()
	defer a.settingsMu.RUnlock()

	return a.settings, nil
}

func (a *App) SaveSettings(s Settings) (Settings, error) {
	a.settingsMu.Lock()
	defer a.settingsMu.Unlock()

	if s.Timezone == "" {
		s.Timezone = a.settings.Timezone
		if s.Timezone == "" {
			s.Timezone = defaultSettings().Timezone
		}
	}
	if s.WorkdayStart == "" {
		s.WorkdayStart = a.settings.WorkdayStart
	}
	if s.WorkdayEnd == "" {
		s.WorkdayEnd = a.settings.WorkdayEnd
	}
	if s.DefaultSlotMin == 0 {
		s.DefaultSlotMin = a.settings.DefaultSlotMin
		if s.DefaultSlotMin == 0 {
			s.DefaultSlotMin = defaultSettings().DefaultSlotMin
		}
	}
	if s.MaxHoursPerDay == 0 {
		s.MaxHoursPerDay = a.settings.MaxHoursPerDay
		if s.MaxHoursPerDay == 0 {
			s.MaxHoursPerDay = defaultSettings().MaxHoursPerDay
		}
	}

	a.settings = s

	if err := persistSettings(a.settings); err != nil {
		return Settings{}, err
	}

	return a.settings, nil
}

func generateID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}
