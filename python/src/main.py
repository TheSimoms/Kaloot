import sys

from multiprocessing import Process
from time import sleep
from random import randint

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException


url = 'http://kahoot.it/'
maximum_wait_time = 300
letter_answers = ['A', 'B', 'C', 'D']
bards = []


def generate_players(number_of_questions):
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


def get_int_input(message=None):
    try:
        return int(input(message))
    except TypeError:
        get_int_input(message)


def populate_answers(threads):
    new_threads = []

    for thread in threads:
        for answer in xrange(4):
            new_thread = list(thread)
            new_thread.append(letter_answers[answer])

            new_threads.append(new_thread)

    return new_threads


def populate_field(field, message):
    field.clear()

    while len(field.get_attribute('value')) == 0:
        field.send_keys(message)


def click_button(browser, selector):
    button = WebDriverWait(browser, maximum_wait_time).until(
        ec.element_to_be_clickable((By.CSS_SELECTOR, selector))
    )
    button.click()

    while True:
        try:
            WebDriverWait(browser, 0.1).until(
                ec.element_to_be_clickable((By.CSS_SELECTOR, selector))
            )
        except TimeoutException:
            return
        except StaleElementReferenceException:
            return


def enter_game(browser, game_id):
    # Enters ID into input field
    field = WebDriverWait(browser, maximum_wait_time).until(
        ec.visibility_of_element_located((By.ID, 'inputSession'))
    )

    populate_field(field, game_id)
    click_button(browser, 'button[data-functional-selector="join-button-game-pin"]')


def register_name(browser, username):
    # Enters username into username field
    field = WebDriverWait(browser, maximum_wait_time).until(
        ec.visibility_of_element_located((By.ID, 'username'))
    )
    populate_field(field, username)
    click_button(browser, 'button[data-functional-selector="join-button-username"]')


def answer_question(browser, answer):
    button = WebDriverWait(browser, maximum_wait_time).until(
        ec.element_to_be_clickable((By.CSS_SELECTOR, '.answer' + answer))
    )
    button.click()


def is_game_lost(browser):
    element = WebDriverWait(browser, maximum_wait_time).until(
        ec.visibility_of_element_located((By.CSS_SELECTOR, '.resultIcon'))
    )

    return element.get_attribute('class').find('incorrect') >= 0


def kaloot(game_id, answers, thread_number, silent=True):
    lost = False
    username = bards[thread_number]

    # Opens a new browser
    if silent:
        browser = webdriver.PhantomJS(service_args=['--ssl-protocol=any'])
        browser.set_window_size(1024, 768)
    else:
        browser = webdriver.Firefox()

    browser.get(url)

    enter_game(browser, game_id)
    register_name(browser, username)

    # Answers the questions
    for answer in answers:
        answer_question(browser, answer)
        lost = is_game_lost(browser)

        if lost:
            browser.quit()
            break

    if not lost:
        sleep(9999)


def main(silent):
    game_id = get_int_input('Game ID: ')
    number_of_questions = get_int_input('Number of questions: ')

    generate_players(number_of_questions)

    threads = [[answer] for answer in letter_answers]
    processes = []

    for i in xrange(number_of_questions-1):
        threads = populate_answers(threads)

    for i in xrange(len(threads)):
        processes.append(Process(target=kaloot, args=(game_id, threads[i], i, silent)))

    for process in processes:
        process.start()

    for process in processes:
        process.join()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        silent = int(sys.argv[1])
    else:
        silent = True

    main(silent)
