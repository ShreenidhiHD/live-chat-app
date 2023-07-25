<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function getChats(Request $request)
    {
        $user = $request->user();
    
        // Get all chats the user is a member of
        $chats = $user->chats;
    
        return response()->json($chats);
    }
    public function createChat(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $user = $request->user();
        $otherUser = User::find($request->user_id);

        // Create a new chat
        $chat = Chat::create();

        // Attach the users to the chat
        $chat->users()->attach([$user->id, $otherUser->id]);

        return response()->json($chat);
    }
    public function readMessage(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:messages,id'
        ]);

        $message = Message::find($request->message_id);

        // Do some authorization check here...

        $message->read_at = now();
        $message->save();

        broadcast(new ReadReceipt($request->user()->name, $message->id));

        return response()->json('Message marked as read');
    }
    public function typing(Request $request)
    {
        broadcast(new UserTyping($request->user()->name));
        return response()->json('Broadcasted typing event');
    }

}
