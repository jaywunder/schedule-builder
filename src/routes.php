<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\Stream;

use Goutte\Client;

define('ROOT', '');

// Routes
$app->get(ROOT . '/', function (Request $request, Response $response, array $args) {
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

  $this->logger->info('serving :' . $args['path']);

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


  $courseNumber = preg_match_all(
    "/(([A-Z]{2,4}) *(\d{3}) *(.*))? *(9\d{4}) *([A-Z]{1,5}) *([A-Z0-9]{1,3}) *(\d\.\d\d).(\d\.\d\d)? *(\d{1,3}) *(\d{1,3}) *(\d{1,3}) *(TBA|\d\d:\d\d) *(TBA|\d\d:\d\d) *(M| )(T| )(W| )(R| )(F| ) *([A-Z]{1,6}) *([A-Z0-9 ]{11})([A-Za-z0-9 ]{1,13})/",
    $pre, $matches
  );

  $json = [];
  $currentSubject = '';
  $currentNumber = '';
  $currentTitle = '';
  for ($i = 0; $i < $courseNumber; $i++) {

    if ($matches[2][$i] !== '') {
      $currentSubject = $matches[2][$i];
    }
    if ($matches[3][$i] !== '') {
      $currentNumber = $matches[3][$i];
    }
    if ($matches[4][$i] !== '') {
      $currentTitle = $matches[4][$i];
    }

    $json[] = [
      'subject' => $currentSubject,
      'number' => $currentNumber,
      'title' => $currentTitle,
      'courseNumber' => $matches[5][$i],
      'section' => $matches[7][$i],
      'lecLab' => $matches[6][$i],
      'campcode' => '',
      'collcode' => '',
      'maxEnroll' => $matches[10][$i],
      'currentEnroll' => $matches[11][$i],
      'startTime' => $matches[13][$i],
      'endTime' => $matches[14][$i],
      'days' => $matches[15][$i] . $matches[16][$i] . $matches[17][$i] . $matches[18][$i] . $matches[19][$i],
      'credits' => $matches[9][$i],
      'building' => $matches[20][$i],
      'room' => $matches[21][$i],
      'instructor' => $matches[22][$i],
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
