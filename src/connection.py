import sys
import websocket
import requests
import json
import logging
import random
import string
import time
import threading


class Connection:
    def __init__(self, game_id):
        self.game_id = game_id
        self.client_id = None

        self.websocket = None
        self.ping_timer = None

        self.setup_socket()

    def send_message(self, channel, message):
        packet = {
            'channel': channel
        }

        if self.client_id is not None:
            packet['clientId'] = self.client_id

        for key, value in message.items():
            packet[key] = value

        logging.debug('Sending message')
        logging.debug(packet)

        self.websocket.send(json.dumps(packet))

    def receive_message(self, channel=None):
        result = json.loads(self.websocket.recv())[0]

        if channel is not None:
            while result['channel'] != channel:
                result = json.loads(self.websocket.recv())[0]

        logging.debug('Receiving message')
        logging.debug(result)

        return result

    def handshake(self):
        self.send_message('/meta/handshake', {
            'version': '1.0',
            'minimumVersion': '1.0',
            'supportedConnectionTypes': ('websocket', 'long-polling'),
            'advice': {'timeout': 60000, 'interval': 0}
        })

        result = self.receive_message('/meta/handshake')

        if ('clientId' not in result):
            logging.error('No valid client ID received during handshake')

        self.client_id = result['clientId']

    def connect(self):
        self.send_message('/meta/connect', {
            'connectionType': 'websocket',
            'advice': {'timeout': 0}
        })

        result = self.receive_message('/meta/connect')

    def login(self, nickname):
        self.send_message('/service/controller', {
            'data': {
                'type': 'login',
                'gameid': self.game_id,
                'host': 'kahoot.it',
                'name': nickname,
            }
        })

        while True:
            result = self.receive_message('/service/controller')

            if 'data' in result:
                if result['data']['type'] == 'loginResponse':
                    if 'error' in result['data']:
                        if result['data']['description'] == 'Duplicate name':
                            logging.error(
                                'Duplicate name detected. Trying again with random seed.'
                            )

                            self.login(
                                ''.join(random.choice(string.ascii_lowercase) for i in range(15))
                            )

                            return

                    logging.debug('Successfully logged in')

                    break

    def generate_session_token(self):
        return requests.get(
            'https://kahoot.it/reserve/session/%d' % self.game_id
        ).headers['X-Kahoot-Session-Token']

    def ping_server(self):
        logging.debug('Pinging server')

        self.send_message('/meta/connect', {'connectionType': 'websocket'})

        self.ping_timer = threading.Timer(5.0, self.ping_server)
        self.ping_timer.start()

    def stop_ping(self):
        self.ping_timer.cancel()

    def setup_socket(self):
        self.websocket = websocket.create_connection(
            'wss://kahoot.it/cometd/%d/%s' % (self.game_id, self.generate_session_token()),
            headers={
                'Origin': 'https://kahoot.it',
                'Cookie': 'no.mobitroll.session=%d' % self.game_id
            }
        )

        self.handshake()
        self.connect()
        self.ping_server()
