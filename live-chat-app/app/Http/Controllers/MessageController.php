<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Models\User;
use App\Models\Message;
class MessageController extends Controller
{
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

        // Dispatch an event.
        event(new MessageSent($message));

        // Return the message
        return $message;
    }


}
