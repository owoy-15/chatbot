export async function GET() {
  return new Response(JSON.stringify({ message: "Use POST with { prompt }" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
