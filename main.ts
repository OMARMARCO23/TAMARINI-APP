Deno.serve((_req: Request) => {
  return new Response("Hello from Tamrini! 📐", {
    headers: { "Content-Type": "text/plain" },
  });
});
