import { DeclarationInterface as Interface } from "../convert";
import Declaration from "../Declaration";
import TspmError from "../Error";
import Path from "../Path";

export interface IOptions {
  path: string;
  module: Path;
  declaration: Declaration<Interface>;
}

export default class ResolutionError extends TspmError {
  readonly path: string;
  readonly module: Path;
  readonly declaration: Declaration<Interface>;

  constructor({ path, module, declaration }: IOptions) {
    super(`Failed to resolve '${path}' in '${module}'`);
    this.path = path;
    this.module = module;
    this.declaration = declaration;
  }
}
