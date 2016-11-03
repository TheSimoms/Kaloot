import websocket
import requests
import json
import logging
import random
import string
import time
import socket

from threading import Timer


ERROR_RETRY_DELAY = 3.0


class Connection:
    def __init__(self, index, game):
        self.index = index
        self.game = game

        self.client_id = None

        self.websocket = None
        self.ping_timer = None

    def start_game(self):
        self.setup_socket()
        self.login(self.game.nickname)

    def send_message(self, channel, message):
        packet = {
            'channel': channel
        }

        if self.client_id is not None:
            packet['clientId'] = self.client_id

        for key, value in message.items():
            packet[key] = value

        logging.debug('Bot %d; Sending message' % self.index)
        logging.debug(packet)

        self.websocket.send(json.dumps(packet))

    def receive_message(self, channel=None):
        result = json.loads(self.websocket.recv())[0]

        if channel is not None:
            while result['channel'] != channel:
                result = json.loads(self.websocket.recv())[0]

        logging.debug('Bot %d; Receiving message' % self.index)
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
            logging.error('Bot %d; No valid client ID received during handshake' % self.index)

        self.client_id = result['clientId']

    def connect(self):
        self.send_message('/meta/connect', {
            'connectionType': 'websocket',
            'advice': {'timeout': 0}
        })

        result = self.receive_message('/meta/connect')

    def random_nickname(self):
        if self.game.prefix is not None:
            nickname = '%s ' % self.game.prefix
        else:
            nickname = ''

        for _ in range(0, 15 - len(nickname)):
            nickname += random.choice(string.ascii_lowercase)

        return nickname

    def login(self, nickname):
        if nickname is None:
            nickname = self.random_nickname()

        self.send_message('/service/controller', {
            'data': {
                'type': 'login',
                'gameid': self.game.game_id,
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
                                'Bot %d; Duplicate name detected. '
                                'Trying again with random seed' % self.index

                            )

                            self.login(self.random_nickname())

                            return

                    logging.info('Bot %d; Successfully logged in as %s' % (self.index, nickname))

                    self.game.nickname = nickname

                    break

    def generate_session_token(self):
        try:
            return requests.get(
                'https://kahoot.it/reserve/session/%d' % self.game.game_id
            ).headers['X-Kahoot-Session-Token']
        except KeyError:
            return self.generate_session_token()
        except (
            requests.exceptions.ConnectionError, websocket._exceptions.WebSocketBadStatusException
        ):
            time.sleep(random.uniform(0.0, ERROR_RETRY_DELAY))

            return self.generate_session_token()

    def ping_server(self):
        logging.debug('Bot %d; Pinging server' % self.index)

        self.send_message('/meta/connect', {'connectionType': 'websocket'})

        self.ping_timer = Timer(5.0, self.ping_server)
        self.ping_timer.start()

    def stop_ping(self):
        self.ping_timer.cancel()

    def setup_socket(self):
        try:
            self.websocket = websocket.create_connection(
                'wss://kahoot.it/cometd/%d/%s' % (
                    self.game.game_id, self.generate_session_token()
                ),
                headers={
                    'Origin': 'https://kahoot.it',
                    'Cookie': 'no.mobitroll.session=%d' % self.game.game_id
                }
            )

            self.handshake()
            self.connect()
            self.ping_server()
        except socket.gaierror:
            time.sleep(random.uniform(0.0, ERROR_RETRY_DELAY))

            self.setup_socket()
