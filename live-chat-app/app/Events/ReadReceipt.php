<?php
namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReadReceipt implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $username;
    public $messageId;
    public $seen;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($username, $messageId, $seen)
    {
        $this->username = $username;
        $this->messageId = $messageId;
        $this->seen = $seen;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new \Illuminate\Broadcasting\Channel('chat');
    }

}