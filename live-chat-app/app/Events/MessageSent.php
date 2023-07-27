<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
        Log::info('MessageSent event constructed with message: ' . $this->message->id);
    }

    public function broadcastOn()
    {
        $channel = new Channel('chat.' . $this->message->chat_id);
        Log::info('MessageSent event will broadcast on channel: ' . $channel->name);
        return  $channel;
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
