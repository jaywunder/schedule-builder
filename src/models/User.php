<?php
namespace Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{

  protected $table = 'users';
  protected $fillable = ['netid'];

  public function schedules() {
    return $this->hasMany('Models\Schedule');
  }

}
