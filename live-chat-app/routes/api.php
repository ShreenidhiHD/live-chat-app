<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/send', [MessageController::class, 'sendMessage']);
    Route::get('agent/chats', [ChatController::class, 'getChats']);
    Route::post('/chats', [ChatController::class, 'createChat']);
    Route::post('/messages/read', [ChatController::class, 'readMessage']);
    Route::post('/typing', [ChatController::class, 'typing']);    
    Route::get('/chats/latest', [ChatController::class, 'getLatestChat']);
    Route::get('/chats/{chat}/messages', [ChatController::class, 'getChatMessages']);
    Route::get('/userdata', [UserController::class, 'userprofile']);
    Route::post('/clearChat', [ChatController::class, 'clearChat']);    
    
});
