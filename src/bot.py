import logging
import random
import time
import random

from threading import Thread

from game import Game


class Bot(Thread):
    def __init__(self, **kwargs):
        Thread.__init__(self)

        self.index = kwargs.get('index')
        self.delay = kwargs.get('delay', None)

        self.game = Game(**kwargs)

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

                if self.delay is not None and self.delay > 0:
                    time.sleep(random.uniform(0, self.delay))

                self.answer_question(question)


class RandomBot(Bot):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def answer_question(self, question):
        self.game.answer_question(random.randint(0, question.number_of_answers - 1))


class DeterministicBot(Bot):
    def __init__(self, answers=[], **kwargs):
        self.answers = answers
        self.number_of_answers = len(answers)

        super().__init__(**kwargs)

    def answer_question(self, question):
        if (self.number_of_answers > question.index and
                len(question.answers) > self.answers[question.index]):
            self.game.answer_question(self.answers[question.index])
        else:
            self.game.answer_question(random.randint(0, question.number_of_answers - 1))
