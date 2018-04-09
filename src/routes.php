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
  // print 'length: ' . count($pre_array) . '<br>';
  // print '<pre>' . $pre . '</pre>';

  /*

  ([A-Z]{2,4}) *(\d{3}) *(.*) *(9\d{4}) *
  ([A-Z]{2,4}) *(\d{3}) *(.*) *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d)
  ([A-Z]{2,4}) *(\d{3}) *(.*) *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d).(\d\.\d\d)? *(\d{1,3}) *(\d{1,3}) *(\d{1,3}) *(TBA|\d\d:\d\d) *(TBA|\d\d:\d\d) *
  ([A-Z]{2,4}) *(\d{3}) *(.*) *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d).(\d\.\d\d)? *(\d{1,3}) *(\d{1,3}) *(\d{1,3}) *(TBA|\d\d:\d\d) *(TBA|\d\d:\d\d) *(M| )(T| )(W| )(R| )(F| ) *([A-Z]{1,6}) *([A-Z0-9]{1,11}) *
  ([A-Z]{2,4}) *(\d{3}) *(.*) *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d).(\d\.\d\d)? *(\d{1,3}) *(\d{1,3}) *(\d{1,3}) *(TBA|\d\d:\d\d) *(TBA|\d\d:\d\d) *(M| )(T| )(W| )(R| )(F| ) *([A-Z]{1,6}) *([A-Z0-9 ]{11})([A-Za-z0-9 ]{1,13})
  */


  $headers = [
    'subject',
    'number',
    'title',
    'courseNumber',
    'section',
    'lecLab',
    'campcode',
    'collcode',
    'maxEnroll',
    'currentEnroll',
    'startTime',
    'endTime',
    'M', 'T', 'W', 'R', 'F',
    'credits',
    'building',
    'room',
    'instructor'
  ];
  $matches = [];

  // $courseNumber = preg_match_all(
  //   "/(?'hastitle'(?'subject'[A-Z]{2,4}) *(?'number'\d{3}) *(?'title'.*))? *(?'courseNumber'9\d{4}) *(?'lecLab'[A-Z]{1,5}) *(?'section'[A-Z0-9]{1,3}) *(?'creditsMin'\d\.\d\d).(?'creditsMax'\d\.\d\d)? *(?'maxEnroll'\d{1,3}) *(?'currentEnroll'\d{1,3}) *(?'remaining'\d{1,3})(?:\*XL)? *(?'startTime'TBA|\d\d:\d\d) *(?'endTime'TBA|\d\d:\d\d) *(?'M'M| )(?'T'T| )(?'W'W| )(?'R'R| )(?'F'F| ) *(?'building'[A-Z]{1,6}) *(?'room'[A-Za-z0-9 .\/]{11})(?'instructor'[A-Za-z0-9 ]{1,13})/",
  //   $pre, $matches
  // );
  $courseNumber = preg_match_all(
    "/(?'hasfull'(?'hastitle'(?'subject'[A-Z]{2,4}) *(?'number'\d{3}) *(?'title'.*))? *(?'courseNumber'9\d{4}) *(?'lecLab'[A-Z]{1,5}) *(?'section'[A-Z0-9]{1,3}) *(?'creditsMin'\d\.\d\d).(?'creditsMax'\d\.\d\d)? *(?'maxEnroll'\d{1,3}) *(?'currentEnroll'\d{1,3}) *(?'remaining'\d{1,3})(?:\*XL)? *(?'startTime'TBA|\d\d:\d\d) *(?'endTime'TBA|\d\d:\d\d) *(?'M'M| )(?'T'T| )(?'W'W| )(?'R'R| )(?'F'F| ) *(?'building'[A-Z]{1,6}) *(?'room'[A-Za-z0-9 .\/]{11})(?'instructor'[A-Za-z0-9 ]{1,13}))|(?'justsome'(?'startTime2'TBA|\d\d:\d\d) *(?'endTime2'TBA|\d\d:\d\d) *(?'M2'M| )(?'T2'T| )(?'W2'W| )(?'R2'R| )(?'F2'F| ) *(?'building2'[A-Z]{1,6}) *(?'room2'[A-Za-z0-9 .\/]{11}))/",
    $pre, $matches
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
    // if (intval(substr($matches['startTime'][$i], 0, 2)) < 8) {
    //   $startTime = strval(intval(substr($startTime, 0, 2)) + 12) . substr($matches['startTime'][$i], 2);
    // }
    //
    // if (intval(substr($matches['endTime'][$i], 0, 2)) < 8) {
    //   $endTime = strval(intval(substr($endTime, 0, 2)) + 12) . substr($matches['endTime'][$i], 2);
    // }

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

    // 2: AS
    // 3: 095
    // 4: Foundations of Learning
    // 5: 95221
    // 6: LEC
    // 7: B
    // 8: 1.00
    // 9:
    // 10: 30
    // 11: 0
    // 12: 30
    // 13: 04:40
    // 14: 05:30
    // 15: M
    // 16:
    // 17:
    // 18:
    // 19:
    // 20: OMANEX
    // 21: A202
    // 22: Ringler S
  }

  // print '<pre>';
  // print_r($json);
  // print '</pre>';
  return $response->withJson($json);

  // array_map(function ($line) {
  //   $match = [];
  //   preg_match(
  //     "/(([A-Z]{2,4}) *(\d{3}) *(.*))? *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d).(\d\.\d\d)? *(\d{1,3}) *(\d{1,3}) *(\d{1,3}) *(TBA|\d\d:\d\d) *(TBA|\d\d:\d\d) *(M| )(T| )(W| )(R| )(F| ) *([A-Z]{1,6}) *([A-Z0-9 ]{11})([A-Za-z0-9 ]{1,13})/",
  //     $line, $match
  //   );
  //
  //   if (count($match) > 0) {
  //     $matches[] = $match;
  //   }
  // }, explode('\n', $pre));


  // print 'exploded: ' . count(explode('\n', $pre)) . '<br>';
  // print 'exploded: ' . explode('\n', $pre)[0] . '<br>';
  // print 'matches: ' . count($matches) . '<br>';

  // print '<pre>';
  // print_r($matches);
  // print implode('<br>', $matches[0]) . '<br>';
  // array_map(function ($match) {
  //   print implode(', ', $match) . '<br>';
  // }, $matches);
  // print '</pre>';

  // $pre = $crawler->filter('pre > *')->each(function ($node) {
  //   // print $node->text();
  //   return $node->text();
  // });
  //
  // print 'length: ' . count($pre[0]);
  // print implode('<br>', $pre);

  // return $response->withJson(array('name' => 'jacob', 'age' => 19));
});
