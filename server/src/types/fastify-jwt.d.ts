import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; username: string }; // payload type is used for signing and verifying
    user: { sub: string; username: string }; // user type is return type of `request.user` object
  }
}
