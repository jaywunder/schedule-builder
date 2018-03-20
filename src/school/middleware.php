<?php

namespace School;

use Slim\Http\Request;
use Slim\Http\Response;

function userMiddleware(Request $request, Response $response, callable $next) {
  $request->user = [
    'id' => 1,
    'netid' => 'jwunder',
  ];
}
