<?php

namespace App\Http\Controllers;

use App\Events\ReadReceipt;
use App\Models\User;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
use App\Events\UserTyping;

class ChatController extends Controller
{
    // public function getChatMessages(Chat $chat)
    // {
    //     // // Ensure the requesting user is part of the chat
    //     // if ($chat->customer_id !== auth()->id() && $chat->agent_id !== auth()->id()) {
    //     //     return response()->json(['error' => 'User not part of this chat'], 403);
    //     // }

    //     // // Return the messages associated with the chat
    //     // $messages = $chat->messages;

    //     // // Returning messages and count in the response
    //     // return response()->json([
    //     //     'messages' => $messages,
    //     //     'count' => $messages->count(),
    //     // ]);
    //      // Fetch the messages associated with the chat
    // $messages = $chat->messages;

    // // Returning messages and count in the response
    // return response()->json([
    //     'messages' => $messages,
    //     'count' => $messages->count(),
    // ]);
    // }
    public function getChatMessages(Chat $chat)
    {
        // Fetch the messages associated with the chat, including the sender's role
        $messages = $chat->messages->map(function ($message) {
            // Access the sender information from the message relationship
            $sender = $message->user; // Assuming the User model is related through 'user' relationship

            // Return an array with the message data and sender's role
            return [
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'seen'=>$message->seen,
                'sender' => [
                    'id' => $sender->id,
                    'name' => $sender->name,
                    'email' => $sender->email,
                    'role' => $sender->role,
                    // Include the sender's role
                ],
            ];
        });

        // Returning messages and count in the response
        return response()->json([
            'messages' => $messages,
            'count' => $messages->count(),
        ]);
    }



    public function getLatestChat(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['error' => 'User not authenticated'], 401);
    }

    // Get the latest chat for the user
    $chat = Chat::where('customer_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->first();

    // If no chat found, create a new one
    if (!$chat) {
        return $this->createChat($request);
    }

    return response()->json($chat);
}


    public function getChats(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Fetch all chats along with the customer who created each chat
        $chats = Chat::with('customer')->get();

        return response()->json($chats);
    }
    public function createChat(Request $request)
    {
        // Get the authenticated user's ID from the token
        $customer_id = $request->user()->id;

        // Try to find an existing chat
        $chat = Chat::firstOrCreate(['customer_id' => $customer_id]);

        // Return the existing or newly created chat
        return response()->json($chat);
    }



   

    public function readMessage(Request $request)
    
    {
        $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'exists:messages,id'
        ]);
    
        $messages = Message::whereIn('id', $request->message_ids)->get();
        $user = $request->user();
        $currentUserId = $user->id;
    
        foreach($messages as $message) {
            if ($currentUserId != $message->user_id) {
                // Retrieve all messages with a lower id and the same user_id
                $unseenMessages = Message::where('id', '<=', $message->id)
                    ->where('user_id', $message->user_id)
                    ->where('seen', false) // Only fetch unseen messages
                    ->get();
    
                if ($unseenMessages->isNotEmpty()) {
                    foreach ($unseenMessages as $msg) {
                        $msg->seen = true;
                        $msg->save();
    
                        $chatId = $msg->chat_id;
    
                        Log::info('About to trigger ReadReceipt event for message: ' . $msg->id);
                        broadcast(new ReadReceipt($msg->id, true, $chatId));
                        Log::info('ReadReceipt event triggered for message: ' . $msg->id);
                    }
                }
            }
        }
    
        return response()->json('Previous messages marked as read');
    }
    


    


    public function userTyping(Request $request)
{
    // $username = $request->input('username');
    $chatId = $request->input('chat_id'); 

    event(new UserTyping($chatId)); 

    return response()->json(['message' => 'Event fired!']);
}



}