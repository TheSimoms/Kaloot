import json
import logging

from connection import Connection


class Question:
    def __init__(self, awaiting_question, index, number_of_answers, answers):
        self.awaiting_question = awaiting_question
        self.index = index
        self.number_of_answers = number_of_answers
        self.answers = answers


class Game:
    def __init__(self, index, game_id, nickname=None, prefix=None):
        self.index = index
        self.game_id = game_id
        self.nickname = nickname
        self.prefix = prefix

    def start(self):
        self.connection = Connection(self.index, self)
        self.connection.start_game()

    def game_completed(self, results):
        logging.info(
            'Bot %d; Game completed. Nickname: %s. Ranked #%d of %d. %d of %d correct answers' % (
                self.index, self.nickname, results['rank'], results['playerCount'],
                results['correctCount'], len(results['answers'])
            )
        )

        self.connection.stop_ping()

    def get_next_question(self):
        while True:
            result = self.connection.receive_message('/service/player')

            if 'data' in result:
                data = result['data']
            else:
                continue

            if 'id' in data:
                awaiting_question = data['id'] == 1
            else:
                continue

            if 'content' in data:
                content = json.loads(data['content'])
            else:
                continue

            if 'playerCount' in content:
                self.game_completed(content)

                return None

            if ('quizQuestionAnswers' not in content or 'questionIndex' not in content or
                    'answerMap' not in content):
                continue

            quiz_question_answers = content['quizQuestionAnswers']
            question_index = content['questionIndex']
            answers = content['answerMap']

            if question_index >= len(quiz_question_answers) or question_index < 0:
                logging.error(
                    'Bot %d; Invalid question index; %s' % (self.index, str(question_index))
                )

                return question_index >= len(quiz_question_answers)

            number_of_answers = quiz_question_answers[question_index]

            return Question(awaiting_question, question_index, number_of_answers, answers)

    def answer_question(self, answer_index):
        self.connection.send_message('/service/controller', {
            'data': {
                'id': 6,
                'type': 'message',
                'gameid': self.game_id,
                'host': 'kahoot.it',
                'content': json.dumps({
                    'choice': answer_index,
                    'meta': {
                        'lag': 22,
                        'device': {
                            'userAgent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) ' +
                                         'Gecko/20100101 Firefox/48.0',
                            'screen': {
                                'width': 1920,
                                'height': 1080,
                            }
                        }
                    }
                })
            }
        })

        result = self.connection.receive_message('/service/controller')

        if not result['successful']:
            logging.error('Bot %d; Was not able to answer question' % self.index)
