import * as process from "process";
import * as yargs from "yargs";

import convert, { File } from "./convert";
import TspmError from "./Error";
import ParseError from "./error/Parse";

export interface IOptions {
  tsconfig: string;
  projectRoot: string;
  verbose: boolean;
  silent: boolean;
}

export async function parseArguments(
  args: ReadonlyArray<string>
): Promise<IOptions> {
  const parser = yargs
    .usage("Usage: ef-tspm")
    .option("verbose", {
      alias: "v",
      default: false,
      description: "Logs more information to the console",
    })
    .option("silent", {
      alias: "s",
      default: false,
      description: "Logs no information but errors to the console",
    })
    .option("tsconfig", {
      alias: "c",
      default: `${process.cwd()}/tsconfig.json`,
      description: "Determines the TypeScript configuration to read",
    })
    .option("projectRoot", {
      alias: "r",
      default: process.cwd(),
      description: "The location of the TypeScript project root",
    })
    .example(
      "$0 -c ./tsconfig.json",
      "Performs mapping of the files specified in the TypeScript configuration"
    )
    .epilogue(
      "Performs mapping of the TypeScript module lookups to the correct paths. The executable uses the " +
        "TypeScript configuration to determine the input and output files. It then parses the output files and " +
        "updates any path mapping to the correct relative path"
    );

  const { tsconfig, projectRoot, silent, verbose } = await parser.parse(
    args.slice()
  );

  const options: IOptions = {
    tsconfig,
    projectRoot,
    verbose,
    silent,
  };
  return options;
}

export async function map(options: IOptions): Promise<number> {
  const { projectRoot: root, silent, verbose } = options;

  try {
    const files = new Set<File>();
    for await (const mapped of convert(options)) {
      if (!silent && verbose) {
        const { original, path, module } = mapped;
        const relative = module.relative(root);
        process.stdout.write(
          `Mapped '${relative}': '${original}' → '${path}'\n`
        );
      }
      files.add(mapped.file);
    }
    for (const file of files) {
      await file.write();
      if (!silent) {
        const relative = file.destination.relative(root);
        process.stdout.write(`Wrote '${relative}'\n`);
      }
    }
    return 0;
  } catch (error) {
    if (error instanceof ParseError) {
      const {
        error: msg,
        file: { destination: path },
        before: pre,
        target: token,
        after: post,
        column,
        line,
      } = error;
      const formatted =
        `JavaScript parsing error: ` +
        `${msg} (${path}:${line}:${column}): '${pre}${token}${post}'`;
      process.stderr.write(`${formatted}\n`);
      return 3;
    } else if (error instanceof TspmError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }

    console.log(error);

    return 5;
  }
}

export default async function main(
  args: ReadonlyArray<string>
): Promise<number> {
  return map(await parseArguments(args));
}
