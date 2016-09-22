import bot


class RandomKaloot:
    def __init__(self, args):
        threads = []

        for i in range(args.n):
            threads.append(bot.RandomBot(i, args.game))

            threads[i].start()

        for i in range(args.n):
            threads[i].join()
