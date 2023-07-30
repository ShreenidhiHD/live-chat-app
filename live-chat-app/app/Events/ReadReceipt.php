<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class ReadReceipt implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageId;
    public $seen;

    public function __construct($messageId, $seen)
    {
        $this->messageId = $messageId;
        $this->seen = $seen;
        Log::info('ReadReceipt event constructed for message: ' . $this->messageId);
    }

    public function broadcastOn()
    {
        // We use a separate channel for the read receipt event with the message ID in the channel name.
        $channel = new Channel('chat.' . $this->messageId);
        Log::info('ReadReceipt event will broadcast on channel: ' . $channel->name);
        return  $channel;
    }
    
    public function broadcastAs()
    {
        $broadcastAs = 'ReadReceipt';
        Log::info('ReadReceipt event will broadcast as: ' . $broadcastAs);
        return $broadcastAs;
    }
    
    public function broadcastWith()
    {
        $broadcastWith = [
            'messageId' => $this->messageId,
            'seen' => $this->seen,
        ];
        Log::info('ReadReceipt event will broadcast with data: ', $broadcastWith);
        return $broadcastWith;
    }
    
}
