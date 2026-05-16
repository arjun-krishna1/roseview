import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ElevenLabsError = {
  detail?: {
    status?: string;
    message?: string;
  };
};

const readElevenLabsError = async (response: Response) => {
  try {
    const body = (await response.json()) as ElevenLabsError;
    return {
      status: body.detail?.status ?? "elevenlabs_error",
      message: body.detail?.message ?? "ElevenLabs rejected the signed URL request.",
    };
  } catch {
    return {
      status: "elevenlabs_error",
      message: "ElevenLabs rejected the signed URL request.",
    };
  }
};

export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ agentId });
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    {
      cache: "no-store",
      headers: {
        "xi-api-key": apiKey,
      },
    },
  );

  if (!response.ok) {
    const error = await readElevenLabsError(response);

    return NextResponse.json({
      error: `ElevenLabs signed URL failed: ${error.status} - ${error.message}`,
      elevenLabsStatus: response.status,
    }, { status: response.status });
  }

  const body = (await response.json()) as { signed_url?: string };

  if (!body.signed_url) {
    return NextResponse.json({ error: "ElevenLabs did not return a signed URL." }, { status: 502 });
  }

  return NextResponse.json({ signedUrl: body.signed_url });
}
