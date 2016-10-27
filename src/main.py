import argparse

from kaloot import RandomKaloot


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    # Different game modes
    modes = {
        'random': RandomKaloot
    }

    parser.add_argument('-g', '--game', type=int, required=True, help='Game ID')
    parser.add_argument('-n', type=int, default=100, help='Number of bots')
    parser.add_argument(
        '-m', '--mode', choices=modes.keys(), help='Game mode'
    )
    parser.add_argument(
        '--nicknames',
        type=str,
        help='Nickname sets. Use either full path to file, or name of file in "nicknames" folder.'
             ' Defaults to all files in "nicknames" folder. To disable, type "None".' +
             ' Comma-separated'
    )
    parser.add_argument(
        '--prefix', type=str, default='Bard', help='Prefix to add to random nicknames'
    )
    parser.add_argument(
        '--delay', type=float,
        help='Adds delay to bot\'s answer. Randomly waits in the range of [0, DELAY) seconds' +
             ' before each answer'
    )

    args = parser.parse_args()

    # Start chosen game mode
    modes.get(args.mode, modes['random'])(args)
