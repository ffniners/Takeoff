package main

import (
	"context"
	"embed"
	"log"

	"github.com/example/takeoff-wails/backend"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	app := backend.NewApp()

	err := wails.Run(&options.App{
		Title:            "Takeoff",
		Width:            1280,
		Height:           800,
		MinWidth:         1024,
		MinHeight:        720,
		AssetServer:      &assetserver.Options{Assets: assets},
		BackgroundColour: &options.RGBA{R: 18, G: 18, B: 18, A: 1},
		Bind:             []interface{}{app},
		OnStartup: func(ctx context.Context) {
			app.Startup(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			app.Shutdown(ctx)
		},
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				HideTitleBar: true,
			},
			Appearance: mac.NSAppearanceNameDarkAqua,
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
