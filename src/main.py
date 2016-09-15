import bot
import time


if __name__ == '__main__':
    threads = []

    game_id = 202686

    for i in range(256):
        threads.append(bot.RandomBot(i, game_id, 'Derp'))

        threads[i].start()

    for i in range(256):
        threads[i].join()
