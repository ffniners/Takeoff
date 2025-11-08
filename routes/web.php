<?php

use App\Http\Controllers\CalendarController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CalendarController::class, 'index'])->name('calendar.index');
Route::get('/inbox', [CalendarController::class, 'inbox'])->name('calendar.inbox');
Route::get('/settings', [CalendarController::class, 'settings'])->name('calendar.settings');
