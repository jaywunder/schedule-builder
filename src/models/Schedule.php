<?php
namespace Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
  protected $table = 'schedules';
  protected $fillable = ['name'];

  function user() {
    return $this->hasOne('Models\User');
  }

}
