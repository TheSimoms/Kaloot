import argparse

from kaloot import RandomKaloot


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    # Different game modes
    modes = {
        'random': RandomKaloot
    }

    parser.add_argument('-g', '--game', help='Game ID', type=int, required=True)
    parser.add_argument('-n', help='Number of bots', type=int, default=100)
    parser.add_argument(
        '-m', '--mode', help='Game mode', choices=modes.keys()
    )
    parser.add_argument('--nicknames', help='Nickname set', choices=('bard'))

    args = parser.parse_args()

    # Start chosen game mode
    modes.get(args.mode, modes['random'])(args)
