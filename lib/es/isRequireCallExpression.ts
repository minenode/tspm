import isIdentifier from "./isIdentifier";
import isSimpleCallExpression from "./isSimpleCallExpression";
import isSimpleLiteral from "./isSimpleLiteral";
import RequireCallExpression from "./RequireCallExpression";
import { Node } from "estree";

export default function isRequireCallExpression(
  data: Node | undefined | null
): data is RequireCallExpression {
  return (
    data !== null &&
    data !== undefined &&
    isSimpleCallExpression(data) &&
    isIdentifier(data.callee) &&
    data.callee.name === "require" &&
    data.arguments.length === 1 &&
    isSimpleLiteral(data.arguments[0])
  );
}
