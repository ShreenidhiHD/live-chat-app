<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Chat;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function chats()
    {
        return $this->hasMany(Chat::class, 'customer_id');
    }

    public function agentChats()
    {
        return $this->hasMany(Chat::class, 'agent_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function ownedCompany()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
