import arg from 'arg';

export type Flags = {
  help: boolean;
  version: boolean;
  float: boolean;
  verbose: boolean;
};

export type Options = {
  flags: Flags;
  command?: string;
  subCommand?: string;
  parameters?: string[];
};

const maskNumberWithTrace = (rawArgument: string): string => {
  if (/^-[0-9]\d*/.test(rawArgument)) {
    return `negative_${rawArgument}`;
  }
  return rawArgument;
};

const unmaskNumberWithTrace = (argument: string): string => {
  return argument.replace('negative_', '');
};

export function parseArgumentsIntoOptions(rawArgs: string[]): Options {
  const args = arg(
    {
      '--help': Boolean,
      '--version': Boolean,
      '--float': Boolean,
      '--negative': [String],
      '--verbose': Boolean,
      '-h': '--help',
      '-v': '--version',
      '-f': '--float',
      '-n': '--negative'
    },
    {
      argv: rawArgs.slice(2).map(maskNumberWithTrace)
    }
  );

  const possiblesSubCommands: { [key: string]: string[] } = {
    add: ['even', 'odd']
  };

  const command = args._[0];

  let subCommand: string | null = null;
  if (possiblesSubCommands[command]) {
    subCommand =
      possiblesSubCommands[command].find(
        argInternal => args._[1] === argInternal
      ) || null;
  }

  return {
    flags: {
      help: args['--help'] || false,
      version: args['--version'] || false,
      float: args['--float'] || false,
      verbose: args['--verbose'] || false
    },
    command: args._[0],
    ...(subCommand && { subCommand }),
    parameters: [
      ...args._.slice(subCommand ? 2 : 1).map(unmaskNumberWithTrace),
      ...(args['--negative']
        ? args['--negative'].map(number => `-${number}`)
        : [])
    ]
  };
}
