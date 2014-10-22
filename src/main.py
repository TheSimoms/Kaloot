from multiprocessing import Process

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec


url = "http://kahoot.it/"
maximum_wait_time = 300
letter_answers = ['A', 'B', 'C', 'D']


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


def main():
    game_id = get_int_input("Game ID: ")
    number_of_questions = get_int_input("Number of questions: ")

    threads = [[answer] for answer in letter_answers]
    processes = []

    for i in xrange(number_of_questions-1):
        threads = populate_answers(threads)

    for i in xrange(len(threads)):
        processes.append(Process(target=kaloot, args=(game_id, threads[i], i)))

    for process in processes:
        process.start()

    for process in processes:
        process.join()


def kaloot(game_id, answers, thread_number):
    field = None
    button = None

    # Opens a new browser
    browser = webdriver.PhantomJS()
    browser.get(url)

    # Enters ID into input field
    try:
        field = WebDriverWait(browser, maximum_wait_time).until(
            ec.presence_of_element_located((By.ID, "inputSession"))
        )
    finally:
        field.send_keys(game_id)

    # Clicks "Enter" button
    try:
        button = browser.find_element_by_css_selector('.btn.btn-block.btn-greyscale.join')
    except Exception:
        button = WebDriverWait(browser, maximum_wait_time).until(
            ec.element_to_be_clickable((By.CSS_SELECTOR, ".btn.btn-block.btn-greyscale.join"))
        )
    finally:
        button.click()

    # Enters username into username field
    try:
        field = WebDriverWait(browser, maximum_wait_time).until(
            ec.presence_of_element_located((By.ID, "username"))
        )
    finally:
        field.send_keys("Bard_" + str(thread_number))

    # Clicks "Join" button
    try:
        button = browser.find_element_by_css_selector('.btn.btn-block.btn-greyscale.join')
    except Exception:
        button = WebDriverWait(browser, maximum_wait_time).until(
            ec.element_to_be_clickable((By.CSS_SELECTOR, ".btn.btn-block.btn-greyscale.join"))
        )
    finally:
        button.click()

    # Answers the questions
    for answer in answers:
        try:
            button = WebDriverWait(browser, maximum_wait_time).until(
                ec.element_to_be_clickable((By.CSS_SELECTOR, ".answer" + answer))
            )
        finally:
            button.click()

            try:
                button = WebDriverWait(browser, maximum_wait_time).until(
                    ec.invisibility_of_element_located((By.CSS_SELECTOR, ".answer" + answer))
                )
            finally:
                pass

main()
