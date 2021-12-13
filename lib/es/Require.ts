import RequireCallExpression from "./RequireCallExpression";

import Declaration, { IOptions as IDeclarationOptions } from "./Declaration";

export type Interface = RequireCallExpression;

export type IOptions = IDeclarationOptions<Interface>;

export default class Require extends Declaration<Interface> {}
