import { useEffect, useState } from "react";

export function DebugBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const [info, setInfo] = useState<string>("");
  useEffect(() => {
    try {
      const authLoggedIn = localStorage.getItem("auth.loggedIn");
      const authToken = localStorage.getItem("auth.token");
      const tournamentConfig = localStorage.getItem("tournament.config");
      setInfo(
        JSON.stringify(
          {
            authLoggedIn,
            hasToken: !!authToken,
            hasTournament: !!tournamentConfig,
          },
          null,
          2
        )
      );
    } catch (e: any) {
      setError(e);
    }
  }, []);
  if (error) {
    return <pre style={{ color: "red" }}>Boundary Error: {error.message}</pre>;
  }
  return (
    <>
      <pre
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          background: "#111",
          color: "#0f0",
          padding: 8,
          fontSize: 10,
          maxWidth: 240,
        }}
      >
        {info}
      </pre>
      {children}
    </>
  );
}
