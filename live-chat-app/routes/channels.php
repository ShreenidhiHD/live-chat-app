<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
// Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
//     // Retrieve the chat with the given ID
//     $chat = \App\Models\Chat::find($chatId);

//     // Check if the user is part of the chat
//     if ($chat && $chat->users->contains($user)) {
//         return $user;
//     }

//     return false;
// });
