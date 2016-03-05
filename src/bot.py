from threading import Thread
from time import sleep
from random import random

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException


URL = 'http://kahoot.it/'


class Bot(Thread):
    def __init__(self, game_id, username, answers, event, master=False, silent=True):
        super(Bot, self).__init__()

        self.game_id = game_id
        self.username = username
        self.answers = answers

        self.event = event

        self.master = master
        self.silent = silent

        self.maximum_wait_time = 300
        self.driver = None

    def wait(self):
        if not self.master:
            self.event.wait()

    def set_lock(self):
        if self.master:
            self.event.clear()

    def open_lock(self):
        if self.master:
            self.event.set()

    def load_page(self):
        if not self.master:
            sleep(random() * 15)

        if self.silent:
            self.driver = webdriver.PhantomJS(service_args=['--ssl-protocol=any'])
        else:
            self.driver = webdriver.Firefox()

        self.driver.set_window_size(1024, 768)

        self.driver.get(URL)

    def populate_field(self, field_id, message):
        field = WebDriverWait(self.driver, self.maximum_wait_time).until(
            ec.visibility_of_element_located((By.ID, field_id))
        )

        field.clear()

        while len(field.get_attribute('value')) == 0:
            field.send_keys(message)

    def click_button(self, selector_type, selector_value):
        button = WebDriverWait(self.driver, self.maximum_wait_time).until(
            ec.element_to_be_clickable((selector_type, selector_value))
        )

        button.click()

        if self.master:
            while True:
                try:
                    WebDriverWait(self.driver, 0.01).until(
                        ec.element_to_be_clickable((selector_type, selector_value))
                    )
                except TimeoutException:
                    break
                except StaleElementReferenceException:
                    break

    def click_button_by_id(self, button_id):
        self.click_button(By.ID, button_id)

    def click_button_by_class(self, button_class_name):
        self.click_button(By.CLASS_NAME, button_class_name)

    def click_button_by_css(self, button_css):
        self.click_button(By.CSS_SELECTOR, button_css)

    def enter_game(self):
        self.populate_field('inputSession', self.game_id)
        self.click_button_by_css('button[data-functional-selector="join-button-game-pin"]')

    def register_name(self):
        self.populate_field('username', self.username)
        self.click_button_by_css('button[data-functional-selector="join-button-username"]')

    def answer_question(self, answer):
        self.click_button_by_class('answer' + answer)

    def run(self):
        self.wait()

        self.load_page()

        self.enter_game()
        self.register_name()

        self.open_lock()

        for answer in self.answers:
            self.set_lock()
            self.wait()

            self.answer_question(answer)

            self.open_lock()
