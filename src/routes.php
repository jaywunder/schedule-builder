<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

// Routes
$app->get('/', function (Request $request, Response $response, array $args) {
  $mimes = new \Mimey\MimeTypes;
  $path = __DIR__ . '/../front/build/index.html';
  $file = fopen($path, 'rb');
  $type = $mimes->getMimeType(end(explode('.', $path)));

  return $response
    ->withHeader('Content-Type', $type)
    ->withBody(new Stream($file));
});

$app->get('/front/{path:.*}', function (Request $request, Response $response, array $args) {
  $users = $this->db::table('users');
  $mimes = new \Mimey\MimeTypes;

  // $this->db::table('users')->insert(['netid' => $args['name']]);
  // return $response->withJson(var_dump( $users->get() ));
  // return $response->withJson(var_dump( $args ));

  // TODO: check if the string has a "/../" in it

  $this->logger->info('serving :' . $args['path']);

  if ($args['path'] == '/') $args['path'] = 'index.html';

  $path = __DIR__ . '/../front/build/' . $args['path'];
  $file = fopen($path, 'rb');
  $type = $mimes->getMimeType(end(explode('.', $path)));

  return $response
    ->withHeader('Content-Type', $type)
    ->withBody(new Stream($file));

  // Render index view
  // return $this->renderer->render($response, $args['path'], $args);
});


$app->get('/api/user', function (Request $request, Response $response, array $args) {

  // return $response->withJson(var_dump($this));

  return $response->withJson(array('name' => 'jacob', 'age' => 19));

});
