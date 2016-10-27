import os
import logging
import glob

import bot


class Kaloot:
    def __init__(self, args):
        self.nicknames = self.parse_nicknames(args)

    def parse_nicknames(self, args):
        nickname_files = None
        nickname_path = '%s/nicknames' % os.path.dirname(__file__)

        if args.nicknames is None:
            nickname_files = glob.glob('%s/*.txt' % nickname_path)
        elif args.nicknames != 'None':
            nickname_files = []

            for filename in args.nicknames.split(','):
                if os.path.isfile(filename):
                    nickname_files.append(filename)
                else:
                    nickname_file = '%s/%s.txt' % (nickname_path, filename)

                    if os.path.isfile(nickname_file):
                        nickname_files.append(nickname_file)

        if nickname_files:
            return self.fetch_nicknames(nickname_files)

    @staticmethod
    def fetch_nicknames(nickname_files):
        nicknames = set()

        for filename in nickname_files:
            try:
                with open(filename) as f:
                    nicknames |= set([
                        nickname.strip() for nickname in f.readlines() if len(nickname.strip()) > 0
                    ])
            except FileNotFoundError:
                logging.error('File %s.txt not found in nicknames folder' % filename)

        return list(nicknames)


class RandomKaloot(Kaloot):
    def __init__(self, args):
        super(RandomKaloot, self).__init__(args)

        threads = []

        for i in range(args.n):
            arguments = {
                'index': i,
                'game_id': args.game,
                'prefix': args.prefix
            }

            if self.nicknames is not None and i < len(self.nicknames):
                arguments['nickname'] = self.nicknames[i]

            threads.append(bot.RandomBot(**arguments))

            threads[i].start()

        for i in range(args.n):
            threads[i].join()
