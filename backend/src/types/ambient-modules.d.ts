// Ambient module declarations for local imports used in server.ts and elsewhere.
// These map the local .ts route/middleware modules to `any` so the TypeScript
// language server does not complain about missing type declarations (TS2307).

declare module './src/routes/auth.routes' {
  const value: any;
  export default value;
}

declare module './src/routes/user.routes' {
  const value: any;
  export default value;
}

declare module './src/routes/identity.routes' {
  const value: any;
  export default value;
}

declare module './src/routes/resource.routes' {
  const value: any;
  export default value;
}

declare module './src/routes/application.routes' {
  const value: any;
  export default value;
}

declare module './src/routes/notification.routes' {
  const value: any;
  export default value;
}

// Middleware
declare module './src/middleware/error.middleware' {
  const value: any;
  export = value;
}

declare module './src/middleware/rateLimiter.middleware' {
  const value: any;
  export = value;
}

declare module './src/middleware/auth.middleware' {
  const value: any;
  export = value;
}
