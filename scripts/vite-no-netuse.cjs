const childProcess = require("node:child_process");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");

function createStubProcess(callback) {
  const stub = new EventEmitter();
  stub.stdout = new PassThrough();
  stub.stderr = new PassThrough();
  stub.kill = () => true;
  process.nextTick(() => {
    const error = new Error("disabled net use probe");
    if (typeof callback === "function") {
      callback(error, "", "");
    }
    stub.emit("close", 1);
    stub.emit("exit", 1);
  });
  return stub;
}

function isNetUse(command, args = []) {
  if (typeof command === "string" && command.trim().toLowerCase() === "net use") {
    return true;
  }

  if (typeof command === "string") {
    const normalized = command.replaceAll("/", "\\").toLowerCase();
    if (normalized.endsWith("\\net.exe") || normalized === "net" || normalized === "net.exe") {
      return Array.isArray(args) && args.length > 0 && String(args[0]).toLowerCase() === "use";
    }
  }

  return false;
}

const originalExec = childProcess.exec;
const originalExecFile = childProcess.execFile;

childProcess.exec = function patchedExec(command, options, callback) {
  const resolvedCallback = typeof options === "function" ? options : callback;
  if (isNetUse(command)) {
    return createStubProcess(resolvedCallback);
  }
  return originalExec.call(this, command, options, callback);
};

childProcess.execFile = function patchedExecFile(file, args, options, callback) {
  const normalizedArgs = Array.isArray(args) ? args : [];
  const resolvedCallback =
    typeof args === "function"
      ? args
      : typeof options === "function"
        ? options
        : callback;

  if (isNetUse(file, normalizedArgs)) {
    return createStubProcess(resolvedCallback);
  }

  return originalExecFile.call(this, file, args, options, callback);
};
