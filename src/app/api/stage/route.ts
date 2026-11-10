import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Auth check — only paid users can call this
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user has enough credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining")
    .eq("id", user.id)
    .single();

  if (!profile || profile.credits_remaining <= 0) {
    return NextResponse.json(
      { error: "You have no credits remaining. Please upgrade your plan." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const roomType = formData.get("room_type") as string;
    const style = formData.get("style") as string;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const keysStr = process.env.MNML_API_KEYS || process.env.MNML_API_KEY;
    const apiKeys = keysStr ? keysStr.split(",").map(k => k.trim()).filter(Boolean) : [];

    // If no API key is provided, return a mock response for testing the UI
    if (apiKeys.length === 0) {
      console.warn("No MNML_API_KEYS found. Returning mock response.");
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Use a guaranteed existing image as a mock response
      const mockImage = `/demo/living-room-modern.c831fe91.webp`; 
      
      return NextResponse.json({ 
        success: true, 
        staged_image_url: mockImage,
        message: "Mock response generated. Add MNML_API_KEYS to .env.local for real results."
      });
    }

    // Prepare request for MNML.ai ArchDiffusion v4.4-Lite
    const formattedRoom = (roomType || "living-room").replace(/_/g, " ");
    const formattedStyle = style || "modern";
    const roomStyle = formattedStyle.charAt(0).toUpperCase() + formattedStyle.slice(1);

    // Randomize array to load balance across keys
    const shuffledKeys = apiKeys.sort(() => 0.5 - Math.random());

    let stagedImageUrl: string | null = null;
    let lastError = "Failed to generate image.";

    for (const apiKey of shuffledKeys) {
      try {
        const mnmlFormData = new FormData();
        mnmlFormData.append("image", image);
        // v4.4-Lite only needs: image, prompt, expert_name
        mnmlFormData.append("prompt", `Beautiful ${roomStyle} interior design of a ${formattedRoom}, fully furnished, photorealistic`);
        mnmlFormData.append("expert_name", "interior");
        mnmlFormData.append("render_style", "photoreal");
        mnmlFormData.append("geometry", "precise");

        const response = await fetch("https://api.mnml.ai/v1/archDiffusion-v44-lite", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
          },
          body: mnmlFormData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`MNML API Error (Key ${apiKey.substring(0, 6)}...):`, response.status, errorData);
          lastError = errorData.message || "Failed to generate image with this key.";
          continue; // Try the next key
        }

        const data = await response.json();
        
        // The exact response structure depends on MNML.ai, but typically includes a result URL
        // e.g., { result: "https://..." } or { image_url: "https://..." }
        stagedImageUrl = data.result || data.image_url || data.url;

        if (data.id && !stagedImageUrl) {
          // Poll for status
          let isProcessing = true;
          let attempts = 0;
          let pollFailed = false;

          while (isProcessing && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            let statusRes;
            try {
              statusRes = await fetch(`https://api.mnml.ai/v1/status/${data.id}`, {
                headers: { "Authorization": `Bearer ${apiKey}` },
                signal: controller.signal
              });
              clearTimeout(timeoutId);
            } catch (pollErr) {
              clearTimeout(timeoutId);
              console.error(`Polling fetch error (attempt ${attempts + 1}):`, pollErr);
              attempts++;
              continue;
            }

            if (!statusRes.ok) {
              attempts++;
              continue;
            }
            
            const statusData = await statusRes.json();
            const isSuccess = statusData.status === "success" || statusData.status === "succeeded";
            if (isSuccess && statusData.message && statusData.message.length > 0) {
              stagedImageUrl = statusData.message[0];
              isProcessing = false;
            } else if (statusData.status === "failed" || statusData.status === "error") {
              pollFailed = true;
              lastError = "Image generation failed during polling.";
              break;
            }
            attempts++;
          }
          
          if (pollFailed || !stagedImageUrl) {
            continue; // Polling failed or timed out, try the next key
          }
        }

        if (stagedImageUrl) {
          break; // Success! Exit the loop and stop trying keys.
        }
      } catch (err) {
        console.error(`Fetch error with key ${apiKey.substring(0, 6)}...:`, err);
        lastError = err instanceof Error ? err.message : "Network error";
        continue; // Try the next key
      }
    }

    if (!stagedImageUrl) {
      return NextResponse.json({ error: lastError }, { status: 500 });
    }

    // Save to staging history and deduct 1 credit (only if user is logged in)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("stagings").insert({
        user_id: user.id,
        before_url: "", // local file — no public URL
        after_url: stagedImageUrl,
        room_type: roomType,
        style,
      });

      // Deduct 1 credit
      await supabase.rpc("decrement_credits", { user_id_input: user.id });
    }

    return NextResponse.json({ success: true, staged_image_url: stagedImageUrl });
  } catch (error) {
    console.error("Error processing staging request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
