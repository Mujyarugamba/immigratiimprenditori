export const PRODUCTION_PROJECT_REF = "hvfvfatlaspcpszgizhg";

function fail(message) {
  throw new Error(`REFUSED: ${message}`);
}

function takeValue(argv, index, name) {
  const token = argv[index];
  const prefix = `${name}=`;
  if (token.startsWith(prefix)) {
    const value = token.slice(prefix.length);
    if (!value) fail(`${name} requires a value`);
    return { value, consumed: 1 };
  }
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${name} requires a value`);
  return { value, consumed: 2 };
}

export function parseGuardedCommand(
  argv,
  {
    operation,
    modes,
    writeModes,
    defaultMode = null,
    expectedProjectRef = PRODUCTION_PROJECT_REF,
  },
) {
  const seen = new Set();
  let apply = false;
  let yes = false;
  let help = false;
  let projectRef = null;
  let mode = defaultMode;

  for (let i = 0; i < argv.length; ) {
    const token = argv[i];
    const name = token.split("=", 1)[0];
    if (!["--apply", "--yes", "--help", "--project-ref", "--mode"].includes(name)) {
      fail(`unknown argument: ${token}`);
    }
    if (seen.has(name)) fail(`duplicate argument: ${name}`);
    seen.add(name);

    if (name === "--apply") {
      apply = true;
      i += 1;
    } else if (name === "--yes") {
      yes = true;
      i += 1;
    } else if (name === "--help") {
      help = true;
      i += 1;
    } else {
      const parsed = takeValue(argv, i, name);
      if (name === "--project-ref") projectRef = parsed.value;
      else mode = parsed.value;
      i += parsed.consumed;
    }
  }

  if (help) {
    if (argv.length !== 1) fail("--help cannot be combined with other arguments");
    return { help: true, authorizedWrite: false, mode: null, projectRef: null };
  }

  if (modes && (!mode || !modes.includes(mode))) {
    fail(`choose --mode from: ${modes.join(", ")}`);
  }

  const isWrite = writeModes.includes(mode) || (!modes && apply);
  if (!isWrite) {
    if (apply || yes || projectRef) fail("write authorization flags are invalid for a read-only mode");
    return { help: false, authorizedWrite: false, mode, projectRef: null };
  }

  if (!apply || !yes || !projectRef) {
    fail(`${operation} requires --apply --yes --project-ref ${expectedProjectRef}`);
  }
  if (projectRef !== expectedProjectRef) fail("project ref does not match the authoritative target");

  return { help: false, authorizedWrite: true, mode, projectRef };
}

export function productionUsage({ script, modes = [] }) {
  const modePart = modes.length ? ` --mode <${modes.join("|")}>` : "";
  return [
    `Usage: node ${script}${modePart}`,
    `Writes additionally require: --apply --yes --project-ref ${PRODUCTION_PROJECT_REF}`,
    "--help is always side-effect free.",
  ].join("\n");
}
