<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Models\User;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    
    // public function sendMessage(Request $request)
    // {
    //     // Validate the request
    //     $request->validate([
    //         'content' => 'required',
    //         'chat_id' => 'required|exists:chats,id'
    //     ]);
    
    //     // Create message
    //     $message = Message::create([
    //         'user_id' => $request->user()->id,
    //         'chat_id' => $request->chat_id,
    //         'content' => $request->content,
    //     ]);
    
    //     // Log a message before the event is triggered
    //     Log::info('About to trigger MessageSent event');
    
    //     // Dispatch an event.
    //     broadcast(new MessageSent($message))->toOthers();


    //     // event(new MessageSent($request->input('message')));
    
    //     // Log another message after the event is triggered
    //     Log::info('MessageSent event triggered');
    
    //     // Return the message
    //     return $message;
    // }



    public function sendMessage(Request $request)
{
    // Validate the request
    $request->validate([
        'content' => 'required',
        'chat_id' => 'required|exists:chats,id'
    ]);

    // Create message
    $message = Message::create([
        'user_id' => $request->user()->id,
        'chat_id' => $request->chat_id,
        'content' => $request->content,
    ]);

    // Fetch additional data from user
    $message->name = $request->user()->name;
    $message->role = $request->user()->role;
    $message->created_at = now();

    // Log a message before the event is triggered
    Log::info('About to trigger MessageSent event');

    // Dispatch an event.
    broadcast(new MessageSent($message))->toOthers();
    Log::info($message);
    // Log another message after the event is triggered
    Log::info('MessageSent event triggered');

    // Return the message
    return $message;
}

}