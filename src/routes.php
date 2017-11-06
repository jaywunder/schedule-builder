<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

// use Models\User;


// Routes

// $app->get('/api/user', function (Request $request, Response $response, array $args) {
//
//   return $response->withJson(var_dump($this));
//
//   return $response->withJson(array('name' => 'jacob', 'age' => 19));
//
// });

$app->get('/{path:.*}', function (Request $request, Response $response, array $args) {
  $users = $this->db::table('users');

  // Sample log message
  // $this->logger->info(__DIR__ . '/../front/build/favicon.png');
  $this->logger->info('serving ' . $args['path'] . ' yup');

  // $this->db::table('users')->insert(['netid' => $args['name']]);
  // return $response->withJson(var_dump( $users->get() ));
  // return $response->withJson(var_dump( $args ));

  // TODO: check if the string has a "/../" in it

  if (!isset($args['path']))
    $args['path'] = 'index.html';

  $path = __DIR__ . '/../front/build/' . $args['path'];
  $file = fopen($path, 'rb');

  return $response
    ->withHeader('Content-Type', mime_content_type($file))
    ->withBody(new Stream($file));

  // Render index view
  // return $this->renderer->render($response, $args['path'], $args);
});
