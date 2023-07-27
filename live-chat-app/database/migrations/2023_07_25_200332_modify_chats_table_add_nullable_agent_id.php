<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyChatsTableAddNullableAgentId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->unsignedBigInteger('agent_id')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->unsignedBigInteger('agent_id')->change();
        });
    }
}
