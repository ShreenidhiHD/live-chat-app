<?php

namespace App\Http\Controllers;

use App\Events\ReadReceipt;
use App\Models\User;
use App\Models\Chat;
use App\Models\Message;

use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;

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

        if (!$chat) {
            return response()->json(['error' => 'No chats found'], 404);
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
            'message_id' => 'required|exists:messages,id'
        ]);
    
        $message = Message::find($request->message_id);
        $user = $request->user();
        $currentuser = $user->id;
    
        if ($currentuser != $message->user_id) {
            // Retrieve all messages with a lower id and the same user_id
            $messages = Message::where('id', '<', $message->id)->where('user_id', $message->user_id)->get();
    
            foreach ($messages as $msg) {
                $msg->seen = true;
                $msg->save();
    
                broadcast(new ReadReceipt($user->name, $msg->id, $msg->seen));
            }
        }
    
        return response()->json('Previous messages marked as read');
    }
    


    public function typing(Request $request)
    {
        broadcast(new UserTyping($request->user()->name));
        return response()->json('Broadcasted typing event');
    }

}