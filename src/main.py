# -*- coding: utf-8 -*-

import sys

from random import randint
from threading import Event

from bot import Bot


LETTER_ANSWERS = ['A', 'B', 'C', 'D']


class Kaloot:
    def __init__(self, game_id, number_of_questions, silent=True):
        self.game_id = game_id
        self.number_of_questions = number_of_questions

        self.bards = self.generate_players(number_of_questions)
        self.silent = silent

    @staticmethod
    def generate_players(number_of_questions):
        bards = []

        try:
            for line in open('bards.txt').readlines():
                bard = line.strip()

                if len(bard) > 0:
                    bards.append(bard)
        finally:
            while len(bards) < 4 ** number_of_questions:
                bard = None

                while True:
                    bard = 'Bard %d' % randint(0, 99999)

                    if bard not in bards:
                        break

                bards.append(bard)

        return bards

    @staticmethod
    def populate_answers(threads):
        new_threads = []

        for thread in threads:
            for answer in range(4):
                new_thread = list(thread)
                new_thread.append(LETTER_ANSWERS[answer])

                new_threads.append(new_thread)

        return new_threads

    def generate_answers(self):
        bot_answer_sequences = [[answer] for answer in LETTER_ANSWERS]

        for _ in range(self.number_of_questions - 1):
            bot_answer_sequences = self.populate_answers(bot_answer_sequences)

        return bot_answer_sequences

    def create_bot(self, username, answers, event, master=False):
        return Bot(self.game_id, username, answers, event, master, self.silent)

    def create_bots(self):
        bot_answer_sequences = self.generate_answers()
        event = Event()

        bots = [
            self.create_bot(self.bards[0], bot_answer_sequences[0], event, True)
        ]

        bots.extend(
            self.create_bot(
                self.bards[i], bot_answer_sequences[i], event, False
            ) for i in range(1, len(bot_answer_sequences))
        )

        return bots

    def run(self):
        bots = self.create_bots()

        for bot in bots:
            bot.start()

        for bot in bots:
            bot.join()

        print('Game over!')


def get_int_input(message=None):
    try:
        return int(input(message))
    except (TypeError, ValueError):
        return get_int_input(message)


def main():
    if len(sys.argv) > 1:
        silent = bool(sys.argv[1])
    else:
        silent = True

    game_id = get_int_input('Game ID: ')
    number_of_questions = get_int_input('Number of questions: ')

    Kaloot(game_id, number_of_questions, silent).run()


if __name__ == '__main__':
    main()
