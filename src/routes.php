<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

use Goutte\Client;

define('ROOT', '/schedule-builder/public/index.php');

// Routes
$app->get(ROOT . '/home', function (Request $request, Response $response, array $args) {
  $mimes = new \Mimey\MimeTypes;
  $path = __DIR__ . '/../front/build/index.html';
  $file = fopen($path, 'rb');
  $tmp = explode('.', $path);
  $type = $mimes->getMimeType(end($tmp));

  return $response
    ->withHeader('Content-Type', $type)
    ->withBody(new Stream($file));
});

$app->get(ROOT . '/front/{path:.*}', function (Request $request, Response $response, array $args) {
  $users = $this->db::table('users');
  $mimes = new \Mimey\MimeTypes;

  // $this->db::table('users')->insert(['netid' => $args['name']]);
  // return $response->withJson(var_dump( $users->get() ));
  // return $response->withJson(var_dump( $args ));

  // TODO: check if the string has a "/../" in it
  if ($args['path'] == '/') $args['path'] = 'index.html';

  $path = __DIR__ . '/../front/build/' . $args['path'];
  $file = fopen($path, 'rb');
  $tmp = explode('.', $path);
  $type = $mimes->getMimeType(end($tmp));

  return $response
    ->withHeader('Content-Type', $type)
    ->withBody(new Stream($file));

  // Render index view
  // return $this->renderer->render($response, $args['path'], $args);
});

$app->get(ROOT . '/api/user', function (Request $request, Response $response, array $args) {

  // return $response->withJson(var_dump($this));

  return $response->withJson(array('name' => 'jacob', 'age' => 19));

});

$app->get(ROOT . '/api/scrape', function (Request $request, Response $response, array $args) {

  $client = new Client();
  $crawler = $client->request('GET', 'https://giraffe.uvm.edu/~rgweb/batch/swrsectc_fall_soc_201809/all_sections.html');

  $preArray = $crawler->filter('pre')->each(function ($node) {
    return $node->text();
  });
  $pre = $preArray[0];

  $matches = [];

  $courseNumber = preg_match_all(
    "/(?'hasfull'(?'hastitle'(?'subject'[A-Z]{2,4}) *(?'number'\d{3}) *(?'title'.*))? *(?'courseNumber'9\d{4}) *(?'lecLab'[A-Z]{1,5}) *(?'section'[A-Z0-9]{1,3}) *(?'creditsMin'\d\.\d\d).(?'creditsMax'\d\.\d\d)? *(?'maxEnroll'\d{1,3}) *(?'currentEnroll'\d{1,3}) *(?'remaining'\d{1,3})(?:\*XL)? *(?'startTime'TBA|\d\d:\d\d) *(?'endTime'TBA|\d\d:\d\d) *(?'M'M| )(?'T'T| )(?'W'W| )(?'R'R| )(?'F'F| ) *(?'building'[A-Z]{1,6}) *(?'room'[A-Za-z0-9 .\/]{11})(?'instructor'[A-Za-z0-9 ]{1,13}))|(?'justsome'(?'startTime2'TBA|\d\d:\d\d) *(?'endTime2'TBA|\d\d:\d\d) *(?'M2'M| )(?'T2'T| )(?'W2'W| )(?'R2'R| )(?'F2'F| ) *(?'building2'[A-Z]{1,6}) *(?'room2'[A-Za-z0-9 .\/]{11}))/",
    $pre, $matchess
  );

  $json = [];
  $currentSubject = '';
  $currentNumber = '';
  $currentTitle = '';
  $lastFull = -1;
  for ($i = 0; $i < $courseNumber; $i++) {

    if ($matches['hasfull'][$i] !== '') { $lastFull = $i; }

    if ($matches['subject'][$i] !== '') {
      $currentSubject = $matches['subject'][$i];
    }
    if ($matches['number'][$i] !== '') {
      $currentNumber = $matches['number'][$i];
    }
    if ($matches['title'][$i] !== '') {
      $currentTitle = $matches['title'][$i];
    }

    $startTime = $matches['startTime'][$i] . '';
    $endTime = $matches['endTime'][$i] . '';
    $days = $matches['M'][$i] . $matches['T'][$i] . $matches['W'][$i] . $matches['R'][$i] . $matches['F'][$i];
    $building = $matches['building'][$i];
    $room = $matches['room'][$i];

    if ($lastFull !== $i) {
      $startTime = $matches['startTime2'][$i] . '';
      $endTime = $matches['endTime2'][$i] . '';
      $days = $matches['M2'][$i] . $matches['T2'][$i] . $matches['W2'][$i] . $matches['R2'][$i] . $matches['F2'][$i];
      $building = $matches['building2'][$i];
      $room = $matches['room2'][$i];
    }

    if (intval(substr($startTime, 0, 2)) < 8) {
      $startTime = strval(intval(substr($startTime, 0, 2)) + 12) . substr($startTime, 2);
      $endTime = strval(intval(substr($endTime, 0, 2)) + 12) . substr($endTime, 2);
    }

    if (intval(substr($endTime, 0, 2)) < 8) {
      $endTime = strval(intval(substr($endTime, 0, 2)) + 12) . substr($endTime, 2);
    }

    $json[] = [
      'subject' => $currentSubject,
      'number' => $currentNumber,
      'title' => $currentTitle,
      'courseNumber' => $matches['courseNumber'][$lastFull],
      'section' => $matches['section'][$lastFull],
      'lecLab' => $matches['lecLab'][$lastFull],
      'campcode' => '',
      'collcode' => '',
      'maxEnroll' => $matches['maxEnroll'][$lastFull],
      'currentEnroll' => $matches['currentEnroll'][$lastFull],
      'startTime' => $startTime,
      'endTime' => $endTime,
      'days' => $days,
      'credits' => $matches['creditsMin'][$lastFull],
      'building' => $building,
      'room' => $room,
      'instructor' => $matches['instructor'][$lastFull],
      'netId' => '',
      'email' => ''
    ];
  }

  return $response->withJson($json);
});
