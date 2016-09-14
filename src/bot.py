import logging

from game import Game


class Bot:
    def __init__(self, game_id, nickname):
        self.game = Game(game_id, nickname)

    def answer_questions(self):
        while True:
            question = self.game.get_next_question()

            if question is None:
                break

            question_number = question.index + 1

            if question.awaiting_question:
                logging.debug('Awaiting question %d' % question_number)
            else:
                logging.debug('Answering question %d' % question_number)

                self.game.answer_question(1)
