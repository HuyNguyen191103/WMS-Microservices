import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projects = {
  "api-gateway": ["auth.proto", "wms.proto"],
  "wms-service": ["wms.proto"],
};

const projectName = process.argv[2];
const protoFiles = projects[projectName];

if (!protoFiles) {
  console.error(
    `Unknown project "${projectName ?? ""}". Expected one of: ${Object.keys(projects).join(", ")}`,
  );
  process.exit(1);
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = resolve(repositoryRoot, projectName);
const protoRoot = resolve(repositoryRoot, "proto");
const generatedRoot = resolve(projectRoot, "src", "generated");

if (!projectRoot.startsWith(`${repositoryRoot}${sep}`)) {
  throw new Error(`Refusing to generate outside repository: ${projectRoot}`);
}

const protocScript = join(projectRoot, "node_modules", "protoc", "protoc.cjs");
const pluginExecutable = join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32"
    ? "protoc-gen-ts_proto.cmd"
    : "protoc-gen-ts_proto",
);

if (!existsSync(protocScript) || !existsSync(pluginExecutable)) {
  console.error(
    `Missing codegen dependencies in ${projectName}. Run npm install first.`,
  );
  process.exit(1);
}

rmSync(generatedRoot, { recursive: true, force: true });
mkdirSync(generatedRoot, { recursive: true });

const options = [
  "nestJs=true",
  "addGrpcMetadata=true",
  "forceLong=string",
  "env=node",
  "snakeToCamel=keys",
].join(",");

const result = spawnSync(
  process.execPath,
  [
    protocScript,
    `--plugin=protoc-gen-ts_proto=${pluginExecutable}`,
    `--ts_proto_out=${generatedRoot}`,
    `--ts_proto_opt=${options}`,
    `--proto_path=${protoRoot}`,
    ...protoFiles,
  ],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
