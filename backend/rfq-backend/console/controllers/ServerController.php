<?php

namespace console\controllers;

use console\components\WebSocketServer;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use yii\console\Controller;
use React\EventLoop\Factory;
use React\Socket\Server;
use React\Socket\ConnectionInterface;

class ServerController extends Controller
{
    public function actionIndex()
    {
        // Suppress PHP 8.2 dynamic property deprecation warnings from Ratchet
        error_reporting(E_ALL & ~E_DEPRECATED);

        echo "Starting WebSocket Server on port 8082...\n";

        $loop = Factory::create();
        $handler = new WebSocketServer();

        // WebSocket Server (Public)
        $webSock = new Server('0.0.0.0:8082', $loop);
        $server = new IoServer(
            new HttpServer(
                new WsServer(
                    $handler
                )
            ),
            $webSock,
            $loop
        );

        // Internal TCP Server (for Backend API to trigger events)
        $internalSock = new Server('127.0.0.1:8081', $loop);
        $internalSock->on('connection', function (ConnectionInterface $connection) use ($handler) {
            echo "Internal trigger connected\n";
            $connection->on('data', function ($data) use ($handler) {
                echo "Broadcasting: " . $data . "\n";
                $handler->broadcast($data);
            });
        });

        echo "Listening for internal triggers on 127.0.0.1:8081\n";
        
        $loop->run();
    }
}
