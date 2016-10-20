import os

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
                    pass

        for i in range(args.n):
            arguments = [i, args.game]

            if nicknames is not None and len(nicknames) is not 0:
                try:
                    arguments.append(nicknames[i])
                except IndexError:
                    pass

            threads.append(bot.RandomBot(*arguments))

            threads[i].start()

        for i in range(args.n):
            threads[i].join()
