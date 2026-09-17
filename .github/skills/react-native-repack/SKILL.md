---
name: react-native-repack
description: >
  Guidelines for configuring, using, reviewing, and troubleshooting
  Re.Pack 5 with Rspack as the bundler for React Native applications.
  Use this skill whenever a React Native project requires Re.Pack,
  Rspack, Metro replacement, bundle configuration, code splitting,
  or Re.Pack build and development-server behavior.
---

# React Native Re.Pack

Use this skill when a React Native project uses or is required to use
Re.Pack as its bundler.

Re.Pack is a replacement for Metro that enables React Native applications
to use Rspack or webpack and their ecosystem.

## 1. Version and compatibility

Before configuring Re.Pack:

- inspect the installed React Native version;
- inspect the Node.js version;
- inspect the installed Re.Pack version;
- prefer configuration appropriate to the installed major version;
- do not copy configuration from older Re.Pack versions without verifying
  compatibility.

For Re.Pack 5:

- Node.js must be at least version 20;
- React Native must be at least version 0.77;
- prefer Rspack unless the project has a documented reason to require webpack.

## 2. Migration from Metro

For an existing React Native project, prefer the official Re.Pack
initialization/migration tooling before manually recreating configuration.

After migration:

- inspect every generated or modified file;
- preserve existing React Native native configuration unless Re.Pack
  requires a documented change;
- verify both development and native build behavior;
- do not keep Metro-specific configuration merely because it existed
  previously if Re.Pack no longer requires it.

Do not consider migration complete merely because dependencies installed
successfully.

## 3. Configuration

Keep bundler configuration explicit and reviewable.

When changing Re.Pack/Rspack configuration:

- make the smallest change necessary;
- document non-obvious loaders, plugins, aliases and resolution behavior;
- avoid webpack/Rspack customizations without a concrete requirement;
- prefer Re.Pack defaults when they satisfy the application requirements;
- verify configuration against the installed Re.Pack version.

Do not introduce Module Federation simply because Re.Pack supports it.

## 4. Development server

Use the React Native Community CLI to start the Re.Pack development server.

The development workflow must support:

- source compilation through Re.Pack;
- Fast Refresh during development;
- useful source maps and error reporting;
- communication between the native application and development server.

When troubleshooting, distinguish between:

- native Android/iOS build failures;
- Re.Pack/Rspack compilation failures;
- development-server connectivity failures;
- runtime JavaScript failures.

Do not treat all failures as bundler failures.

## 5. Native builds

Re.Pack must integrate with the normal React Native Android and iOS build
processes.

After configuration changes, verify:

- Android debug build;
- Android release bundling when relevant;
- iOS build when an iOS environment is available;
- application startup;
- development-server connectivity in debug mode.

A successful Rspack compilation alone does not prove that the native
application works.

## 6. Bundle behavior

Keep application bundling simple until a requirement justifies additional
complexity.

Evaluate code splitting only when it provides a concrete benefit.

Module Federation is an architectural capability, not a default requirement.
Introduce it only through an explicit architectural decision.

When introducing dynamic chunks or remote modules, document:

- loading behavior;
- failure behavior;
- version compatibility;
- shared dependencies;
- deployment implications.

## 7. Review guidance

When reviewing Re.Pack-related changes, verify:

1. compatibility with the installed React Native and Re.Pack versions;
2. whether the change is actually required;
3. whether Re.Pack defaults could solve the same problem;
4. Android/iOS implications;
5. development and release behavior;
6. unnecessary bundler complexity;
7. Metro assumptions that may remain accidentally in the project.

## 8. Testing and validation

After introducing or changing Re.Pack:

- start the Re.Pack development server;
- compile the application;
- launch the native application;
- verify that JavaScript is loaded correctly;
- verify Fast Refresh;
- exercise at least one source-code change;
- verify that errors are surfaced with useful diagnostics.

When release configuration changes, also verify a release bundle/build.

## Definition of Done

Re.Pack work is complete only when:

- configuration matches the installed Re.Pack version;
- the development server starts successfully;
- the React Native application builds and launches;
- source changes are reflected correctly during development;
- relevant native platforms have been validated;
- no unnecessary bundler complexity was introduced;
- architectural capabilities such as Module Federation are not introduced
  without an explicit requirement or ADR.
