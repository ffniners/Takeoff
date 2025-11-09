package backend

import (
	"encoding/json"
	"errors"
	"os"
)

const (
	eventsFile    = "data/events.json"
	settingsFile  = "data/settings.json"
	filePerms     = 0o644
	storageFolder = "data"
)

func ensureStorageDir() error {
	return os.MkdirAll(storageFolder, 0o755)
}

func loadEventsFromFile() ([]Event, error) {
	data, err := os.ReadFile(eventsFile)
	if err != nil {
		return nil, err
	}
	var events []Event
	if err := json.Unmarshal(data, &events); err != nil {
		return nil, err
	}
	return events, nil
}

func persistEvents(events []Event) error {
	if err := ensureStorageDir(); err != nil {
		return err
	}
	data, err := json.MarshalIndent(events, "", "  ")
	if err != nil {
		return err
	}
	tmp := eventsFile + ".tmp"
	if err := os.WriteFile(tmp, data, filePerms); err != nil {
		return err
	}
	return os.Rename(tmp, eventsFile)
}

func loadSettingsFromFile() (Settings, error) {
	data, err := os.ReadFile(settingsFile)
	if err != nil {
		return Settings{}, err
	}
	var settings Settings
	if err := json.Unmarshal(data, &settings); err != nil {
		return Settings{}, err
	}
	return settings, nil
}

func persistSettings(settings Settings) error {
	if err := ensureStorageDir(); err != nil {
		return err
	}
	data, err := json.MarshalIndent(settings, "", "  ")
	if err != nil {
		return err
	}
	tmp := settingsFile + ".tmp"
	if err := os.WriteFile(tmp, data, filePerms); err != nil {
		return err
	}
	return os.Rename(tmp, settingsFile)
}

func isNotFound(err error) bool {
	return errors.Is(err, os.ErrNotExist)
}
