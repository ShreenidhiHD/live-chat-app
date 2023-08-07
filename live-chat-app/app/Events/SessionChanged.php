<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
class SessionChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $userId;
    public $status;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($userId, $status)
    {
        \Log::info('user is broadcast is constructing');
        $this->userId = $userId;
        $this->status = $status; // can be 'online' or 'offline'
        \Log::info('user is broadcast is constructed successfully '. $status);
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        \Log::info('user is broadcasted on');
        return new Channel("user.{$this->userId}");
    }
    public function broadcastWith()
    {
        \Log::info('user is broadcasted with');
        return [
            'userId' => $this->userId,
            'status' => $this->status,
        ];
    }
}