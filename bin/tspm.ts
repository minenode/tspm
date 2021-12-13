import main from "../lib/main";

process.title = "ef-tspm";

main(process.argv)
  .then((status) => process.exit(status))
  .catch(({ message }) => {
    process.stderr.write(`Fatal Error: ${message}\n`);
    process.exit(69);
  });
