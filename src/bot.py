import logging
import random

from threading import Thread

from game import Game


class Bot(Thread):
    def __init__(self, index, game_id, nickname=None):
        Thread.__init__(self)

        self.index = index
        self.game = Game(index, game_id, nickname)

    def run(self):
        self.game.start()
        self.answer_questions()

    def answer_question(self, question):
        raise NotImplementedError

    def answer_questions(self):
        while True:
            question = self.game.get_next_question()

            if question is None:
                break

            question_number = question.index + 1

            if question.awaiting_question:
                logging.info('Bot %d; Awaiting question %d' % (self.index, question_number))
            else:
                logging.info('Bot %d; Answering question %d' % (self.index, question_number))

                self.answer_question(question)


class RandomBot(Bot):
    def __init__(self, index, game_id, nickname=None):
        super().__init__(index, game_id, nickname)

    def answer_question(self, question):
        self.game.answer_question(random.randint(0, question.number_of_answers - 1))


class DeterministicBot(Bot):
    def __init__(self, index, game_id, nickname=None, answers=[]):
        self.answers = answers
        self.number_of_answers = len(answers)

        super().__init__(index, game_id, nickname)

    def answer_question(self, question):
        if (self.number_of_answers > question.index and
                len(question.answers) > self.answers[question.index]):
            self.game.answer_question(self.answers[question.index])
        else:
            self.game.answer_question(random.randint(0, question.number_of_answers - 1))
