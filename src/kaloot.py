import os
import logging

import bot


class RandomKaloot:
    def __init__(self, args):
        threads = []
        nicknames = None

        if args.nicknames is not None:
            nicknames = []

            for path in args.nicknames.split(','):
                try:
                    with open('%s/nicknames/%s.txt' % (os.path.dirname(__file__), path)) as f:
                        nicknames.extend([nickname.strip() for nickname in f.readlines()])
                except FileNotFoundError:
                    logging.error('File %s.txt not found in nicknames folder' % path)

        for i in range(args.n):
            arguments = {
                'index': i,
                'game_id': args.game,
                'prefix': args.prefix
            }

            if nicknames is not None and i < len(nicknames):
                arguments['nickname'] = nicknames[i]

            threads.append(bot.RandomBot(**arguments))

            threads[i].start()

        for i in range(args.n):
            threads[i].join()
