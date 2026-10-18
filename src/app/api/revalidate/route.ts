import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret")
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { paths, tags } = (await req.json()) as { paths?: string[]; tags?: string[] }

  if (paths) {
    for (const path of paths) {
      revalidatePath(path)
    }
  }

  if (tags) {
    for (const tag of tags) {
      revalidateTag(tag)
    }
  }

  return NextResponse.json({ revalidated: true, paths, tags })
}
