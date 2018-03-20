<?php
use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

use Models\User;
use Models\Schedule;

$this->post('/schedule/create', function (Request $request, Response $response, array $args) {

  $this->logger->info();

  Schedule::create([
    'name' => $request->getParsedBody()['name'],
    'user_id' => 1,
  ]);

  return $response->withJson([ 'success' => true ]);
});
