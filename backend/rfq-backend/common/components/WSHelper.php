<?php

namespace common\components;

class WSHelper
{
    public static function push($data)
    {
        try {
            $socket = stream_socket_client('tcp://127.0.0.1:8081', $errno, $errstr, 1);
            if ($socket) {
                fwrite($socket, json_encode($data));
                fclose($socket);
            }
        } catch (\Exception $e) {
            // Ignore errors if WS server is down
        }
    }
}
