<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'website_url',
        'website_id',
    ];

    public function agents()
    {
        return $this->hasMany(Agent::class);
    }

    public function chats()
    {
        return $this->hasMany(Chat::class);
    }
}
