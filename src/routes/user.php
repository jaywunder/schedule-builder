<?php
use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

use Models\User;
use Models\Schedule;

$this->get('/user', function (Request $request, Response $response, array $args) {
  $users = $this->db::table('users');
  // TODO: integrate uvm auth with system
  $user = User::find(1);
  // User::find($request->getQueryParam('id'))

  return $response->withJson([
    'user' => $user,
    'schedules' => $user->schedules,
  ]);
});

$this->post('/user', function (Request $request, Response $response, array $args) {
  // $users->insert(['netid' => $args['name']]);

  return $response->withJson(array());
});
